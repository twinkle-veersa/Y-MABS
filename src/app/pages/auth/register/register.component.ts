import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
import { REGISTER, FormStepType, UserSteps, ROLE_PK_ID, NPI_ERROR_MSG } from '@constants/register';
import { DynamicFieldDirective } from '@shared/utils/dynamic-field.directive';
import { UtilityService } from '@shared/services/utility.service';
import { ApiService } from '@shared/services/api.service';
import { matchPassword } from '@shared/utils/password-validations';
import { AddressPipe } from '@shared/utils/address.pipe';
import { PhonePipe } from '@shared/utils/phone.pipe';
import { formatPhoneInObj, sanitizeObj, sanitizePhone } from '@shared/utils/utility.functions';
import { ToastrService } from 'ngx-toastr';
import { FacilityContact } from 'app/pages/home/settings/settings.component';
import { SeperatorComponent } from '@shared/components/seperator/seperator.component';
import { firstValueFrom } from 'rxjs';

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
  providers: [AddressPipe, PhonePipe],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  readonly content = REGISTER.content;
  readonly forms = REGISTER.forms;
  private router = inject(Router);
  private util = inject(UtilityService);
  private api = inject(ApiService);
  private toast = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);
  prescriberSet = signal(false);
  stepper = computed(() => {
    const steps = REGISTER.steps;
    return {
      complete: steps.indexOf(this.currentStep()),
      steps: steps.slice(0, -1).map((_, i) => i + 1)
    };
  });

  get canFindPrescriber(): boolean {
    if (this.prescriberSet()) return true;
    const npi = String(this.groups.user.step1.get('prescriberNPI')?.value ?? '').trim();
    return npi.length === 10;
  }

  facilityCols: ColConfig[] = [
    { key: 'PracticeGroup', title: 'Practice Name' },
    { key: 'Address', pipeName: 'address', isArray: true },
    { key: 'Phone', pipeName: 'phone' },
    { key: 'Fax', pipeName: 'phone' },
    { key: 'Email' },
    { key: 'action', title: 'Actions' }
  ];
  facilityRowActions: RowAction[] = [
    { type: 'edit', name: 'Edit' },
    { type: 'delete', name: 'Delete' }
  ];
  selectedFacility = signal<Facility[]>([]);
  updateData: Facility | null = null;
  prescriberId: number | null = null;

  prescribersWithFacility = signal<PrescriberWithFacility[]>([]);
  selectedFacilitiesMap = signal(new Map<number, Facility[]>());
  groups = this.util.generateForm(this.forms);
  currentStep = signal<FormStepType>('user');

  get isInvalid() {
    if (this.currentStep() === 'user') {
      if (!this.prescriberSet()) return true;
      const userGroups = this.groups.user;
      return Object.keys(userGroups).some(k => userGroups[k as keyof UserSteps<unknown>].invalid);
    }
    if (this.currentStep() === 'facility') {
      if (!this.prescribersWithFacility().length) return true;
      const hasAccordionSelection = [...this.selectedFacilitiesMap().values()].some(x => x.length);
      const hasManual = this.selectedFacility().length > 0;
      return !hasAccordionSelection && !hasManual;
    }
    return false;
  }

  constructor() {
    this.groups.user.step3.addValidators(matchPassword('password', 'confirmPassword'));
    this.groups.user.step1.get('prescriberNPI')?.valueChanges.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  onRowAction(event: { type: string; data: unknown }) {
    const data = event.data as Facility;
    if (event.type === 'edit') {
      const facilityForm = this.groups.facility;
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
      this.deleteFacility(data);
    }
  }

  deleteFacility(row: Facility) {
    this.selectedFacility.update(x => x.filter(d => d !== row));
    this.prescribersWithFacility.update(prescribers =>
      prescribers.map(prescriber => {
        const facilities = prescriber.facilities.filter(x => x !== row);
        return { ...prescriber, facilities };
      })
    );
    this.selectedFacilitiesMap.update(map => {
      const next = new Map(map);
      for (const [id, facilities] of next) {
        next.set(
          id,
          facilities.filter(x => x !== row)
        );
      }
      return next;
    });
  }

  addSelectedFacility(data: Facility[], prescriber: PrescriberWithFacility) {
    this.selectedFacilitiesMap.update(map => {
      const next = new Map(map);
      const manuals = this.selectedFacility().filter(
        manual =>
          !data.some(
            office =>
              office.PracticeGroup === manual.PracticeGroup &&
              office.OfficeName === manual.OfficeName
          )
      );
      next.set(prescriber.prescriberId, [...data, ...manuals]);
      return next;
    });
  }

  addFacility() {
    const facilityForm = this.groups.facility;
    if (facilityForm?.valid) {
      const newFacility = this.buildFacilityFromForm(facilityForm.value as facilityForm, {
        Id: null,
        Rank: 1,
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
    this.selectedFacilitiesMap.update(map => {
      const next = new Map(map);
      for (const prescriber of this.prescribersWithFacility()) {
        const selected = next.get(prescriber.prescriberId) || [];
        next.set(prescriber.prescriberId, [newFacility, ...selected]);
      }
      return next;
    });
  }

  cancelUpdationInFacility() {
    this.groups.facility.reset();
    this.updateData = null;
  }

  updateFacilityForData() {
    const facilityForm = this.groups.facility;
    if (facilityForm !== undefined && facilityForm.valid && this.updateData !== null) {
      const updatedFacility = this.buildFacilityFromForm(facilityForm.value as facilityForm, {
        Id: this.updateData.Id ?? null,
        Rank: 3,
        Contacts: this.updateData.Contacts || []
      });
      const previous = this.updateData;
      this.selectedFacility.update(list => [
        updatedFacility,
        ...list.filter(facility => facility !== previous)
      ]);
      this.updateData = null;
      facilityForm.reset();
    } else {
      console.error('Facility form is invalid or undefined.');
    }
  }

  handleNext() {
    const arr = REGISTER.steps;
    this.currentStep.update(c => arr[arr.indexOf(c) + 1]);
  }

  async handleSaveAndRegister() {
    const step2Form = this.groups.user.step2;
    const step3Form = this.groups.user.step3;

    if (!this.prescriberId) {
      this.toast.error('Please look up your NPI before registering.');
      return;
    }

    const userPayload: User = {
      Username: '',
      EmailAddress: '',
      Password: '',
      PasswordConfirmation: '',
      PrescriberId: this.prescriberId,
      IsNewUser: true,
      Role: { RolePkId: ROLE_PK_ID },
      UserContactDetails: []
    };

    if (step2Form?.valid) {
      const { firstName, lastName, phone, email, fax } = step2Form.getRawValue() as Step2FormValues;
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
      const userResponse = await firstValueFrom(
        this.api.call.post<User, responsePayload>('account', userPayload)
      );

      userPayload.MasterAccountId = userResponse?.Payload.masterPortalAccountId;
      userPayload.IsNewUser = false;
      userPayload.UserContactDetails = userPayload.UserContactDetails?.map(contact => ({
        ...contact,
        Id: Number(userResponse?.Payload.contactId)
      }));

      const facilityResponse = await this.handleFacilityRegistration(userPayload);

      const finalPayload = {
        ...userPayload,
        MasterFacility: undefined,
        Facilities: facilityResponse?.map(x => {
          const obj = { ...x, Address: x.Address ? x.Address[0] : {} };
          delete obj.PhoneType;
          return obj;
        })
      } as UserForApi;

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
        Username: userPayload.Username,
        EmailAddress: userPayload.EmailAddress,
        Password: userPayload.Password,
        PasswordConfirmation: userPayload.PasswordConfirmation,
        IsNewUser: false,
        Role: userPayload.Role,
        UserContactDetails: userPayload.UserContactDetails,
        MasterAccountId: userPayload.MasterAccountId,
        MasterFacility: {
          PracticeGroup: facility.PracticeGroup,
          Email: facility.Email || userPayload.EmailAddress,
          Fax: sanitizedFax,
          OfficeName: facility.OfficeName || facility.PracticeGroup,
          Rank: facility.Rank || 1,
          Id: null,
          PhoneType: 'Office',
          Extension: null,
          Address: [singleAddress],
          Contacts: [],
          ...(sanitizedPhone ? { Phone: sanitizedPhone } : {})
        }
      };

      try {
        const res = await firstValueFrom(
          this.api.call.post<User, responsePayload>('account', facilityPayload)
        );

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
      } catch (err) {
        console.error('Error creating facility:', err);
        throw err;
      }
    }

    return finalFacilityPayloads;
  }

  async finalFacilityCall(finalFacilities: Facility[], userPayload: UserForApi) {
    try {
      const requests = this.prescribersWithFacility().map(prescriber => {
        const prescriberFacilities =
          this.selectedFacilitiesMap().get(prescriber.prescriberId) || [];

        const facilitiesToAssign = prescriberFacilities.map(pf => {
          const finalFacility =
            finalFacilities.find(
              ff => ff.PracticeGroup === pf.PracticeGroup && ff.OfficeName === pf.OfficeName
            ) || pf;

          return {
            ...finalFacility,
            PhoneType: undefined,
            NPI: null,
            Address: finalFacility.Address ? finalFacility.Address[0] : {}
          };
        });

        const finalPayload: UserForApi = {
          Username: userPayload.Username,
          EmailAddress: userPayload.EmailAddress,
          Password: userPayload.Password,
          PasswordConfirmation: userPayload.PasswordConfirmation,
          MasterAccountId: userPayload.MasterAccountId,
          IsNewUser: false,
          Role: userPayload.Role,
          PrescriberId: prescriber.prescriberId,
          Facilities: facilitiesToAssign
        };

        return firstValueFrom(
          this.api.call.post<UserForApi, responsePayload>('account', finalPayload)
        );
      });

      const results = await Promise.all(requests);

      const hasErrors = results.some(result => result?.Status !== 'SUCCESS');
      if (hasErrors) {
        this.toast.error('Something went wrong..!');
      }
    } catch (error) {
      console.error('Error in final facility call:', error);
      throw error;
    }
  }

  private buildFacilityFromForm(
    formData: facilityForm,
    extras: { Id: number | string | null; Rank: number; Contacts: FacilityContact[] }
  ): Facility {
    return sanitizeObj({
      PracticeGroup: formData.practiceName || '',
      Email: formData.email ?? '',
      Fax: formData.fax || null,
      OfficeName: formData.practiceName || '',
      Rank: extras.Rank,
      Id: extras.Id,
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
      Contacts: extras.Contacts
    });
  }

  private mapLookupFacilities(facilities: PrescriberFacility[]): Facility[] {
    return facilities.map(facility => ({
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
  }

  handleBack() {
    if (this.currentStep() === 'user') {
      this.resetRegistrationState();
      this.router.navigate(['/login']);
      return;
    }

    if (this.currentStep() === 'facility') {
      this.cancelUpdationInFacility();
    }

    const arr = REGISTER.steps;
    this.currentStep.set(arr[arr.indexOf(this.currentStep()) - 1]);
  }

  private resetRegistrationState() {
    const userSteps = this.groups.user;
    (Object.keys(userSteps) as (keyof UserSteps<unknown>)[]).forEach(step => {
      userSteps[step].reset();
      userSteps[step].enable();
    });
    this.groups.facility.reset();
    this.groups.facility.enable();

    this.currentStep.set('user');
    this.prescriberSet.set(false);
    this.prescriberId = null;
    this.updateData = null;
    this.prescribersWithFacility.set([]);
    this.selectedFacility.set([]);
    this.selectedFacilitiesMap.set(new Map());
  }

  findPrescriber() {
    const step1Form = this.groups.user.step1;
    const step2Form = this.groups.user.step2;

    if (this.prescriberSet()) {
      step1Form.reset();
      step1Form.enable();
      step2Form.reset();
      step2Form.enable();
      this.prescriberSet.set(false);
      this.prescriberId = null;
      this.prescribersWithFacility.set([]);
      this.selectedFacilitiesMap.set(new Map());
      this.selectedFacility.set([]);
      this.updateData = null;
      return;
    }

    const npi = String(step1Form.get('prescriberNPI')?.value ?? '').trim();

    if (!npi || npi.length !== 10) {
      this.toast.error('Please enter a valid 10-digit NPI.');
      return;
    }

    const endpoint = `provider/${npi}/firstName/lastName`;

    this.api.call
      .get<PrescriberLookupResponse[]>(endpoint, { query: { skipValidation: true } })
      .subscribe({
        next: res => {
          const prescriberData = res?.Payload?.[0];

          if (res.Status === 'SUCCESS' && prescriberData) {
            const facilities = this.mapLookupFacilities(prescriberData.Facilities ?? []);
            this.prescriberId = Number(prescriberData.Id ?? 0);

            const firstName = prescriberData.PrescriberFirstName ?? '';
            const lastName = prescriberData.PrescriberLastName ?? '';
            const phone = prescriberData.PrescriberPhone ?? '';
            const fax = prescriberData.PrescriberFax ?? '';
            const email = prescriberData.PrescriberEmail ?? '';

            this.prescribersWithFacility.set([
              {
                npi,
                prescriberId: this.prescriberId,
                prescriber: `${firstName} ${lastName}`.trim(),
                facilities
              }
            ]);

            step2Form.patchValue(
              formatPhoneInObj({
                firstName,
                lastName,
                phone,
                fax,
                email
              })
            );

            this.prescriberSet.set(true);
            step1Form.disable({ emitEvent: false });
            this.cdr.markForCheck();
          } else {
            this.toast.error(NPI_ERROR_MSG);
          }
        },
        error: () => {
          this.toast.error(NPI_ERROR_MSG);
        }
      });
  }
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
  Id?: number | string | null;
  Phone?: string | null;
  PhoneType?: string;
  Extension?: string | null;
  Address?: Address[];
  Contacts?: FacilityContact[];
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
  NPI?: string | null;
  Extension?: string | null;
  Address?: Address;
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

interface PrescriberLookupResponse {
  Id?: number;
  PrescriberFirstName?: string;
  PrescriberLastName?: string;
  PrescriberPhone?: string;
  PrescriberFax?: string;
  PrescriberEmail?: string;
  Facilities: PrescriberFacility[];
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
}
