import {
  ChangeDetectionStrategy,
  linkedSignal,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ColConfig, RowAction, TableComponent } from '@shared/components/table/table.component';
import { FormTitleComponent } from '@shared/layouts/form-title/form-title.component';
import { AccordionComponent } from '@shared/components/accordion/accordion.component';
import { HeaderWrapComponent } from '@shared/layouts/header-wrap/header-wrap.component';
import { FullpageAlertsComponent } from '@shared/layouts/fullpage-alerts/fullpage-alerts.component';
import { REGISTER, AccountType, ACCOUNT_TYPES, FormStepType, UserSteps } from '@constants/register';
import { DynamicFieldDirective } from '@shared/utils/dynamic-field.directive';
import { UtilityService } from '@shared/services/utility.service';
import { ApiService } from '@shared/services/api.service';
import { matchPassword } from '@shared/utils/password-validations';
import { AdressPipe } from '@shared/utils/address.pipe';
import { PhonePipe } from '@shared/utils/phone.pipe';
import { formatPhoneInObj, sanitizeObj, sanitizePhone } from '@shared/utils/utility.funtions';
import { ToastrService } from 'ngx-toastr';
import { FacilityContact } from 'app/pages/home/settings/settings.component';
import { AlertService } from '@shared/services/alert.service';
import { SeperatorComponent } from '@shared/components/seperator/seperator.component';

const NPI_ERROR_MSG = `One or more pieces of information entered do not match our records. Please try again or contact us for additional assistance.`;

@Component({
  selector: 'app-register',
  imports: [
    RouterLink,
    IconComponent,
    TableComponent,
    AccordionComponent,
    FormTitleComponent,
    ReactiveFormsModule,
    HeaderWrapComponent,
    DynamicFieldDirective,
    FullpageAlertsComponent,
    SeperatorComponent
  ],
  providers: [AdressPipe, PhonePipe],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  readonly content = REGISTER.content;
  readonly userTypes = ACCOUNT_TYPES;
  readonly forms = REGISTER.forms;
  private router = inject(Router);
  private util = inject(UtilityService);
  private api = inject(ApiService);
  private toast = inject(ToastrService);
  private alert = inject(AlertService);
  prescriberSet = signal<boolean>(false);
  errorMsg = signal('');
  stepper = computed(() => {
    const steps = REGISTER.steps[this.selectedType()];
    return {
      complete: steps.indexOf(this.currentStep()),
      steps: steps?.slice(0, -1).map((_, i) => i + 1)
    };
  });

  facilityCols: ColConfig[] = [
    { key: 'PracticeGroup', title: 'Practice Name' },
    { key: 'Address', pipeName: 'address', isArray: true },
    { key: 'Phone', pipeName: 'phone' },
    { key: 'Fax', pipeName: 'phone' },
    { key: 'Email' },
    { key: 'action', title: 'Edit / Delete' }
  ];
  facilityRowActions: RowAction[] = [
    { type: 'edit', name: 'Edit' },
    { type: 'delete', name: 'Delete' }
  ];
  prescriberCols: ColConfig[] = [
    { key: 'npi', title: 'Prescriber NPI #' },
    { key: 'prescriber', title: 'Name' },
    { key: 'action', title: 'Actions' }
  ];

  prescriberRowActions: RowAction[] = [{ type: 'delete', name: 'Delete' }];
  selectedFacility = linkedSignal<Facility[]>(() => (this.selectedType() ? [] : [])); // Resets selectedFacility if type changes
  prescriberFacility: Facility[] = [];
  updateData: Facility | null = null;
  rowIndex = 0;
  prescriberId: number | null = null;

  prescribersWithFacility = signal<PrescriberWithFacility[]>([]); // For Other Registration
  groups = this.util.generateForm(this.forms);
  selectedType = signal<AccountType>(this.userTypes[0]);
  currentStep = signal<FormStepType>(REGISTER.steps[this.selectedType()][0]);
  get isInvalid() {
    if (this.currentStep() === 'accountType') {
      return !this.selectedType();
    } else if (this.currentStep() === 'user') {
      const userGroups = this.groups[this.selectedType()].user;
      return Object.keys(userGroups).some(k => userGroups[k as keyof UserSteps<unknown>].invalid);
    } else if (this.currentStep() === 'facility') {
      if (this.selectedType() === 'other') {
        return (
          !this.prescribersWithFacility().length ||
          ![...this.selectedFacilitiesMap.values()].some(x => x.length)
        );
      }
      return !this.selectedFacility().length;
    } else if (this.currentStep() === 'prescriber') {
      return !this.prescribersWithFacility().length;
    }
    return false;
  }
  constructor() {
    // this.groups.prescriber.user.step3.addValidators(matchPassword('password', 'confirmPassword'));
    this.groups.other.user.step3.addValidators(matchPassword('password', 'confirmPassword'));
  }

  onRowAction(event: { type: string; data: unknown }) {
    const data = event.data as Facility;
    if (event.type === 'edit') {
      const facilityForm = this.groups?.[this.selectedType()]?.facility;
      const address = data.Address && data.Address.length ? data.Address[0] : {};
      facilityForm.patchValue(
        formatPhoneInObj({
          practiceName: data.PracticeGroup,
          phone: data.Phone ?? null,
          fax: data.Fax ?? null,
          email: data.Email,
          address1: address.Line1,
          address2: address.Line2,
          city: address.City,
          state: address.State,
          zip: address.Zipcode
        })
      );
      this.updateData = data;
    } else if (event.type === 'delete') {
      this.alert.confirm(`Are you sure you want to remove this facility ?`).then(confirmed => {
        if (confirmed) this.deleteFacility(data);
      });
    }
  }

  deleteFacility(row: Facility) {
    this.selectedFacility.update(x => x.filter(d => d !== row));
    this.prescribersWithFacility.update(prescribers =>
      prescribers.map(prescriber => {
        const facilities = prescriber.facilities.filter(x => x !== row);
        const selected = this.selectedFacilitiesMap.get(prescriber.prescriberId) || [];
        this.selectedFacilitiesMap.set(
          prescriber.prescriberId,
          selected.filter(x => x !== row)
        );
        return { ...prescriber, facilities };
      })
    );
  }

  onPrescriberRowActions(event: { type: string; data: unknown }) {
    if (event.type === 'delete') {
      this.alert.confirm(`Are you sure you want to remove this prescriber ?`).then(confirmed => {
        if (confirmed) this.prescribersWithFacility.update(x => x.filter(d => d !== event.data));
      });
    }
  }

  selectedFacilitiesMap = new Map<number, Facility[]>();

  addSelectedFacility(data: Facility[], prescriber: PrescriberWithFacility) {
    this.selectedFacilitiesMap.set(prescriber.prescriberId, data);
  }

  addFacility() {
    const facilityForm = this.groups?.[this.selectedType()]?.facility;
    if (facilityForm?.valid) {
      const formData = facilityForm.value as facilityForm;
      const newFacility: Facility = sanitizeObj({
        PracticeGroup: formData.practiceName || '',
        Email: formData.email ?? '',
        Fax: formData.fax || null,
        OfficeName: formData.practiceName || '',
        Rank: 1,
        Id: null,
        Phone: formData.phone || null,
        PhoneType: 'Office',
        Extension: null,
        Address: [
          {
            Line1: formData.address1 || '',
            Line2: formData.address2 || '',
            City: formData.city || '',
            State: formData.state || '',
            Zipcode: formData.zip || ''
          }
        ],
        Contacts: []
      });
      this.updateNewFacility(newFacility);
      facilityForm.reset();
    } else {
      console.error('Facility form is invalid or undefined.');
    }
  }

  updateNewFacility(newFacility: Facility) {
    this.selectedFacility.update(x => [newFacility, ...x]);
    this.prescribersWithFacility.update(prescribers =>
      prescribers.map(prescriber => {
        const facilities = [newFacility, ...prescriber.facilities];
        const selected = this.selectedFacilitiesMap.get(prescriber.prescriberId) || [];
        this.selectedFacilitiesMap.set(prescriber.prescriberId, [newFacility, ...selected]);
        return { ...prescriber, facilities };
      })
    );
  }
  cancelUpdationInFacility() {
    const facilityForm = this.groups?.[this.selectedType()]?.facility;
    facilityForm?.reset();
    this.updateData = null;
  }

  updateFacilityForData(index: number) {
    const facilityForm = this.groups?.[this.selectedType()]?.facility;
    if (facilityForm !== undefined && facilityForm.valid) {
      const formData = facilityForm.value as facilityForm;
      const updatedFacility: Facility = sanitizeObj({
        PracticeGroup: formData.practiceName || '',
        Email: formData.email || '',
        Fax: formData.fax || null,
        OfficeName: formData.practiceName || '',
        Rank: 3, // Default rank or logic for dynamic rank
        Id: this.selectedFacility()[index].Id, // Retain existing ID
        Phone: formData.phone || null,
        PhoneType: 'Office', // Default phone type
        Extension: null, // Default extension
        Address: [
          {
            Line1: formData.address1 || '',
            Line2: formData.address2 || '',
            City: formData.city || '',
            State: formData.state || '',
            Zipcode: formData.zip || ''
          }
        ],
        Contacts: this.selectedFacility()[index].Contacts || [] // Retain existing contacts
      });
      if (this.updateData !== null) {
        this.deleteFacility(this.updateData);
        this.updateNewFacility(updatedFacility);
      }
      this.updateData = null;
      facilityForm.reset();
    } else {
      console.error('Facility form is invalid or undefined.');
    }
  }

  handleNext() {
    const arr = REGISTER.steps[this.selectedType()];
    this.currentStep.update(c => arr[arr.indexOf(c) + 1]);
  }

  // handleSaveAndRegister() {
  //   console.log('final sumbit');
  //   const accountType = this.selectedType();
  //   // const step1Form = this.groups?.[accountType]?.user?.step1;
  //   const step2Form = this.groups?.[accountType]?.user?.step2;
  //   const step3Form = this.groups?.[accountType]?.user?.step3;

  //   const userPayload: User = {
  //     Username: '',
  //     EmailAddress: '',
  //     Password: '',
  //     PasswordConfirmation: '',
  //     // PrescriberId: (step1Form?.value?.prescriberNPI
  //     //   ? Number(step1Form?.value?.prescriberNPI)
  //     //   : undefined) as number,
  //     IsNewUser: true,
  //     Role: { RolePkId: 4 },
  //     UserContactDetails: []
  //   };

  //   if (step2Form?.valid) {
  //     const { firstName, lastName, phone, email, fax } = step2Form.value as Step2FormValues;
  //     userPayload.EmailAddress = email;
  //     userPayload.UserContactDetails?.push(
  //       sanitizeObj({
  //         FirstName: firstName,
  //         LastName: lastName,
  //         Phone: phone,
  //         Email: email,
  //         Fax: fax
  //       })
  //     );
  //   }

  //   if (step3Form?.valid) {
  //     const { username, password, confirmPassword } = step3Form.value as Step3FormValues;
  //     userPayload.Username = username;
  //     userPayload.Password = password;
  //     userPayload.PasswordConfirmation = confirmPassword;
  //   }

  //   console.log('Final User Payload:', userPayload);

  //   // Make API call to create user first
  //   this.api.call.post<User, responsePayload>('account', userPayload).subscribe({
  //     next: res => {
  //       console.log('User Created Successfully:', res);
  //       userPayload.MasterAccountId = res.Payload.masterPortalAccountId;
  //       userPayload.IsNewUser = false;

  //       userPayload.UserContactDetails = userPayload?.UserContactDetails?.map(contact => ({
  //         ...contact,
  //         Id: Number(res.Payload.contactId)
  //       }));
  //       // After user creation, make API calls for each selected facility
  //       this.handleFacilityRegistration(userPayload);
  //     },
  //     error: err => {
  //       console.error('Error:', err);
  //     }
  //   });
  // }
  // async handleFacilityRegistration(userPayload: User) {
  //   const selectedFacilities: Facility[] = this.selectedFacility();
  //   const finalFacilityPayloads: Facility[] = [];
  //   for (const facility of selectedFacilities) {
  //     const sanitizedPhone = sanitizePhone(facility.Phone ?? '');
  //     const sanitizedFax = sanitizePhone(facility.Fax ?? '');

  //     const facilityPayload = {
  //       ...userPayload,
  //       IsNewUser: false,
  //       MasterAccountId: userPayload.MasterAccountId,
  //       MasterFacility: {
  //         PracticeGroup: facility.PracticeGroup || userPayload.MasterFacility?.PracticeGroup,
  //         Email: facility.Email || userPayload.MasterFacility?.Email,
  //         Fax: facility.Fax ?? '',
  //         OfficeName: facility.OfficeName || userPayload.MasterFacility?.OfficeName,
  //         Rank: facility.Rank || userPayload.MasterFacility?.Rank,
  //         Id: facility.Id || userPayload.MasterFacility?.Id || null,
  //         Phone: facility.Phone ?? '',
  //         PhoneType: 'Office',
  //         Extension: null,
  //         Address: facility.Address || userPayload.MasterFacility?.Address,
  //         Contacts: facility.Contacts || userPayload.MasterFacility?.Contacts
  //       }
  //     };

  //     try {
  //       const res = await this.api.call
  //         .post<User, responsePayload>('account', facilityPayload)
  //         .toPromise();
  //       console.log(res?.Parameters?.MasterFacility?.Address);
  //       const finalfacilitypayload = {
  //         PracticeGroup: res?.Parameters.MasterFacility?.PracticeGroup,
  //         Email: res?.Parameters.MasterFacility?.Email,
  //         Fax: sanitizedFax,
  //         OfficeName: res?.Parameters.MasterFacility?.OfficeName,
  //         Rank: res?.Parameters.MasterFacility?.Rank,
  //         // Id: res?.Parameters.MasterFacility?.Id,
  //         Id: res?.Payload?.facilityId,
  //         Phone: sanitizedPhone,
  //         PhoneType: 'Office',
  //         Extension: null,
  //         Address: res?.Parameters.MasterFacility?.Address,
  //         Contacts: facility.Contacts
  //       };

  //       finalFacilityPayloads.push(finalfacilitypayload);
  //       console.log('Facility Created Successfully:', finalfacilitypayload);
  //     } catch (err) {
  //       console.error('Error creating facility:', err);
  //     }
  //   }
  //   this.finalFacilityCall(finalFacilityPayloads, userPayload);
  // }

  // finalFacilityCall(finalFacilityPayloads: Facility[], userPayload: User) {
  //   console.log(finalFacilityPayloads);
  //   const requests = this.prescribersWithFacility().map(pwf => {
  //     // DO NOT REMOVE
  //     // const aggregatedFacilities = pwf.selectedFacilities
  //     //   .filter(sf => finalFacilityPayloads.find(y => y.Id === sf))
  //     //   .map(ff => {
  //     //     return { ...ff, ...finalFacilityPayloads.find(y => y.Id === ff.Id) };
  //     //   });
  //     const finalPayload: User = {
  //       Username: userPayload.Username,
  //       EmailAddress: userPayload.EmailAddress,
  //       Password: userPayload.Password,
  //       PasswordConfirmation: userPayload.PasswordConfirmation,
  //       // Check with aggregatedFacilities defined above
  //       Facilities: pwf.selectedFacilities.map(x => {
  //         return {
  //           ...x,
  //           PhoneType: undefined,
  //           Address: x?.Address ? x.Address[0] : {}
  //         };
  //       }) as Facility[],
  //       MasterAccountId: userPayload.MasterAccountId,
  //       PrescriberId: pwf.prescriberId,
  //       IsNewUser: false
  //       // Role: { RolePkId: 4 }
  //       // UserContactDetails: userPayload.UserContactDetails
  //     };
  //     console.log(
  //       `Final Facility Call for prescriber [${pwf.prescriberId}] - ${pwf.prescriber}`,
  //       finalPayload
  //     );
  //     return this.api.call.post<User, responsePayload>('account', finalPayload);
  //   });
  //   forkJoin([...requests]).subscribe({
  //     next: results => {
  //       if (results.every(x => x.Status === 'SUCCESS')) {
  //         this.handleNext();
  //       } else {
  //         this.toast.error(
  //           results.find(x => x.Errors && x.Errors[0])?.Errors[0]?.Message ??
  //             'Something went wrong..!'
  //         );
  //       }
  //     }
  //   });
  //   // .subscribe({
  //   //   next: res => {
  //   //     if (res.Status === 'SUCCESS') {
  //   //       this.handleNext();
  //   //     }
  //   //     console.log('All Facilities Registered Successfully:', res);
  //   //   },
  //   //   error: err => {
  //   //     console.error('Error during final facility registration:', err);
  //   //   }
  //   // });
  // }

  async handleSaveAndRegister() {
    console.log('final submit');
    const accountType = this.selectedType();
    const step1Form = this.groups?.[accountType]?.user?.step1;
    const step2Form = this.groups?.[accountType]?.user?.step2;
    const step3Form = this.groups?.[accountType]?.user?.step3;

    // Step 1: Create new user
    const userPayload: User = {
      Username: '',
      EmailAddress: '',
      Password: '',
      PasswordConfirmation: '',
      PrescriberId: (step1Form?.value?.prescriberNPI
        ? Number(step1Form?.value?.prescriberNPI)
        : undefined) as number,
      IsNewUser: true,
      Role: { RolePkId: 4 },
      UserContactDetails: []
    };

    if (step2Form?.valid) {
      const { firstName, lastName, phone, email, fax } = step2Form.value as Step2FormValues;
      userPayload.EmailAddress = email;
      userPayload.UserContactDetails?.push(
        sanitizeObj({
          FirstName: firstName,
          LastName: lastName,
          Phone: phone ?? null,
          Email: email ?? null,
          Fax: fax ?? null
        })
      );
    }

    if (step3Form?.valid) {
      const { username, password, confirmPassword } = step3Form.value as Step3FormValues;
      userPayload.Username = username;
      userPayload.Password = password;
      userPayload.PasswordConfirmation = confirmPassword;
    }

    try {
      // First API call - Create new user
      const userResponse = await this.api.call
        .post<User, responsePayload>('account', userPayload)
        .toPromise();
      console.log('User Created Successfully:', userResponse);

      // Prepare for second call - Add master facility
      userPayload.MasterAccountId = userResponse?.Payload.masterPortalAccountId;
      userPayload.IsNewUser = false;
      userPayload.UserContactDetails = userPayload.UserContactDetails?.map(contact => ({
        ...contact,
        Id: Number(userResponse?.Payload.contactId)
      }));

      // Step 2: Create master facility
      const facilityResponse = await this.handleFacilityRegistration(userPayload);
      console.log('facility' + facilityResponse.values);

      // Step 3: Map facilities to prescribers
      const finalPayload = {
        ...userPayload,
        MasterFacility: undefined,
        Facilities: facilityResponse?.map(x => {
          const obj = { ...x, Address: x.Address ? x.Address[0] : {} };
          delete obj.PhoneType;
          return obj;
        })
      } as UserForApi;

      console.log(finalPayload);
      await this.finalFacilityCall(facilityResponse, finalPayload);

      this.handleNext();
    } catch (error) {
      console.error('Error during registration process:', error);
      this.toast.error('Registration failed. Please try again.');
    }
  }

  async handleFacilityRegistration(userPayload: User): Promise<Facility[]> {
    const selectedFacilities: Facility[] = this.selectedFacility();
    const finalFacilityPayloads: Facility[] = [];
    for (const facility of selectedFacilities) {
      const sanitizedPhone = sanitizePhone(facility.Phone ?? '') || null;
      const sanitizedFax = sanitizePhone(facility.Fax ?? '') || null;
      const addressData = facility?.Address as Address[] | Address | undefined;

      const singleAddress: Address = Array.isArray(addressData)
        ? addressData[0] || {}
        : addressData || {};

      const facilityPayload: User = {
        ...userPayload,
        MasterFacility: {
          PracticeGroup: facility.PracticeGroup,
          Email: facility.Email || userPayload.EmailAddress,
          Fax: facility.Fax ?? null,
          OfficeName: facility.OfficeName || facility.PracticeGroup,
          Rank: facility.Rank || 1,
          Id: null,
          PhoneType: 'Office',
          Extension: null,
          Address: [singleAddress],
          Contacts: [],
          ...(facility.Phone ? { Phone: facility.Phone } : {})
        }
      };

      try {
        const res = await this.api.call
          .post<User, responsePayload>('account', facilityPayload)
          .toPromise();

        const createdFacility: Facility = {
          PracticeGroup: res?.Parameters.MasterFacility?.PracticeGroup,
          Email: res?.Parameters.MasterFacility?.Email,
          Fax: sanitizedFax,
          OfficeName: res?.Parameters.MasterFacility?.OfficeName,
          Rank: res?.Parameters.MasterFacility?.Rank,
          Id: res?.Payload.facilityId,
          Phone: sanitizedPhone,
          Extension: null,
          Address: [singleAddress],
          Contacts: []
        };

        finalFacilityPayloads.push(createdFacility);
        console.log('Facility Created Successfully:', createdFacility);
      } catch (err) {
        console.error('Error creating facility:', err);
        throw err; // Re-throw to stop the process
      }
    }

    return finalFacilityPayloads;
  }

  async finalFacilityCall(finalFacilities: Facility[], userPayload: UserForApi) {
    console.log(finalFacilities);
    try {
      const requests = this.prescribersWithFacility().map(prescriber => {
        // DO NOT REMOVE
        // const aggregatedFacilities = pwf.selectedFacilities
        //   .filter(sf => finalFacilityPayloads.find(y => y.Id === sf))
        //   .map(ff => {
        //     return { ...ff, ...finalFacilityPayloads.find(y => y.Id === ff.Id) };
        //   });
        // Get facilities selected for this prescriber
        const prescriberFacilities = this.selectedFacilitiesMap.get(prescriber.prescriberId) || [];

        // Map to final facility objects with IDs

        const facilitiesToAssign = prescriberFacilities.map(pf => {
          const finalFacility =
            finalFacilities.find(
              ff => ff.PracticeGroup === pf.PracticeGroup && ff.OfficeName === pf.OfficeName
            ) || pf;

          return {
            ...finalFacility,
            PhoneType: undefined,
            Address: finalFacility.Address ? finalFacility.Address[0] : {}
          };
        });

        const finalPayload: UserForApi = {
          ...userPayload,
          Facilities: facilitiesToAssign,
          PrescriberId: prescriber.prescriberId
        };

        return this.api.call.post<UserForApi, responsePayload>('account', finalPayload).toPromise();
      });

      const results = await Promise.all(requests);

      // Check for errors
      const hasErrors = results.some(result => result?.Status !== 'SUCCESS');
      if (hasErrors) {
        this.toast.error('Something went wrong..!');
      }
      console.log('All prescriber-facility mappings completed successfully');
    } catch (error) {
      console.error('Error in final facility call:', error);
      throw error;
    }
  }

  handleBack() {
    if (this.currentStep() !== 'user') {
      const arr = REGISTER.steps[this.selectedType()];
      this.currentStep.update(c => arr[arr.indexOf(c) - 1]);
    } else {
      this.router.navigate(['/login']);
    }
  }

  findPrescriber() {
    const accountType = this.selectedType();
    const step1Form = this.groups?.[accountType]?.user?.step1;
    const step2Form = this.groups?.[accountType]?.user?.step2;

    if (this.prescriberSet() === false) {
      if (step1Form.valid) {
        const formValue = step1Form.value as Step1FormValues;
        const { prescriberNPI, first: firstName, last: lastName } = formValue;
        const formattedValue = `${prescriberNPI}/${firstName}/${lastName}`;

        this.api.call
          .get<[{ Facilities: PrescriberFacility[] }]>('provider/' + formattedValue)
          .subscribe({
            next: res => {
              console.log(res.Payload[0].Facilities);
              if (res.Status === 'SUCCESS') {
                this.prescriberFacility = res.Payload[0]?.Facilities.map(facility => ({
                  PracticeGroup: facility.GroupName || '',
                  Email: facility.Email ?? '',
                  Fax: facility.Fax || '',
                  OfficeName: facility.Name || '',
                  Rank: 1,
                  Id: facility.Id || null,
                  Phone: facility.Phone || null,
                  PhoneType: 'Office',

                  Address: [
                    {
                      Line1: facility.Address1 || '',
                      Line2: facility.Address2,
                      City: facility.City || '',
                      State: facility.State || '',
                      Zipcode: `${facility.Zip || ''}${facility.ZipSuffixCode ? '-' + facility.ZipSuffixCode : ''}`
                    }
                  ],
                  Contacts: []
                }));

                step2Form?.patchValue({ firstName, lastName });
                this.prescriberSet.set(true);
                step1Form?.disable();

                console.log('Prescriber Facilities:', this.prescriberFacility);
                // this.facilityDataForAccordion.update(()=>this.prescriberFacility)
              } else {
                console.error('No facilities found in response or invalid response structure.');
              }
            },
            error: err => {
              console.error('Cannot find the prescriber:', err);
            }
          });
      } else {
        console.log('Form is invalid or undefined:', step1Form?.errors);
      }
    } else {
      step1Form?.reset();
      step1Form?.enable();
      step2Form?.reset();
      this.prescriberSet.set(false);
    }
  }
  addPrescriber() {
    const form = this.groups.other.prescriber;
    const formValue = form.value as Step1FormValues;
    const { prescriberNPI, first: firstName, last: lastName } = formValue;
    if (this.prescribersWithFacility().find(x => x.npi == prescriberNPI)) {
      this.toast.warning(`Prescriber ${firstName} ${lastName} is already added..!`);
    } else {
      const formattedValue = `${prescriberNPI}/${firstName.trim()}/${lastName.trim()}`;
      this.errorMsg.set('');
      this.api.call
        .get<[{ Id: number; Facilities: PrescriberFacility[] }]>('provider/' + formattedValue)
        .subscribe({
          next: res => {
            if (res.Status === 'SUCCESS') {
              this.prescriberId = Number(res.Payload[0]?.Id);
              const facilities = res.Payload[0]?.Facilities.map(facility => ({
                PracticeGroup: facility.GroupName || '', // Optional field
                Email: facility.Email ?? '', // Handle potential null or undefined values
                Fax: facility.Fax || '', // Provide a default value if Fax is missing
                OfficeName: facility.Name || '', // Map the name of the facility
                Rank: 1, // Assign rank if available; otherwise, default to null
                Id: facility.Id || null, // Assign ID; allow null if not provided
                Phone: facility.Phone || null, // Map the phone number
                PhoneType: 'Office', // Assign a default phone type; adjust if necessary

                Address: [
                  {
                    Line1: facility.Address1 || '', // Map Address1
                    Line2: facility.Address2, // Map Address2; allow null
                    City: facility.City || '', // Map the city
                    State: facility.State || '', // Map the state
                    Zipcode: `${facility.Zip || ''}${facility.ZipSuffixCode ? '-' + facility.ZipSuffixCode : ''}` // Combine Zip and ZipSuffixCode
                  }
                ],
                Contacts: [] // Default to an empty array unless data is available
              }));
              const obj = {
                npi: prescriberNPI,
                prescriberId: this.prescriberId,
                prescriber: `${firstName} ${lastName}`,
                facilities,
                selectedFacilities: []
              };
              this.prescribersWithFacility.update(prev => {
                const seen = new Set<string>();
                return [obj, ...prev].map(p => ({
                  ...p,
                  facilities: p.facilities.filter(f => {
                    const key = f.OfficeName ?? '';
                    return seen.has(key) ? false : seen.add(key);
                  }),
                  selectedFacilities: this.selectedFacilitiesMap.get(p.prescriberId)?.filter(f => {
                    const key = f.OfficeName ?? '';
                    return !seen.has(key) || seen.add(key);
                  })
                }));
              });
              form.reset();
            } else {
              this.errorMsg.set(NPI_ERROR_MSG);
              console.error('No facilities found in response or invalid response structure.');
            }
          },
          error: () => this.errorMsg.set(NPI_ERROR_MSG)
        });
    }
  }
}
interface Step1FormValues {
  prescriberNPI: string;
  first: string;
  last: string;
}
interface Step2FormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  fax: string | null;
}

interface responsePayload {
  masterPortalAccountId: string;
  facilityId: string | number | undefined | null;
  contactId: string;
}
interface Step3FormValues {
  username: string;
  password: string;
  confirmPassword: string;
}

// user.model.ts
export interface Role {
  RolePkId: number;
}
export interface User {
  Username: string;
  EmailAddress: string;
  Password: string;
  PasswordConfirmation: string;
  PrescriberId?: number | null;
  IsNewUser: boolean;
  Role?: Role;
  UserContactDetails?: UserContactDetail[];

  MasterAccountId?: string;
  MasterFacility?: Facility;
  Facilities?: Facility[];
}
export interface Address {
  Line1?: string;
  Line2?: string | null;
  City?: string;
  State?: string;
  Zipcode?: string;
}
export interface Facility {
  PracticeGroup?: string;
  AccountStatus?: string;
  Email?: string | null;
  Fax?: string | null;
  OfficeName?: string;
  Rank?: number | null;
  PrescriberId?: number;
  Id?: number | string | null; // Allow for null if not yet assigned
  Phone?: string | null;
  PhoneType?: string;
  Extension?: string | null;
  Address?: Address[];
  Contacts?: FacilityContact[]; // Define this as needed based on actual data structure
  FacilityContacts?: FacilityContact[];
  LinkedToAccount?: boolean;
}

export interface MasterFacilityForApi {
  PracticeGroup?: string;
  Email?: string | boolean | null;
  Fax?: string | null;
  OfficeName?: string;
  Rank?: number | null;
  Id?: number | string | null;
  Phone?: string | null;
  PhoneType?: string;
  Extension?: string | null;
  Address?: Address; // single object here!
  Contacts?: FacilityContact[];
}

export interface UserForApi extends Omit<User, 'Facilities'> {
  Facilities?: MasterFacilityForApi[];
}

export interface UserContactDetail {
  Email: string;
  FirstName: string;
  LastName: string;
  Phone: string | null;
  Fax: string | null;
  Id?: number;
}

interface facilityForm {
  practiceName: string;
  phone: string | null;
  fax: string | null;
  email: string | null;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
}

interface PrescriberFacility {
  Id: number;
  Name: string;
  GroupName: string;
  Address1: string;
  Address2: string | null;
  City: string;
  County: string | null;
  State: string;
  Phone: string;
  Fax: string;
  Email: string;
  Zip: string;
  ZipSuffixCode: string;
}
interface PrescriberWithFacility {
  npi: string;
  prescriberId: number;
  prescriber: string;
  facilities: Facility[];
  // selectedFacilities: Facility[];
}
