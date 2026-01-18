import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  WritableSignal,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  ENROLLMENT_STEPS,
  PATIENT_REFERRAL,
  Tab,
  TABS,
  POPUP_CONTENT,
  EXIT_CONFIRMATION,
  E_SIGN_CONFIRMATION,
  INSURANCE_CONFIRMATION,
  VIEW_DOWNLOAD
} from '@constants/submit-patient-referral';
import { HeaderWrapComponent } from '@shared/layouts/header-wrap/header-wrap.component';
import { FormTitleComponent } from '@shared/layouts/form-title/form-title.component';
import { StepperComponent } from '@shared/layouts/stepper/stepper.component';
import { ToggleComponent } from '@shared/components/toggle/toggle.component';
import { ColConfig, TableComponent } from '@shared/components/table/table.component';
import { SelectComponent } from '@shared/components/select/select.component';
import { DynamicFieldDirective } from '@shared/utils/dynamic-field.directive';
import { UtilityService } from '@shared/services/utility.service';
import { IconComponent } from '@shared/components/icon/icon.component';
import { KeyValuePipe, NgTemplateOutlet } from '@angular/common';
import { Router } from '@angular/router';
import { RequiredComponent } from '@shared/components/required.component';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { PopupComponent } from '@shared/components/popup/popup.component';
import { FileUploadComponent } from '@shared/components/file-upload/file-upload.component';
import {
  AttachFile,
  FileUploadTableComponent
} from '@shared/components/file-upload-table/file-upload-table.component';
import { SeperatorComponent } from '@shared/components/seperator/seperator.component';
import { RadioComponent } from '@shared/components/radio/radio.component';
import { FieldConfig } from '@shared/models';
import { ApiService } from '@shared/services/api.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { AdressPipe } from '@shared/utils/address.pipe';
import { PhonePipe } from '@shared/utils/phone.pipe';
import { InputComponent } from '@shared/components/input/input.component';

import { formatDate, formatPhone, sanitizePhone } from '@shared/utils/utility.funtions';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullpageAlertsComponent } from '@shared/layouts/fullpage-alerts/fullpage-alerts.component';
import { convertToBase64 } from '@shared/utils/utility.funtions';
import { REGEX } from '@constants/regex';
import { Address } from 'app/pages/auth/register/register.component';
import { DataService } from '@shared/services/data.service';
import { CaseDetail, PatientDetails } from '../patients/case-details.model';
import { environment } from 'environments/environment';
import { PdfViewerComponent } from '@shared/components/pdf-viewer.component';
import { AlertService } from '@shared/services/alert.service';

@Component({
  selector: 'app-enrollment',
  imports: [
    HeaderWrapComponent,
    DynamicFieldDirective,
    StepperComponent,
    ToggleComponent,
    IconComponent,
    FormTitleComponent,
    TableComponent,
    SelectComponent,
    NgTemplateOutlet,
    RequiredComponent,
    ReactiveFormsModule,
    PopupComponent,
    FileUploadComponent,
    FileUploadTableComponent,
    KeyValuePipe,
    SeperatorComponent,
    RadioComponent,
    InputComponent,
    NgxExtendedPdfViewerModule,
    FullpageAlertsComponent,
    PdfViewerComponent
  ],
  providers: [AdressPipe, PhonePipe],
  templateUrl: './enrollment.component.html',
  styleUrl: './enrollment.component.scss',
  host: { '(window:beforeunload)': 'canNavigateOut($event)' },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnrollmentComponent implements OnInit, OnDestroy {
  hasUnsavedChanges = signal(false);
  forms = PATIENT_REFERRAL;
  readonly tabs = TABS;
  readonly popups = POPUP_CONTENT;
  readonly download = VIEW_DOWNLOAD;
  activeTab: Tab = this.tabs[0];
  currentStep = signal(0);
  private api = inject(ApiService);
  util = inject(UtilityService);
  data = inject(DataService);
  alert = inject(AlertService);
  private router = inject(Router);
  groups = this.util.generateForm(this.forms);
  currentTab = this.currentStep();
  selectedFacility: unknown;
  primary = 'primary';
  secondary = 'secondary';
  isPrimaryInsuranceVisible = signal(false);
  isSecondaryInsuranceVisible = signal(false);
  disableInsuranceToggle = signal(false);
  hasAlert = signal<AlertTypes | null>(null);
  eSignatureScreen = signal(false);
  docId = '';
  caseId = '';
  docuSignCaseId = signal('');
  apiCallCount = 0;
  existingPOAFiles = signal<File[]>([]);

  selectedCaseId = toSignal<string | undefined>(
    this.groups.patientInformation.existingPatient.get('selectName')!.valueChanges,
    { initialValue: undefined }
  );

  patientDetailsRs = this.api.getRs<CaseDetail>(`case/${this.api?.tokenInfo()?.acctname}`, {
    parameter: this.selectedCaseId,
    baseUrl: environment.portalv11Url
  });
  caseDetails = computed(() => this.patientDetailsRs.value()?.Payload.PatientDetails);

  canNavigateOut(e: BeforeUnloadEvent): Promise<boolean> {
    if (this.hasUnsavedChanges() && this.api.token()) {
      if (e) {
        e.preventDefault();
        return Promise.resolve(false);
      }
      return this.alert.confirm(EXIT_CONFIRMATION).then(confirmed => confirmed);
    }
    return Promise.resolve(true);
  }

  private updatePatientForm(patientDetails: PatientDetails) {
    const formGroup = this.groups.patientInformation.existingPatient;
    this.patientSignatureName.setValue(`${patientDetails.FirstName} ${patientDetails.LastName}`);

    formGroup.patchValue({
      dateOfBirth: patientDetails.DateOfBirth ? new Date(patientDetails.DateOfBirth) : null,
      email: patientDetails.Email,
      address: patientDetails.Address.Line1,
      city: patientDetails.Address.City,
      state: patientDetails.Address.State,
      zip: patientDetails.Address.PostalCode,
      prefPhone: patientDetails.MobilePhone ? 'Mobile' : 'Home',
      prefPhoneNumber: formatPhone(patientDetails.MobilePhone || patientDetails.Phone || '') || null
    });

    // Handle gender radio button safely
    if (patientDetails.Gender) {
      const genderValue =
        patientDetails.Gender === 'Female'
          ? 'F'
          : patientDetails.Gender === 'Not Asked'
            ? 'U'
            : 'M';
      formGroup.get('gender')?.setValue(genderValue);
    }
  }

  pdfBlob: Blob | null = null;

  patientName = '';
  showPdfViewer = signal<boolean>(false);

  ngOnInit() {
    window.addEventListener('message', this.handleMessage.bind(this));
  }

  downloadPdf(): void {
    this.data.caseDataRs.reload();
    if (!this.pdfBlob) {
      console.error('No PDF to download.');
      return;
    }
    const url = window.URL.createObjectURL(this.pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Patient-Referral-PYLARIFY .pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  handleMessage(event: MessageEvent) {
    if (event.data === 'closeIframe') {
      this.docuSignApiCalls();
    }
  }

  attestation = new FormControl();
  signature = new FormControl({ value: null, disabled: true });
  signatureOptions = new FormControl('docusign', Validators.required);

  patientSignSupport = new FormControl({ value: null, disabled: true });
  patientSignHealthInfo = new FormControl({ value: null, disabled: true });

  patientSignatureOptions = new FormControl('docusign', Validators.required);
  patientSignatureName = new FormControl({ value: '', disabled: true }, Validators.required);
  patientSignatureEmail = new FormControl('', [Validators.email]);

  guardianSignatureName = new FormControl('', Validators.required);
  guardianSignatureEmail = new FormControl('', [
    Validators.required,
    Validators.pattern(REGEX.email)
  ]);

  representativeConsent = new FormControl();
  representativeName = new FormControl();
  representativeSignature = new FormControl();

  attestationGroup = new FormGroup({
    guardian: new FormControl(),
    prescriberLegalContent: this.signature,
    patientSignSupport: this.patientSignSupport,
    patientSignHealthInfo: this.patientSignHealthInfo,
    signatureOptions: this.signatureOptions,
    patientSignatureOptions: this.patientSignatureOptions,
    guardianSignatureName: this.guardianSignatureName,
    guardianSignatureEmail: this.guardianSignatureEmail,
    patientSignatureName: this.patientSignatureName,
    patientSignatureEmail: this.patientSignatureEmail
  });

  guadianField: FieldConfig = {
    name: 'guardian',
    label: ' ',
    fieldType: 'radio',
    options: [
      { option: 'Upload POA documents', value: 'upload-poa' },
      {
        option: 'Lantheus Link to reach out to obtain POA Documents',
        value: 'reach-out'
      }
    ]
  };

  signOptions = [
    { value: 'docusign', option: 'E-Sign the enrollment form via DocuSign' },
    { value: 'download', option: 'Download to print and sign' }
  ];
  patientSignOptions = [
    {
      value: 'docusign',
      option: 'Patient will E-Sign the enrollment form via DocuSign'
    },
    {
      value: 'lantheus',
      option: 'Lantheus Link to reach out to Patient for required...'
    },
    {
      value: 'guardian',
      option: 'Legal Guardian will E-Sign the enrollment Form'
    }
  ];

  signatureOptionsField: FieldConfig = {
    name: 'signatureOptions',
    label: 'Signature Options',
    fieldType: 'select',
    options: this.signOptions
  };
  patientSignatureOptionsField: FieldConfig = {
    name: 'patientSignatureOptions',
    label: 'Signature Options',
    fieldType: 'select',
    options: this.patientSignOptions
  };

  legalGuardianNameField: FieldConfig = {
    name: 'guardianSignatureName',
    label: 'Legal Guardian Name',
    fieldType: 'text',
    placeholder: 'Enter Name'
  };
  legalGuardianEmailField: FieldConfig = {
    name: 'guardianSignatureEmail',
    label: `Legal Guardian's Email`,
    fieldType: 'text',
    placeholder: 'Enter Email'
  };
  patientNameField: FieldConfig = {
    name: 'patientSignatureName',
    label: 'Patient Name',
    placeholder: ' ',
    fieldType: 'text'
  };
  patientEmailField: FieldConfig = {
    name: 'patientSignatureEmail',
    placeholder: ' ',
    label: `Email`,
    fieldType: 'text'
  };
  srcIframe!: SafeResourceUrl | null;
  pdfSrc = signal<string | Uint8Array | ArrayBuffer | Blob | URL>('');

  togglePrimary(): void {
    this.selectedFilesPrimary.set([]);
    this.isPrimaryInsuranceVisible.update(visible => !visible);
    this.groups.insuranceInformation.primaryInsurance.reset();
    this.updateInsuraceValidations(this.groups.insuranceInformation.primaryInsurance, [
      Validators.required
    ]);
  }

  toggleSecondary(): void {
    this.selectedFilesSecondary.set([]);
    this.isSecondaryInsuranceVisible.update(visible => !visible);
    this.groups.insuranceInformation.secondaryInsurance.reset();
    this.updateInsuraceValidations(this.groups.insuranceInformation.secondaryInsurance, [
      Validators.required
    ]);
  }
  selectedFilesPrimary = signal<AttachFile[]>([]);
  selectedFilesSecondary = signal<AttachFile[]>([]);
  attachPOAFile = signal<AttachFile[]>([]);

  async handleFiles(files: File[], saveTo: WritableSignal<AttachFile[]>, group?: FormGroup) {
    if (files.length) {
      this.api.isLoading.set(true);
      this.existingPOAFiles.set(files);

      files.forEach(async f => {
        const base64 = await convertToBase64(f);
        saveTo.update(x => [...x, { name: f.name, base64 }]);
        this.api.isLoading.set(false);
      });
      if (group) {
        this.alert.confirm(INSURANCE_CONFIRMATION).then(confirmed => {
          if (confirmed) this.updateInsuraceValidations(group, []);
        });
      }
    } else {
      saveTo.set([]);
    }
  }

  updateInsuraceValidations(group: FormGroup, validation: ValidatorFn[]) {
    const val = group.value as Record<string, string>;
    Object.keys(group.controls).forEach(c => {
      const control = group.get(c);
      if (!control) return;
      if (c === 'primaryPolicyholder' || c === 'secondaryPolicyholder') {
        control.clearValidators();
        const conditionalFields = this.forms.insuranceInformation[
          c === `primaryPolicyholder` ? `primaryInsurance` : `secondaryInsurance`
        ].filter(x => x.dependsOn);
        conditionalFields.forEach(
          x => (x.validation = validation.length ? { required: true } : undefined)
        );
      } else {
        control.setValidators(validation);
        if (c === 'phone') control.addValidators(Validators.pattern(REGEX.phone));
        control.reset();
        control.updateValueAndValidity();
      }
      control.updateValueAndValidity();
    });
    group.patchValue(val);
  }

  deleteFile(i: number, from: WritableSignal<AttachFile[]>, group?: FormGroup) {
    this.alert.confirm(`Are you sure you want to delete this file?`).then(confirmed => {
      if (confirmed) {
        const updated = from().filter((_, index) => index !== i);
        from.set(updated);
        if (group && from().length === 0)
          this.updateInsuraceValidations(group, [Validators.required]);
      }
    });
  }

  get isValid() {
    if (this.currentStep() === 0) {
      // Facility
      return Boolean(this.selectedFacility);
    } else if (this.currentStep() === 1) {
      // Requested Services
      return this.groups.servicesRequested.valid;
    } else if (this.currentStep() === 2) {
      // Patient Information
      return this.pageValue() === 'newPatient'
        ? this.groups.patientInformation.newPatient.valid
        : this.groups.patientInformation.existingPatient.valid;
    } else if (this.currentStep() === 3) {
      //insurance Information
      const hasNoInsurance = (
        this.groups.insuranceInformation.noInsurance.get('noInsurance')?.value as string[]
      )?.length;
      return (
        hasNoInsurance ||
        ((this.isPrimaryInsuranceVisible() || this.isSecondaryInsuranceVisible()) &&
          (this.isPrimaryInsuranceVisible()
            ? this.groups.insuranceInformation.primaryInsurance.valid
            : true) &&
          (this.isSecondaryInsuranceVisible()
            ? this.groups.insuranceInformation.secondaryInsurance.valid
            : true))
      );
    } else if (this.currentStep() === 4) {
      // Prescriber Information
      return (
        this.groups.prescriberInformation.prescriberInfo.valid &&
        this.groups.prescriberInformation.imagingLocation.valid
      );
    } else if (this.currentStep() === 5) {
      // Prescriber Information
      return this.groups.clinicalInformation.valid;
    } else if (this.currentStep() === 6) {
      // Attestation
      const consentChecked = !!(this.attestation.value && this.signature.value);
      const nameValid = this.patientSignatureName.disabled
        ? !!this.patientSignatureName.value?.trim()
        : this.patientSignatureName.value;
      const emailValid = this.patientSignatureEmail.disabled
        ? !!this.patientSignatureEmail.value
        : this.patientSignatureEmail.valid;
      if (this.signatureOptions.value === 'download') return consentChecked;
      if (this.signatureOptions.value === 'docusign') {
        if (this.patientSignatureOptions.value === 'docusign') {
          return (
            !!(this.patientSignSupport.value && this.patientSignHealthInfo.value) &&
            consentChecked &&
            nameValid &&
            emailValid
          );
        }
        if (this.patientSignatureOptions.value === 'lantheus') return consentChecked;
        if (this.patientSignatureOptions.value === 'guardian') {
          const guardianDetailsValid =
            this.guardianSignatureName.valid && this.guardianSignatureEmail.valid;
          return (
            consentChecked &&
            guardianDetailsValid &&
            (this.attestationGroup.controls.guardian.value === 'reach-out'
              ? true
              : this.attestationGroup.controls.guardian.value === 'upload-poa'
                ? !!this.attachPOAFile().length
                : false)
          );
        }
      }
      return false;
    }
    return false;
  }

  colConfig: ColConfig[] = [
    { key: 'PracticeGroup', title: 'Practice Name' },
    { key: 'Address', title: 'Address', isArray: false, pipeName: 'address' },
    { key: 'Phone', title: 'Phone', pipeName: 'phone' },
    { key: 'Fax', title: 'Fax', pipeName: 'phone' },
    { key: 'Email', title: 'Email' }
  ];

  selectPrescriberValue = toSignal(
    this.groups.prescriberSelected.get('prescriberSelected')?.valueChanges || of()
  );
  selectedPrescriber = computed(
    () =>
      this.data.activePrescribers()?.find(x => x.ProviderId == this.selectPrescriberValue()) || null
  );

  sanitizer = inject(DomSanitizer);
  dataService = inject(DataService);
  constructor() {
    effect(() => {
      if (this.data.activePrescribers()?.length) {
        this.forms.prescriberSelected[0].options = this.data.activePrescribers()?.map(x => {
          return { value: x.ProviderId, option: `${x.FirstName} ${x.LastName}` };
        });
      }
    });
    effect(() => {
      const patients = this.dataService.pylarifyPatients();
      const selectNameField = this.forms.patientInformation.existingPatient.find(
        f => f.name === 'selectName'
      );

      if (selectNameField) {
        selectNameField.options = patients.map(patient => ({
          value: String(patient.CaseId),
          option: `${patient.PatientName} - ${patient.DateOfBirth ? new Date(patient.DateOfBirth).toLocaleDateString('en-US') : 'Invalid Date'}`
        }));
      }
    });
    effect(() => this.caseDetails() && this.updatePatientForm(this.caseDetails()!));
    this.groups.insuranceInformation.noInsurance
      .get('noInsurance')
      ?.valueChanges.pipe(takeUntilDestroyed())
      .subscribe((val: string[]) =>
        val.length ? this.tooglesOff() : this.disableInsuranceToggle.set(false)
      );
    effect(() => {
      if (this.currentStep() === 0) {
        this.clearCaseData();
      }
    });
  }

  prescriberSignatureValue = this.attestationGroup.controls.signatureOptions.value;

  tooglesOff() {
    this.disableInsuranceToggle.set(true);
    this.isPrimaryInsuranceVisible.set(false);
    this.isSecondaryInsuranceVisible.set(false);
    this.selectedFilesPrimary.set([]);
    this.selectedFilesSecondary.set([]);
    this.updateInsuraceValidations(this.groups.insuranceInformation.primaryInsurance, [
      Validators.required
    ]);
    this.updateInsuraceValidations(this.groups.insuranceInformation.secondaryInsurance, [
      Validators.required
    ]);
  }

  tableData = computed(() =>
    this.selectedPrescriber()?.Facilities.filter(x => x.AccountStatus === 'Active')
  );

  onRowSelection(e: unknown[]) {
    const selectedFacilities = e as Facility[];
    this.selectedFacility = selectedFacilities[0];
    const facility = this.selectedFacility as Facility;
    const grp = this.groups.prescriberInformation.prescriberInfo;
    const obj = {
      firstName: this.selectedPrescriber()?.FirstName,
      lastName: this.selectedPrescriber()?.LastName,
      npiNumber: this.selectedPrescriber()?.NPI,
      address: facility.Address.Line1,
      city: facility.Address.City,
      state: facility.Address.State,
      zip: facility.Address.Zipcode
    };
    grp.patchValue(obj);
    Object.keys(obj).forEach(k => grp.get(k)?.disable());
  }

  stepperSteps = Object.fromEntries(
    Object.entries(ENROLLMENT_STEPS).filter(([, v]) => v.isEnabled)
  );

  pageValue = signal<'newPatient' | 'existingPatient'>('newPatient');
  toggleSelection(): void {
    this.pageValue.set(this.pageValue() === 'newPatient' ? 'existingPatient' : 'newPatient');
    if (this.pageValue() === 'existingPatient') {
      this.groups.patientInformation.newPatient.reset();
    } else {
      this.groups.patientInformation.existingPatient.reset();
    }
  }

  private clearCaseData() {
    this.docId = '';
    this.caseId = '';
    this.docuSignCaseId.set('');
    this.pdfBlob = null;
    this.showPdfViewer.set(false);
    this.eSignatureScreen.set(false);
    this.hasAlert.set(null);
  }

  prevPage() {
    if (this.eSignatureScreen()) {
      this.currentStep.update(() => 6);

      this.eSignatureScreen.set(false);
      this.hasAlert.set(null);
    } else {
      if (this.currentStep() > 0) {
        this.currentStep.update(i => i - 1);
        this.hasAlert.set(null);
      } else {
        this.router.navigate(['/']);
      }
    }
  }
  handleWarning(event: string) {
    if (event === 'clicked') {
      this.router.navigate(['home/dashboard']);
    }
  }
  handleConfirmPdf(event: string) {
    if (event === 'clicked') {
      console.log('Clicked Confirmation for pdf');
    }
  }

  onPopupButtonClick(action: string | boolean, key: string) {
    if (key in this.popups) {
      const typedKey = key as keyof typeof this.popups;
      this.popups[typedKey].open = false;
      this.attestationGroup.get(key)?.setValue(true);
      this.attestationGroup.get(key)?.enable();
      if (typedKey === 'confirmation' && action === 'proceed') {
        this.router.navigate(['home/dashboard']);
      }
    }
  }
  formatFax(fax: string): string {
    if (!fax) return '';
    const digitsOnly = fax.replace(/\D/g, '');
    if (digitsOnly.length === 10) {
      return digitsOnly;
    } else {
      console.warn('Invalid fax format:', fax);
      return '';
    }
  }

  formatTaxId(taxId: string | null | undefined): string {
    if (!taxId) {
      return '';
    }

    const cleaned = taxId.replace(/\D/g, '');

    if (cleaned.length !== 9) {
      console.warn('Invalid Tax ID: Must be exactly 9 digits');
      return '';
    }

    return `${cleaned?.slice(0, 2)}-${cleaned?.slice(2)}`;
  }
  breakAddress(address: string): { part1: string; part2: string } {
    if (!address) return { part1: '', part2: '' };
    const tokens = address.split(/[\s,]+/).filter(Boolean);
    const mid = Math.ceil(tokens.length / 2);

    return {
      part1: tokens?.slice(0, mid).join(' '),
      part2: tokens?.slice(mid).join(' ')
    };
  }

  extractInsuranceDetails(insurance: PrimaryInsurance, planRank: string) {
    const planDetails = insurance;
    const files =
      planRank === 'Primary' ? this.selectedFilesPrimary() : this.selectedFilesSecondary();
    return {
      PlanName: planDetails.planName || '',
      Phone: planDetails.phone ? sanitizePhone(planDetails.phone) : null,
      PlanType: planDetails.planType || '',
      PlanRank: planRank,
      PolicyID: planDetails.policyNumber || '',
      GroupNo: planDetails.groupNumber || '',
      SubscriberName: planDetails.subscriberName || '',
      RelationshipToSubscriber: planDetails.patientRelation || 'Self',
      PolicyHolderEmployer: planDetails.subscriberEmployer || 'N/A',
      AttachDoc: files.map(x => {
        return { File: x.base64 };
      })
    };
  }

  nextPage() {
    this.hasUnsavedChanges.set(true);
    const selectedPage = this.pageValue() as 'newPatient' | 'existingPatient';
    const patientInfo: PatientInformation = this.groups.patientInformation[
      selectedPage
    ].getRawValue() as PatientInformation;
    if (this.currentStep() === 2) {
      if (selectedPage === 'newPatient') {
        this.patientName = `${patientInfo.firstName || ''} ${patientInfo.lastName || ''}`;
        this.attestationGroup.controls.patientSignatureName.setValue(this.patientName);
        this.attestationGroup.controls.patientSignatureEmail.setValue(patientInfo.email || null);
      } else if (selectedPage === 'existingPatient') {
        this.patientName = `${this.caseDetails()?.FirstName || ''} ${this.caseDetails()?.LastName || ''}`;
        this.attestationGroup.controls.patientSignatureName.setValue(this.patientName);
        const formEmail = this.groups.patientInformation.existingPatient.get('email')
          ?.value as string;
        const emailToUse = formEmail || null;
        this.attestationGroup.controls.patientSignatureEmail.setValue(emailToUse);
      }
      if (this.groups.patientInformation.existingPatient.get('email')?.value) {
        console.log(this.groups.patientInformation.existingPatient.get('email')?.value);
        this.patientSignatureEmail.disable();
      } else {
        this.patientSignatureEmail.enable();
      }
    }
    if (this.currentStep() === 6) {
      const hasInsurance = !(
        this.groups.insuranceInformation.noInsurance.get('noInsurance')?.value as string[]
      )?.length;
      const diagnosticCodes: ClinicalInformation =
        this.groups.clinicalInformation.getRawValue() as ClinicalInformation;
      const medicalPlans = [];
      const addressParts: { part1: string; part2: string } = this.breakAddress(
        patientInfo.address as string
      );
      const { part1, part2 } = addressParts;

      if (hasInsurance) {
        if (this.isPrimaryInsuranceVisible()) {
          const insuranceData =
            this.groups.insuranceInformation.primaryInsurance.getRawValue() as PrimaryInsurance;
          medicalPlans.push(this.extractInsuranceDetails({ ...insuranceData }, 'Primary'));
        }

        if (this.isSecondaryInsuranceVisible()) {
          const insuranceData =
            this.groups.insuranceInformation.secondaryInsurance.getRawValue() as PrimaryInsurance;
          medicalPlans.push(this.extractInsuranceDetails({ ...insuranceData }, 'Secondary'));
        }
      }
      const serviceReqValue = this.groups.servicesRequested.getRawValue() as ServiceRequested;

      const prescriberInfo: PrescriberInfo =
        this.groups.prescriberInformation.prescriberInfo.getRawValue() as PrescriberInfo;
      const imagingInfo: ImagingLocationControls =
        this.groups.prescriberInformation.imagingLocation.getRawValue() as ImagingLocationControls;
      const imagingCheckboxValue: string[] = this.groups.prescriberInformation.imagingLocation.get(
        'orderSentInImaging'
      )?.value as string[];
      const extractedValue: string = Array.isArray(imagingCheckboxValue as string[])
        ? imagingCheckboxValue[0]
        : ('' as string);

      const noInsurance = this.groups.insuranceInformation.noInsurance;

      const data = [
        diagnosticCodes.CptModifier,
        diagnosticCodes.cptCode,
        diagnosticCodes.cptModifier,
        diagnosticCodes.diagnosticCode
      ];
      const facility = this.selectedFacility as Facility;

      const flattenedValues: string[] = data.flat().filter(Boolean);
      const reqBody = {
        ExtRefId: new Date().valueOf().toString(),
        PopulatePdfFlag: true,
        DrugGroup: 'Pylarify',
        EnrollmentServiceRequests: [{ Id: serviceReqValue.servicesRequested }],
        Patient: {
          FirstName: patientInfo.firstName || this.caseDetails()?.FirstName || '',
          LastName: patientInfo.lastName || this.caseDetails()?.LastName || '',
          DOB: formatDate(new Date(patientInfo.dateOfBirth)),
          PatientId: this.caseDetails()?.PatientID || null,

          PatientPreferredLanguage:
            patientInfo.language !== 'Other' ? patientInfo.language : patientInfo.otherLanguage,
          Address1: part1,
          Address2: part2,
          City: patientInfo.city,
          State: patientInfo.state,
          Zip: patientInfo.zip,
          PatientEmailAddress: patientInfo.email || null,
          BestContactTime: patientInfo.contactTime || '',
          PreferredContactMethod: patientInfo.contactMethod,

          Phones: [
            {
              Number: sanitizePhone(patientInfo.prefPhoneNumber) || null,
              Type: patientInfo.prefPhone,
              Primary: true
            }
          ],
          AlternateContact: patientInfo.altPhoneNumber
            ? {
                // FirstName: patientInfo.firstName,
                // LastName: patientInfo.lastName,
                Phone: sanitizePhone(patientInfo.altPhoneNumber ?? '') || null,
                ...(patientInfo.altPhone ? { AltContactPhoneType: patientInfo.altPhone } : {})
              }
            : {},
          DiagnosisCodes: flattenedValues,
          OtherDiagnosisCodes: diagnosticCodes.otherCptCode?.trim()
            ? String(diagnosticCodes.otherCptCode)
            : null
        },
        Insurance: {
          MedicalInsurance: noInsurance ? 'Y' : 'N',
          MedicalPlans: medicalPlans
        },

        Provider: {
          FirstName: prescriberInfo.firstName,
          LastName: prescriberInfo.lastName,
          DEA: prescriberInfo.dea,
          NPI: prescriberInfo.npiNumber,
          TaxID: this.formatTaxId(prescriberInfo.taxId),
          OfficeContactName: prescriberInfo.officeName,
          OfficeContactPhone: sanitizePhone(prescriberInfo.officePhoneNumber ?? '') || null,
          OfficeContactFax: this.formatFax(prescriberInfo.officeNumber as string) || null,
          Email: prescriberInfo.officeMail || null,
          Fax: this.formatFax(prescriberInfo.fax as string) || null,
          ContactPreference: prescriberInfo.contactMethod ? [prescriberInfo.contactMethod] : [],
          StateMedicalLicense: prescriberInfo.licenseNumber,
          PTan: prescriberInfo.prescriberMedicarePtan,
          Phones: prescriberInfo.phoneNumber
            ? [{ Number: sanitizePhone(prescriberInfo.phoneNumber ?? '') || null }]
            : [],

          Facility: {
            Id: facility.Id,
            NPI: prescriberInfo.npiNumber,
            Name: prescriberInfo.practiceName,
            Address1: prescriberInfo.address,
            Address2: null,
            City: prescriberInfo.city,
            State: prescriberInfo.state,
            Zip: prescriberInfo.zip,
            Phone: sanitizePhone(prescriberInfo.phoneNumber ?? '') || null,
            TaxId: this.formatTaxId(prescriberInfo.taxId),
            OfficeContactName: prescriberInfo.officeName
          },
          OtherFacilities: [
            {
              ImagingLocation: extractedValue === 'orderSent' ? true : false,
              Name: imagingInfo.hospitalCenterName,
              Address1: imagingInfo.address || '',
              City: imagingInfo.city || '',
              State: imagingInfo.state || null,
              Zip: imagingInfo.zip,
              OfficeContactName: imagingInfo.officeContact,
              Phone: sanitizePhone(imagingInfo.officeContactNumber) || null,
              BillingContactName: imagingInfo.billingContact,
              BillingContactPhone: sanitizePhone(imagingInfo.billingContactNumber) || null,
              Fax: this.formatFax(imagingInfo.faxNumber as string) || null,
              Email: imagingInfo.officeContactEmail || null,
              TaxId: this.formatTaxId(imagingInfo.taxNumber) || null,
              NPI: imagingInfo.centerNpiNumber || null,
              ContactPreference: imagingInfo.otherContactMethod
                ? [imagingInfo.otherContactMethod]
                : [],
              AnticipatedInjectionDate: imagingInfo.anticipatedScanDate
                ? formatDate(new Date(imagingInfo.anticipatedScanDate))
                : '',
              PTan: imagingInfo.otherMedicarePtan,
              ...(imagingInfo.hospitalservice ? { FacilityType: imagingInfo.hospitalservice } : {})
            }
          ]
        },

        Attestation: {
          CommunicationOptIn: patientInfo.affirmation == 'Voicemail' ? ['voicemail'] : [],
          IsPatientAttestationConsent: this.attestation.value ? true : false,
          PatientSignature: this.signatureOptions.value,
          // PatientDeclaration: null,
          TextingOptIn: this.patientSignSupport.value ? true : false,
          ShareHealthConsent: this.patientSignHealthInfo.value ? true : false,
          PatientRelationship:
            this.patientSignatureOptions.value === 'guardian'
              ? (this.attestationGroup.controls.guardianSignatureName.value ?? null)
              : this.patientName,
          UploadPOADocuments:
            this.attestationGroup.controls.guardian.value === 'upload-poa' ? true : false,
          ObtainPOADocuments:
            this.attestationGroup.controls.guardian.value === 'reach-out' ? true : false,
          PatientRepresentativeName:
            this.patientSignatureOptions.value !== 'guardian'
              ? this.patientSignatureName.value
              : ((this.attestationGroup.controls.guardianSignatureName.value as string) ?? null),
          PatientOrRepresentativeEmail:
            this.patientSignatureOptions.value === 'guardian'
              ? (this.attestationGroup.controls.guardianSignatureEmail.value as string)
              : null,
          PatientEmail:
            this.patientSignatureOptions.value !== 'guardian'
              ? (this.attestationGroup.controls.patientSignatureEmail.value as string)
              : null,
          ESignRequested:
            this.attestationGroup.controls.guardian.value === 'reach-out' ? false : true,
          AttachDoc:
            this.attestationGroup.controls.guardian.value === 'upload-poa' &&
            this.patientSignatureOptions.value === 'guardian'
              ? this.attachPOAFile().map(x => {
                  return { File: x.base64 };
                })
              : [{}]
        }
      };

      this.api.submitEnrollment(reqBody).subscribe({
        next: ({ docID, caseID }) => {
          this.docId = docID;
          this.caseId = caseID;
          this.docuSignCaseId.set(caseID);

          if (this.docId && this.caseId) this.docSign();

          this.hasAlert.set(null);
          this.hasUnsavedChanges.set(false);
        },
        error: error => {
          this.currentStep.set(7);
          console.error('API Error:', error);
          this.hasAlert.set('enrollmentFailScreen');
          this.showPdfViewer.set(false);
        }
      });
    } else {
      this.currentStep.update(i => (i === Object.keys(this.stepperSteps).length ? i : i + 1));
    }
  }

  handleESign() {
    if (this.eSignatureScreen()) {
      this.alert.confirm(E_SIGN_CONFIRMATION).then(confirmed => confirmed && this.docSigner());
    }
  }

  docSign(): void {
    const accountName = this.api.tokenInfo()!.acctname.toLowerCase();
    const formattedValue = `${accountName}/${this.caseId}/${this.docId}`;

    this.api.getDocuments(formattedValue).subscribe(
      response => {
        this.api.isLoading.set(true);

        this.pdfSrc.set(response.data);
        if (response.data) {
          this.api.isLoading.set(false);
        }

        this.pdfBlob = new Blob([response.data as ArrayBuffer], { type: 'application/pdf' });
        if (this.signatureOptions.value === 'download') {
          this.hasAlert.set('downloadDocument');
          this.showPdfViewer.set(false);
        } else {
          this.hasAlert.set('showPdfViewer');
          this.showPdfViewer.set(true);
          this.eSignatureScreen.set(true);
        }
      },
      error => {
        this.api.isLoading.set(false);
        this.currentStep.set(7);

        this.hasAlert.set('enrollmentFailScreen');
        console.error('Error fetching document', error);
      }
    );
  }

  docSigner() {
    this.api.call
      .post<
        SignerPayload,
        DocuSignResponse
      >('portal/docusign/signer', { DocId: this.docId, CaseId: this.caseId })
      .subscribe({
        next: res => {
          this.api.isLoading.set(true);

          // this.srcIframe = res.Payload.docusignURL;
          this.srcIframe = this.sanitizer.bypassSecurityTrustResourceUrl(res.Payload.docusignURL);
          // this.srcIframe = null;
          // this.srcIframe = null;
          if (res.Payload.docusignURL) {
            this.api.isLoading.set(false);

            this.showPdfViewer.set(false);
            this.hasAlert.set('showIframe');
            this.eSignatureScreen.set(true);
          } else {
            this.hasAlert.set('enrollmentFailScreen');
          }
        },
        error: err => {
          this.api.isLoading.set(false);
          this.showPdfViewer.set(false);

          this.hasAlert.set('enrollmentFailScreen');
          console.error('API Error:', err);
        }
      });
  }
  docuSignApiCalls = async (): Promise<void> => {
    this.apiCallCount = 0;
    this.hasAlert.set('docuSignMultipleApiCalls');
    this.api.isProcessing.set(true);

    while (this.apiCallCount < 10) {
      const caseId = this.docuSignCaseId();
      if (!caseId) {
        console.log(`Attempt ${this.apiCallCount + 1}: caseId is missing`);
      } else {
        this.api.getSignedDocument(caseId).subscribe({
          next: (blob: Blob) => {
            if (blob && blob.size > 0) {
              this.hasAlert.set('docuSignSuccess');
              this.api.isProcessing.set(false);
              this.pdfBlob = blob;
              this.apiCallCount = 10;
            } else {
              console.warn(`Attempt ${this.apiCallCount + 1}: Empty blob`);
            }
          },
          error: err => {
            console.error(`Attempt ${this.apiCallCount + 1} failed:`, err);
            if (this.apiCallCount === 9) this.hasAlert.set('docuScreen');
          }
        });
      }

      this.apiCallCount++;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  };

  ngOnDestroy() {
    this.clearCaseData();
  }
}

interface PrimaryInsurance {
  phone: string;
  planName: string;
  planType: string;
  groupNumber: string;
  policyNumber: string;
  policyholder: string;
  subscriberName: string;
  patientRelation: string;
  subscriberEmployer: string;
  AttachDoc?: { File: Base64URLString }[];
}

interface PatientInformation {
  firstName?: string; // Only for new patients
  lastName?: string; // Only for new patients
  selectName?: string; // Only for existing patients
  dateOfBirth: string;
  gender?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  email?: string; // Only for new patients
  prefPhone: string;
  prefPhoneNumber: string;
  otherLanguage: string;
  altPhone?: string;
  altPhoneNumber?: string;
  language?: string;
  otherCptCode?: string;
  contactMethod: string;
  contactTime?: string;
  affirmation?: string; // Okay to leave voicemail
}
interface ServiceRequested {
  servicesRequested: number;
}
interface Phone {
  Number: string;
  Ext?: string; // Optional field
}
interface Facility {
  Id: string | null;
  NPI: string;
  Name: string;
  Address: Address;
  Address1?: string | null;
  Address2?: string | null;
  City: string;
  State: string;
  Zip: string;
  Phone: string;
  TaxId?: string | null;
  OfficeContactName: string;
}
interface ClinicalInformation {
  diagnosticCode: string;
  cptCode: string;
  otherCptCode: string;
  cptModifier: string;
  CptModifier: string;
}

interface ImagingLocationControls {
  hospitalCenterName: string;
  hospitalservice: string;
  orderSentInImaging: boolean;
  address: string;
  city: string;
  state: string;
  zip: string;
  officeContact: string;
  billingContact: string;
  officeContactNumber: string;
  billingContactNumber: string;
  officeContactEmail: string;
  faxNumber: string;
  anticipatedScanDate: string;
  taxNumber: string;
  centerNpiNumber: string;
  otherMedicarePtan: string;
  imagingContactMethod: string;
  otherContactMethod: string;
  AttachDoc?: string;
}
interface PrescriberInfo {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  taxId: string;
  npiNumber: string;
  practiceName?: string;
  phoneNumber?: string;
  officeName?: string;
  officePhoneNumber?: string;
  officeNumber?: string;
  licenseNumber?: string;
  prescriberMedicarePtan?: string;
  officeMail?: string;
  contactMethod?: string;

  dea?: string | null;
  fax?: string;
  email?: string;
  contactPreference?: string[];
  stateMedicalLicense?: string;
  otherMedicarePtan?: string;
  phones?: Phone[];
  facility?: Facility;
  otherFacilities?: Facility[];
}
export interface PdfResponse {
  data: ArrayBuffer | Uint8Array;
}
interface SignerPayload {
  DocId: string;
  CaseId: string;
}

interface DocuSignResponse {
  docusignURL: string;
}

type AlertTypes =
  | 'showIframe'
  | 'docuScreen'
  | 'getDocumentSuccess'
  | 'documentFail'
  | 'showPdfViewer'
  | 'docuSignSuccess'
  | 'downloadDocument'
  | 'enrollmentFailScreen'
  | 'docuSignMultipleApiCalls'
  | 'showConfirmationPopUp';
