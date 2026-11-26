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
  POPUP_CONTENT,
  EXIT_CONFIRMATION,
  E_SIGN_CONFIRMATION,
  VIEW_DOWNLOAD,
  MARKETING_CONTACT_OPTIONS
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
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PopupComponent } from '@shared/components/popup/popup.component';
import { FileUploadComponent } from '@shared/components/file-upload/file-upload.component';
import {
  AttachFile,
  FileUploadTableComponent
} from '@shared/components/file-upload-table/file-upload-table.component';
import { FieldConfig } from '@shared/models';
import { ApiService } from '@shared/services/api.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AddressPipe } from '@shared/utils/address.pipe';
import { PhonePipe } from '@shared/utils/phone.pipe';
import { InputComponent } from '@shared/components/input/input.component';

import { formatDate, formatPhone, sanitizePhone } from '@shared/utils/utility.functions';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullpageAlertsComponent } from '@shared/layouts/fullpage-alerts/fullpage-alerts.component';
import { convertToBase64 } from '@shared/utils/utility.functions';
import { REGEX } from '@constants/regex';
import { DataService } from '@shared/services/data.service';
import { CaseDetail, PatientDetails } from '../patients/case-details.model';
import { environment } from 'environments/environment';
import { PdfViewerComponent } from '@shared/components/pdf-viewer.component';
import { AlertService } from '@shared/services/alert.service';
import { RequiredComponent } from '@shared/components/required.component';

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
    ReactiveFormsModule,
    PopupComponent,
    FileUploadComponent,
    FileUploadTableComponent,
    KeyValuePipe,
    InputComponent,
    NgxExtendedPdfViewerModule,
    FullpageAlertsComponent,
    PdfViewerComponent,
    RequiredComponent
  ],
  providers: [AddressPipe, PhonePipe],
  templateUrl: './enrollment.component.html',
  styleUrl: './enrollment.component.scss',
  host: { '(window:beforeunload)': 'canNavigateOut($event)' },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnrollmentComponent implements OnInit, OnDestroy {
  hasUnsavedChanges = signal(false);
  forms = PATIENT_REFERRAL;
  readonly popups = POPUP_CONTENT;
  readonly download = VIEW_DOWNLOAD;
  currentStep = signal(0);
  stepHeading = computed(() => {
    const headings: Record<number, string> = {
      1: 'Patient Information',
      2: 'Prescriber Information',
      3: 'Insurance Information',
      4: 'Clinical Information',
      5: 'Attestation and Signatures'
    };
    return headings[this.currentStep()] ?? '';
  });
  private api = inject(ApiService);
  util = inject(UtilityService);
  data = inject(DataService);
  alert = inject(AlertService);
  private router = inject(Router);
  groups = this.util.generateForm(this.forms);
  selectedFacility: EnrollmentFacility | undefined;
  isPrimaryInsuranceVisible = signal(false);
  isSecondaryInsuranceVisible = signal(false);
  disableInsuranceToggle = signal(false);
  hasAlert = signal<AlertTypes | null>(null);
  eSignatureScreen = signal(false);
  docId = '';
  caseId = '';
  docuSignCaseId = signal('');
  apiCallCount = 0;

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

    const addressLine = [patientDetails.Address?.Line1, patientDetails.Address?.Line2]
      .map(part => part?.trim())
      .filter(Boolean)
      .join(', ');

    formGroup.patchValue({
      dateOfBirth: patientDetails.DateOfBirth ? new Date(patientDetails.DateOfBirth) : null,
      email: patientDetails.Email,
      address: addressLine,
      city: patientDetails.Address.City,
      state: patientDetails.Address.State,
      zip: patientDetails.Address.PostalCode,
      primaryMobile: formatPhone(patientDetails.MobilePhone || patientDetails.Phone || '') || null
    });

    const genderControl = formGroup.get('gender');
    if (patientDetails.Gender === 'Male' || patientDetails.Gender === 'Female') {
      genderControl?.setValue(patientDetails.Gender);
      genderControl?.disable({ emitEvent: false });
    } else {
      genderControl?.reset();
      genderControl?.enable({ emitEvent: false });
    }
  }

  pdfBlob: Blob | null = null;

  patientName = '';
  showPdfViewer = signal<boolean>(false);

  ngOnInit() {
    window.addEventListener('message', this.handleMessage.bind(this));
    this.groups.clinicalInformation.productInformation.patchValue({
      productName: 'Danyelza® (Naxitamab)',
      productNdc: '50633-230-01'
    });
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

  signature = new FormControl<boolean | null>({ value: null, disabled: true });
  signatureOptions = new FormControl('docusign', Validators.required);
  patientAuthorization = new FormControl<boolean | null>({ value: null, disabled: true });
  marketingOptIn = new FormControl<boolean | null>({ value: null, disabled: true });
  marketingContactMethods = new FormControl<string[]>([]);
  patientSignatureOptions = new FormControl('patient', Validators.required);
  patientSignatureName = new FormControl({ value: '', disabled: true }, Validators.required);
  patientSignatureEmail = new FormControl('', [
    Validators.required,
    Validators.pattern(REGEX.email)
  ]);
  alternateContactName = new FormControl('', Validators.required);
  relationshipToPatient = new FormControl('', Validators.required);
  alternateContactEmail = new FormControl('', [
    Validators.required,
    Validators.pattern(REGEX.email)
  ]);

  attestationGroup = new FormGroup({
    prescriberLegalContent: this.signature,
    patientAuthorization: this.patientAuthorization,
    marketingOptIn: this.marketingOptIn,
    marketingContactMethods: this.marketingContactMethods,
    signatureOptions: this.signatureOptions,
    patientSignatureOptions: this.patientSignatureOptions,
    patientSignatureName: this.patientSignatureName,
    patientSignatureEmail: this.patientSignatureEmail,
    alternateContactName: this.alternateContactName,
    relationshipToPatient: this.relationshipToPatient,
    alternateContactEmail: this.alternateContactEmail
  });

  readonly marketingContactOptions = MARKETING_CONTACT_OPTIONS;

  signOptions = [
    { value: 'docusign', option: 'E-Sign the enrollment form via DocuSign' },
    { value: 'download', option: 'Print and Sign Enrollment Form' }
  ];
  patientSignOptions = [
    {
      value: 'patient',
      option: 'Patient will E-Sign the enrollment form via DocuSign'
    },
    {
      value: 'patientContact',
      option: 'Patient Contact will E-Sign the enrollment form via DocuSign'
    }
  ];

  signatureOptionsField: FieldConfig = {
    name: 'signatureOptions',
    label: 'Signature Options',
    fieldType: 'select',
    options: this.signOptions,
    validation: { required: true }
  };
  patientSignatureOptionsField: FieldConfig = {
    name: 'patientSignatureOptions',
    label: 'Signature Options',
    fieldType: 'select',
    options: this.patientSignOptions,
    validation: { required: true }
  };
  patientNameField: FieldConfig = {
    name: 'patientSignatureName',
    label: 'Patient Name',
    placeholder: 'Enter Name',
    fieldType: 'text',
    validation: { required: true }
  };
  patientEmailField: FieldConfig = {
    name: 'patientSignatureEmail',
    placeholder: 'Enter Email',
    label: 'Email of Patient',
    fieldType: 'text',
    validation: { required: true, email: true }
  };
  alternateContactNameField: FieldConfig = {
    name: 'alternateContactName',
    label: 'Alternate Contact Name',
    placeholder: 'Enter Name',
    fieldType: 'text',
    validation: { required: true }
  };
  relationshipToPatientField: FieldConfig = {
    name: 'relationshipToPatient',
    label: 'Relationship to Patient',
    fieldType: 'select',
    options: [
      { option: 'Unknown', value: 'Unknown' },
      { option: 'Dependent', value: 'Dependent' },
      { option: 'Spouse', value: 'Spouse' },
      { option: 'Mother', value: 'Mother' },
      { option: 'Father', value: 'Father' },
      { option: 'Parent / legal guardian', value: 'ParentLegalGuardian' }
    ],
    validation: { required: true }
  };
  alternateContactEmailField: FieldConfig = {
    name: 'alternateContactEmail',
    label: 'Alternate Contact Email',
    placeholder: 'Enter Email',
    fieldType: 'text',
    validation: { required: true, email: true }
  };
  srcIframe!: SafeResourceUrl | null;
  pdfSrc = signal<string | Uint8Array | ArrayBuffer | Blob | URL>('');

  togglePrimary(): void {
    this.selectedFilesPrimary.set([]);
    this.isPrimaryInsuranceVisible.update(visible => !visible);
    this.resetInsuranceForm(
      this.groups.insuranceInformation.primaryInsurance,
      this.forms.insuranceInformation.primaryInsurance
    );
  }

  toggleSecondary(): void {
    this.selectedFilesSecondary.set([]);
    this.isSecondaryInsuranceVisible.update(visible => !visible);
    this.resetInsuranceForm(
      this.groups.insuranceInformation.secondaryInsurance,
      this.forms.insuranceInformation.secondaryInsurance
    );
  }

  selectedFilesPrimary = signal<AttachFile[]>([]);
  selectedFilesSecondary = signal<AttachFile[]>([]);

  async handleFiles(files: File[], saveTo: WritableSignal<AttachFile[]>) {
    if (files.length) {
      this.api.isLoading.set(true);
      files.forEach(async f => {
        const base64 = await convertToBase64(f);
        saveTo.update(x => [...x, { name: f.name, base64 }]);
        this.api.isLoading.set(false);
      });
    } else {
      saveTo.set([]);
    }
  }

  deleteFile(i: number, from: WritableSignal<AttachFile[]>) {
    this.alert.confirm(`Are you sure you want to delete this file?`).then(confirmed => {
      if (confirmed) {
        from.set(from().filter((_, index) => index !== i));
      }
    });
  }

  private resetInsuranceForm(group: FormGroup, fields: FieldConfig[]) {
    group.reset();
    fields.forEach(field => {
      const control = group.get(field.name);
      if (!control) return;
      if (field.dependsOn) {
        control.clearValidators();
      } else {
        control.setValidators(this.util.bindValidations(field.validation));
      }
      control.updateValueAndValidity({ emitEvent: false });
    });
  }

  get isValid() {
    if (this.currentStep() === 0) {
      return Boolean(this.selectedFacility);
    } else if (this.currentStep() === 1) {
      return this.pageValue() === 'newPatient'
        ? this.groups.patientInformation.newPatient.valid
        : this.groups.patientInformation.existingPatient.valid;
    } else if (this.currentStep() === 2) {
      return this.groups.prescriberInformation.prescriberInfo.valid;
    } else if (this.currentStep() === 3) {
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
      const { copayEligibility, diagnosisInformation, productInformation } =
        this.groups.clinicalInformation;
      return copayEligibility.valid && diagnosisInformation.valid && productInformation.valid;
    } else if (this.currentStep() === 5) {
      const prescriberConsent = !!this.signature.value;
      if (this.signatureOptions.value === 'download') return prescriberConsent;
      if (this.signatureOptions.value !== 'docusign' || !prescriberConsent) return false;
      if (!this.patientAuthorization.value) return false;

      const nameValid = this.isPopulatedControlValid(this.patientSignatureName);

      if (this.patientSignatureOptions.value === 'patient') {
        return nameValid && this.isPopulatedControlValid(this.patientSignatureEmail);
      }
      if (this.patientSignatureOptions.value === 'patientContact') {
        return (
          nameValid &&
          this.isPopulatedControlValid(this.alternateContactName) &&
          this.isPopulatedControlValid(this.relationshipToPatient) &&
          this.isPopulatedControlValid(this.alternateContactEmail)
        );
      }
      return false;
    }
    return false;
  }

  colConfig: ColConfig[] = [
    { key: 'PracticeGroup', title: 'Practice Name', sortable: true },
    { key: 'Address', title: 'Address', isArray: false, pipeName: 'address', sortable: false },
    { key: 'Phone', title: 'Phone', pipeName: 'phone', sortable: false },
    { key: 'Fax', title: 'Fax', pipeName: 'phone', sortable: false },
    { key: 'Email', title: 'Email', sortable: false }
  ];

  selectedPrescriber = computed(() => this.data.activePrescribers()?.[0] ?? null);

  sanitizer = inject(DomSanitizer);
  constructor() {
    effect(() => {
      const patients = this.data.pylarifyPatients();
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

  tooglesOff() {
    this.disableInsuranceToggle.set(true);
    this.isPrimaryInsuranceVisible.set(false);
    this.isSecondaryInsuranceVisible.set(false);
    this.selectedFilesPrimary.set([]);
    this.selectedFilesSecondary.set([]);
    this.resetInsuranceForm(
      this.groups.insuranceInformation.primaryInsurance,
      this.forms.insuranceInformation.primaryInsurance
    );
    this.resetInsuranceForm(
      this.groups.insuranceInformation.secondaryInsurance,
      this.forms.insuranceInformation.secondaryInsurance
    );
  }

  tableData = computed(() =>
    this.selectedPrescriber()?.Facilities.filter(x => x.AccountStatus === 'Active')
  );

  onRowSelection(e: unknown[]) {
    const selectedFacilities = e as EnrollmentFacility[];
    this.selectedFacility = selectedFacilities[0];
    const facility = this.selectedFacility;
    if (!facility) return;

    const provider = this.selectedPrescriber();
    const address = Array.isArray(facility.Address) ? facility.Address[0] : facility.Address;
    const contact = facility.FacilityContacts?.[0] ?? facility.Contacts?.[0];
    const providerWithTax = provider as typeof provider & {
      PrescriberTaxId?: string | null;
      TaxId?: string | null;
    };
    const officePhoneRaw = contact?.Phone || facility.Phone || '';
    const officeFaxRaw = contact?.Fax || facility.Fax || '';
    const grp = this.groups.prescriberInformation.prescriberInfo;
    const lockWhenPresent: Record<string, string> = {
      prescriberName: `${provider?.FirstName ?? ''} ${provider?.LastName ?? ''}`.trim(),
      npiNumber: provider?.NPI?.trim() || '',
      taxId: this.formatTaxId(
        this.resolveTaxIdForPrefill(providerWithTax?.PrescriberTaxId, providerWithTax?.TaxId)
      ),
      officeName: contact ? `${contact.FirstName ?? ''} ${contact.LastName ?? ''}`.trim() : '',
      officePhoneNumber: formatPhone(officePhoneRaw) || officePhoneRaw,
      officeExt: (contact?.Extension || facility.Extension || '').trim(),
      officeMail: (contact?.Email || facility.Email || '').trim(),
      officeFax: formatPhone(officeFaxRaw) || officeFaxRaw
    };
    const editablePrefill: Record<string, string> = {
      centerName: (facility.OfficeName || facility.PracticeGroup || '').trim(),
      address: [address?.Line1, address?.Line2]
        .map(part => (part ?? '').trim())
        .filter(Boolean)
        .join(', '),
      city: (address?.City ?? '').trim(),
      state: (address?.State ?? '').trim(),
      zip: (address?.Zipcode ?? '').trim()
    };

    Object.entries(lockWhenPresent).forEach(([key, value]) => {
      const control = grp.get(key);
      if (!control) return;
      if (value) {
        control.setValue(value);
        control.disable();
      } else {
        control.setValue('');
        control.enable();
      }
    });

    Object.entries(editablePrefill).forEach(([key, value]) => {
      const control = grp.get(key);
      if (!control) return;
      control.enable();
      control.setValue(value || '');
    });
  }

  stepperSteps = Object.fromEntries(
    Object.entries(ENROLLMENT_STEPS).filter(([, v]) => v.isEnabled)
  );

  pageValue = signal<'newPatient' | 'existingPatient'>('newPatient');
  setPatientMode(mode: 'newPatient' | 'existingPatient'): void {
    if (this.pageValue() === mode) return;
    this.pageValue.set(mode);
    if (mode === 'existingPatient') {
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
      this.currentStep.update(() => 5);

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
  onPopupButtonClick(_action: string | boolean, key: string) {
    if (!(key in this.popups)) return;
    const typedKey = key as keyof typeof this.popups;
    this.popups[typedKey].open = false;
    const control = this.attestationGroup.get(typedKey) as FormControl<boolean | null> | null;
    if (control) {
      control.enable({ emitEvent: false });
      control.setValue(true);
    }
  }

  onMarketingMethodChange(event: Event, value: string) {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.marketingContactMethods.value ?? [];
    this.marketingContactMethods.setValue(
      checked ? [...current, value] : current.filter(item => item !== value)
    );
  }

  private setAttestationPrefill(control: FormControl, value: string | null | undefined) {
    const trimmed = value?.toString().trim() || '';
    if (trimmed) {
      control.setValue(trimmed);
      control.disable({ emitEvent: false });
    } else {
      control.enable({ emitEvent: false });
      control.setValue('');
    }
  }

  private isPopulatedControlValid(control: FormControl): boolean {
    if (control.disabled) {
      return !!String(control.value ?? '').trim();
    }
    return control.valid;
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

  resolveTaxIdForPrefill(
    prescriberTaxId: string | null | undefined,
    taxId: string | null | undefined
  ): string {
    return this.normalizeTaxIdForPrefill(prescriberTaxId) || this.normalizeTaxIdForPrefill(taxId);
  }

  normalizeTaxIdForPrefill(taxId: string | null | undefined): string {
    if (!taxId) {
      return '';
    }
    const raw = taxId.toString().trim();
    if (/[A-Za-z]/.test(raw)) {
      return '';
    }
    const cleaned = raw.replace(/\D/g, '');
    return cleaned.length === 9 ? cleaned : '';
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

  extractClinicalDetails(clinical: ClinicalInformation) {
    const selectedPrimary = clinical.primaryIcd10Codes ?? [];
    const primaryCodes = [
      ...(selectedPrimary.includes('C74.90') ? [clinical.primaryIcdC7490?.trim() || ''] : []),
      ...(selectedPrimary.includes('Other') ? [clinical.primaryIcdOther?.trim() || ''] : [])
    ].filter(Boolean);

    const secondaryCodes = [
      ...(clinical.secondaryIcdCodes?.includes('secondary1')
        ? [clinical.secondaryIcdCode1?.trim() || '']
        : []),
      ...(clinical.secondaryIcdCodes?.includes('secondary2')
        ? [clinical.secondaryIcdCode2?.trim() || '']
        : [])
    ].filter(Boolean);

    return {
      CopayEligibility: clinical.federalProgramEnrollment || null,
      PrimaryIcd10Codes: primaryCodes,
      SecondaryIcd10Codes: secondaryCodes,
      AdditionalInformation: clinical.additionalInformation ?? [],
      TreatmentSetting: clinical.treatmentSetting ?? [],
      ProductName: 'Danyelza® (Naxitamab)',
      ProductNDC: '50633-230-01',
      EstimatedQuantity: clinical.estimatedQuantity?.trim() || null,
      AnticipatedInfusionDate: clinical.anticipatedInfusionDate
        ? formatDate(new Date(clinical.anticipatedInfusionDate))
        : null
    };
  }

  private buildAttestationPayload(): AttestationPayload {
    const isDownload = this.signatureOptions.value === 'download';
    const isPatientContact = this.patientSignatureOptions.value === 'patientContact';
    const isPatient = this.patientSignatureOptions.value === 'patient';

    return {
      PrescriberConsent: !!this.signature.value,
      PrescriberSignatureOption: (this.signatureOptions.value as 'docusign' | 'download') || null,
      PatientAuthorizationConsent: isDownload ? false : !!this.patientAuthorization.value,
      MarketingOptIn: isDownload ? false : !!this.marketingOptIn.value,
      CommunicationOptIn: isDownload ? [] : [...(this.marketingContactMethods.value ?? [])],
      PatientSignatureOption: isDownload
        ? null
        : ((this.patientSignatureOptions.value as 'patient' | 'patientContact') ?? null),
      PatientName: isDownload
        ? null
        : this.patientSignatureName.value?.trim() || this.patientName || null,
      PatientEmail:
        !isDownload && isPatient ? (this.patientSignatureEmail.value as string) || '' : '',
      AlternateContactName:
        !isDownload && isPatientContact ? this.alternateContactName.value?.trim() || '' : '',
      RelationshipToPatient:
        !isDownload && isPatientContact ? (this.relationshipToPatient.value as string) || '' : '',
      AlternateContactEmail:
        !isDownload && isPatientContact ? (this.alternateContactEmail.value as string) || '' : '',
      ESignRequested: !isDownload
    };
  }

  extractInsuranceDetails(insurance: InsuranceFormValue, planRank: 'Primary' | 'Secondary') {
    const isPrimary = planRank === 'Primary';
    const insuranceName = isPrimary
      ? insurance.primaryInsuranceName
      : insurance.secondaryInsuranceName;
    const planName = isPrimary ? insurance.primaryPlanName : insurance.secondaryPlanName;
    const phone = isPrimary ? insurance.primaryInsurancePhone : insurance.secondaryInsurancePhone;
    const planTypes = isPrimary ? insurance.primaryInsuranceType : insurance.secondaryInsuranceType;
    const memberId = isPrimary ? insurance.primaryMemberId : insurance.secondaryMemberId;
    const policyHolderName = isPrimary
      ? insurance.primaryPolicyHolderName
      : insurance.secondaryPolicyHolderName;
    const relation = isPrimary
      ? insurance.primaryPatientRelation
      : insurance.secondaryPatientRelation;
    const otherRelation = isPrimary
      ? insurance.primaryOtherRelationship
      : insurance.secondaryOtherRelationship;
    const dob = isPrimary ? insurance.primaryPolicyHolderDOB : insurance.secondaryPolicyHolderDOB;

    const files =
      planRank === 'Primary' ? this.selectedFilesPrimary() : this.selectedFilesSecondary();

    return {
      InsuranceName: insuranceName || '',
      PlanName: planName || '',
      PlanType: Array.isArray(planTypes) ? planTypes.filter(Boolean) : [],
      PlanRank: planRank,
      SubscriberName: policyHolderName || '',
      RelationshipToSubscriber: relation === 'Other' ? otherRelation || '' : relation || '',
      Phone: phone ? sanitizePhone(phone) : null,
      PolicyID: memberId || '',
      PolicyHolderDOB: dob ? formatDate(new Date(dob)) : null,
      AttachDoc: files.map(x => ({ File: x.base64 }))
    };
  }

  nextPage() {
    this.hasUnsavedChanges.set(true);
    const selectedPage = this.pageValue() as 'newPatient' | 'existingPatient';
    const patientInfo: PatientInformation = this.groups.patientInformation[
      selectedPage
    ].getRawValue() as PatientInformation;

    if (this.currentStep() === 1) {
      this.patientName =
        selectedPage === 'existingPatient'
          ? `${this.caseDetails()?.FirstName || ''} ${this.caseDetails()?.LastName || ''}`.trim()
          : `${patientInfo.firstName || ''} ${patientInfo.lastName || ''}`.trim();

      this.setAttestationPrefill(this.patientSignatureName, this.patientName);
      this.setAttestationPrefill(this.patientSignatureEmail, patientInfo.email);
      this.setAttestationPrefill(this.alternateContactName, patientInfo.authRepName);
      this.setAttestationPrefill(this.relationshipToPatient, patientInfo.relationship);
      this.setAttestationPrefill(this.alternateContactEmail, patientInfo.authRepEmail);
    }

    const hasNoInsurance = !!(
      this.groups.insuranceInformation.noInsurance.get('noInsurance')?.value as string[]
    )?.length;
    const clinical: ClinicalInformation = {
      ...(this.groups.clinicalInformation.copayEligibility.getRawValue() as Partial<ClinicalInformation>),
      ...(this.groups.clinicalInformation.diagnosisInformation.getRawValue() as Partial<ClinicalInformation>),
      ...(this.groups.clinicalInformation.productInformation.getRawValue() as Partial<ClinicalInformation>)
    };
    const medicalPlans = [];
    const { part1, part2 } = this.breakAddress(patientInfo.address as string);

    if (!hasNoInsurance) {
      if (this.isPrimaryInsuranceVisible()) {
        const insuranceData =
          this.groups.insuranceInformation.primaryInsurance.getRawValue() as InsuranceFormValue;
        medicalPlans.push(this.extractInsuranceDetails({ ...insuranceData }, 'Primary'));
      }
      if (this.isSecondaryInsuranceVisible()) {
        const insuranceData =
          this.groups.insuranceInformation.secondaryInsurance.getRawValue() as InsuranceFormValue;
        medicalPlans.push(this.extractInsuranceDetails({ ...insuranceData }, 'Secondary'));
      }
    }

    const prescriberInfo: PrescriberInfo =
      this.groups.prescriberInformation.prescriberInfo.getRawValue() as PrescriberInfo;
    const [prescriberFirstName = '', ...prescriberLastParts] = (prescriberInfo.prescriberName || '')
      .trim()
      .split(/\s+/);
    const prescriberLastName = prescriberLastParts.join(' ');

    const facility = this.selectedFacility;

    const preferredMethods = Array.isArray(patientInfo.contactPreferences)
      ? patientInfo.contactPreferences
      : [];

    const reqBody = {
      ExtRefId: new Date().valueOf().toString(),
      PopulatePdfFlag: true,
      DrugGroup: 'Pylarify',
      Patient: {
        FirstName: patientInfo.firstName || this.caseDetails()?.FirstName || '',
        LastName: patientInfo.lastName || this.caseDetails()?.LastName || '',
        DOB: formatDate(new Date(patientInfo.dateOfBirth)),
        PatientId: this.caseDetails()?.PatientID || null,
        Gender: patientInfo.gender || null,
        Weight: patientInfo.patientWeight || null,
        Address1: part1,
        Address2: part2,
        City: patientInfo.city,
        State: patientInfo.state,
        Zip: patientInfo.zip,
        PatientEmailAddress: patientInfo.email || null,
        BestContactTime: patientInfo.contactTime || '',
        PreferredContactMethod: preferredMethods,
        Phones: [
          {
            Number: sanitizePhone(patientInfo.primaryMobile ?? '') || null,
            Type: 'Mobile',
            Primary: true
          }
        ],
        AlternateContact: patientInfo.authRepName
          ? {
              FirstName: patientInfo.authRepName,
              Phone: sanitizePhone(patientInfo.secondaryMobile ?? '') || null,
              Email: patientInfo.authRepEmail || null,
              Relationship: patientInfo.relationship || null
            }
          : {}
      },
      Insurance: {
        MedicalInsurance: hasNoInsurance ? 'Y' : 'N',
        MedicalPlans: medicalPlans
      },
      Provider: {
        FirstName: prescriberFirstName,
        LastName: prescriberLastName,
        NPI: prescriberInfo.npiNumber,
        TaxID: this.formatTaxId(prescriberInfo.taxId),
        OfficeContactName: prescriberInfo.officeName,
        OfficeContactPhone: sanitizePhone(prescriberInfo.officePhoneNumber ?? '') || null,
        OfficeContactExt: (prescriberInfo.officeExt || '').trim() || null,
        OfficeContactFax: this.formatFax(prescriberInfo.officeFax as string) || null,
        Email: prescriberInfo.officeMail || null,
        PrescriberEmail: prescriberInfo.prescriberEmail || null,
        Fax: this.formatFax(prescriberInfo.officeFax as string) || null,
        Phones: prescriberInfo.prescriberDirectContact
          ? [{ Number: sanitizePhone(prescriberInfo.prescriberDirectContact ?? '') || null }]
          : [],
        AdditionalOfficeContactName: (prescriberInfo.additionalContactName || '').trim() || null,
        AdditionalOfficeContactPhone:
          sanitizePhone(prescriberInfo.additionalContactPhone ?? '') || null,
        AdditionalOfficeContactExt: (prescriberInfo.additionalContactExt || '').trim() || null,
        AdditionalOfficeContactEmail: (prescriberInfo.additionalContactEmail || '').trim() || null,
        Facility: {
          Id: facility?.Id,
          NPI: prescriberInfo.npiNumber,
          Name: prescriberInfo.centerName,
          Address1: prescriberInfo.address,
          Address2: null,
          City: prescriberInfo.city,
          State: prescriberInfo.state,
          Zip: prescriberInfo.zip,
          Phone: sanitizePhone(prescriberInfo.officePhoneNumber ?? '') || null,
          Extension: (prescriberInfo.officeExt || '').trim() || null,
          TaxId: this.formatTaxId(prescriberInfo.taxId),
          OfficeContactName: prescriberInfo.officeName
        }
      },
      Clinical: this.extractClinicalDetails(clinical),
      Attestation: this.buildAttestationPayload()
    };

    console.log(`Step ${this.currentStep()} → Request body:`, reqBody);

    if (this.currentStep() === 5) {
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
          this.currentStep.set(6);
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
        this.currentStep.set(6);

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

          this.srcIframe = this.sanitizer.bypassSecurityTrustResourceUrl(res.Payload.docusignURL);
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

interface InsuranceFormValue {
  primaryInsuranceType?: string[];
  primaryInsuranceName?: string;
  primaryPlanName?: string;
  primaryPolicyHolderName?: string;
  primaryPatientRelation?: string;
  primaryOtherRelationship?: string;
  primaryInsurancePhone?: string;
  primaryMemberId?: string;
  primaryPolicyHolderDOB?: string | Date;
  secondaryInsuranceType?: string[];
  secondaryInsuranceName?: string;
  secondaryPlanName?: string;
  secondaryPolicyHolderName?: string;
  secondaryPatientRelation?: string;
  secondaryOtherRelationship?: string;
  secondaryInsurancePhone?: string;
  secondaryMemberId?: string;
  secondaryPolicyHolderDOB?: string | Date;
  AttachDoc?: { File: Base64URLString }[];
}

interface PatientInformation {
  firstName?: string;
  lastName?: string;
  selectName?: string;
  dateOfBirth: string;
  gender?: string;
  patientWeight?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  email?: string;
  contactPreferences?: string[];
  authRepName?: string;
  primaryMobile?: string;
  secondaryMobile?: string;
  relationship?: string;
  contactTime?: string;
  authRepEmail?: string;
}
interface FacilityContact {
  FirstName?: string;
  LastName?: string;
  Phone?: string;
  Extension?: string | null;
  Email?: string;
  Fax?: string;
}

interface FacilityAddress {
  Line1?: string;
  Line2?: string | null;
  City?: string;
  State?: string;
  Zipcode?: string;
}

interface EnrollmentFacility {
  Id?: string | number | null;
  PracticeGroup?: string;
  OfficeName?: string;
  AccountStatus?: string;
  Address?: FacilityAddress | FacilityAddress[];
  FacilityContacts?: FacilityContact[];
  Contacts?: FacilityContact[];
  Phone?: string | null;
  Extension?: string | null;
  Fax?: string | null;
  Email?: string | null;
}
interface ClinicalInformation {
  federalProgramEnrollment?: string;
  primaryIcd10Codes?: string[];
  primaryIcdC7490?: string;
  primaryIcdOther?: string;
  secondaryIcdCodes?: string[];
  secondaryIcdCode1?: string;
  secondaryIcdCode2?: string;
  additionalInformation?: string[];
  treatmentSetting?: string[];
  productName?: string;
  productNdc?: string;
  estimatedQuantity?: string;
  anticipatedInfusionDate?: string | Date;
}
interface AttestationPayload {
  PrescriberConsent: boolean;
  PrescriberSignatureOption: 'docusign' | 'download' | null;
  PatientAuthorizationConsent: boolean;
  MarketingOptIn: boolean;
  CommunicationOptIn: string[];
  PatientSignatureOption: 'patient' | 'patientContact' | null;
  PatientName: string | null;
  PatientEmail: string;
  AlternateContactName: string;
  RelationshipToPatient: string;
  AlternateContactEmail: string;
  ESignRequested: boolean;
}
interface PrescriberInfo {
  prescriberName: string;
  npiNumber: string;
  taxId: string;
  centerName?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  prescriberDirectContact?: string;
  prescriberEmail?: string;
  officeName?: string;
  officePhoneNumber?: string;
  officeExt?: string;
  officeMail?: string;
  officeFax?: string;
  additionalContactName?: string;
  additionalContactPhone?: string;
  additionalContactExt?: string;
  additionalContactEmail?: string;
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
  | 'showPdfViewer'
  | 'docuSignSuccess'
  | 'downloadDocument'
  | 'enrollmentFailScreen'
  | 'docuSignMultipleApiCalls';
