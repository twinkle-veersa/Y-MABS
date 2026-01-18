import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  ViewChild
} from '@angular/core';

import { ColConfig, TableComponent } from '@shared/components/table/table.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { UtilityService } from '@shared/services/utility.service';
import { DatePipe, KeyValuePipe, NgTemplateOutlet, TitleCasePipe } from '@angular/common';
import { ApiService } from '@shared/services/api.service';
import { MY_PATIENT } from '@constants/my-patient';
import { DynamicFieldDirective } from '@shared/utils/dynamic-field.directive';
import { FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AdditionalService, CaseDetail, ServiceName } from './case-details.model';
import { DynamicPipe, PipeName } from '@shared/utils/dynamic-pipe.pipe';
import { PhonePipe } from '@shared/utils/phone.pipe';
import { CaseData } from '../dashboard/dashboard.model';

@Component({
  selector: 'app-patients',
  imports: [KeyValuePipe, IconComponent, TableComponent, NgTemplateOutlet, DynamicFieldDirective],
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.scss',
  providers: [DynamicPipe, PhonePipe, TitleCasePipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientsComponent implements AfterViewInit {
  readonly today = new Date();
  private toast = inject(ToastrService);
  private pipe = inject(DynamicPipe);
  data = input<CaseDetail>();
  patient = input<CaseData | null>();
  showUploadDocumentButton = false;
  openPopUp = input(false);
  showPopup = linkedSignal(() => this.openPopUp());
  closePopup = output();
  pdfSrc = signal<Blob | null>(null);
  selectedCaseId = input<string>();
  alertAcknowledged = output<void>();

  forms = MY_PATIENT;
  myPatientFields = MY_PATIENT.particularPatientInfo;
  private util = inject(UtilityService);
  private api = inject(ApiService);
  group = new FormGroup({ PlanName: new FormControl() });

  hasActiveAlerts = computed(() => {
    return this.alertsData();
  });
  caseDetails = computed(() => {
    this.myPatientFields.CaseInfo.left.forEach(x => {
      x.value = this.get(this.data()?.CaseInfo as object, x.key, x.pipe) as string;
    });
    this.myPatientFields.CaseInfo.right.forEach(x => {
      x.value = this.get(this.data()?.CaseInfo as object, x.key, x.pipe) as string;
    });
    this.myPatientFields.patientInfo.left.forEach(x => {
      x.value = this.get(this.data()?.PatientDetails as object, x.key, x.pipe) as string;
    });
    this.myPatientFields.patientInfo.right.forEach(x => {
      x.value = this.get(this.data()?.PatientDetails as object, x.key, x.pipe) as string;
    });
    this.myPatientFields.prescriberInfo.left.forEach(x => {
      x.value = this.get(this.data()?.HCPInfo as object, x.key, x.pipe) as string;
    });
    this.myPatientFields.prescriberInfo.right.forEach(x => {
      const keys = Array.isArray(x.key) ? x.key : [x.key];
      const values = keys.map(k => this.get(this.data()?.HCPInfo as object, k, x.pipe));
      x.value = values.filter(Boolean).join(' ') as string;
    });
    this.myPatientFields.medicalInsuranceInfo.medicalInfo.left.forEach(x => {
      if (x.field) {
        x.field.options = this.data()?.MedicalInsuranceListInfo.map(p => {
          return { value: p.PlanName, option: p.PlanName };
        });
        x.field.value = x.field.options?.at(0)?.value;
      }
      x.value = this.get(this.data()?.MedicalInsuranceInfo as object, x.key, x.pipe) as string;
    });
    this.myPatientFields.medicalInsuranceInfo.medicalInfo.right.forEach(x => {
      x.value = this.get(this.data()?.MedicalInsuranceInfo as object, x.key, x.pipe) as string;
    });
    this.myPatientFields.medicalInsuranceInfo.buyAndBill.left.forEach(x => {
      x.value =
        (this.get(this.data()?.MedicalInsuranceInfo as object, x.key, x.pipe) as string) ||
        this.get(this.buyBillData()[0], x.key);
    });
    this.myPatientFields.medicalInsuranceInfo.adminstration.left.forEach(x => {
      x.value =
        (this.get(this.data()?.MedicalInsuranceInfo as object, x.key, x.pipe) as string) ||
        this.get(this.adminData()[0], x.key);
    });
    this.myPatientFields.pharmacyInsuranceInfo.prescriptionInsuranceInfo.left.forEach(x => {
      x.value = this.get(this.data()?.PharmacyInsuranceInfo as object, x.key, x.pipe) as string;
    });
    this.myPatientFields.pharmacyInsuranceInfo.prescriptionInsuranceInfo.right.forEach(x => {
      x.value = this.get(this.data()?.PharmacyInsuranceInfo as object, x.key, x.pipe) as string;
    });
    this.myPatientFields.pharmacyInsuranceInfo.medicareCoverageInformation.left.forEach(x => {
      x.value = this.get(this.data()?.PharmacyInsuranceInfo as object, x.key, x.pipe) as string;
    });
    this.myPatientFields.pharmacyInsuranceInfo.medicareCoverageInformation.right.forEach(x => {
      x.value = this.get(this.data()?.PharmacyInsuranceInfo as object, x.key, x.pipe) as string;
    });
    return this.myPatientFields;
  });

  patientDocumentPrompt = computed(() => {
    const patient = this.data()?.PatientDetails;
    const caseInfo = this.data()?.CaseInfo;

    const fullName = `${patient?.FirstName ?? ''} ${patient?.LastName ?? ''}`.trim();
    const caseId = caseInfo?.CaseId as string;

    return `Please add any document you want to submit for the Patient: ${fullName} with Case ID: ${caseId}`;
  });

  groups = this.util.generateForm(this.forms);
  patientCase = signal(false);
  currentPage = signal(0);

  @ViewChild('stepper', { static: false }) stepper!: ElementRef;
  canScrollLeft = signal(false);
  canScrollRight = signal(false);

  handleRowAction(event: { type: string; data: unknown }) {
    this.goToNextPage();
    this.showUploadDocumentButton = true;
    if (event.type === 'rowClick') {
      console.log(event.data);
      // this.extractCases(event.data?.PatientId);
    }
  }
  handlePdfSrc(e: unknown[]) {
    if (e.length) {
      this.pdfSrc.set(null);
      const row = e.at(0) as DocumentTable;
      if (row.DocumentURL) {
        if (row.PdfSrc) return this.pdfSrc.set(row.PdfSrc);
        this.api.isLoading.set(true);
        fetch(row.DocumentURL, { headers: { Authorization: `Bearer ${this.api.token()}` } })
          .then(res => res.arrayBuffer())
          .then(data => {
            this.api.isLoading.set(false);
            row.PdfSrc = new Blob([data], { type: 'application/octet-stream' });
            this.pdfSrc.set(row.PdfSrc);
          });
      }
    }
  }

  get = <T extends object | unknown[], K extends string>(
    from: T,
    selectors: K | K[],
    pipe?: { name: PipeName; args?: string[] }
  ) => {
    return (Array.isArray(selectors) ? [...selectors] : [selectors])
      .map(s => {
        try {
          const keys = s
            .replace(/\[([^[\]]*)\]/g, '.$1.')
            .split('.')
            .filter(t => t !== '');

          return keys.reduce((prev: unknown, cur: string) => {
            if (typeof prev === 'object' && prev !== null && cur in prev) {
              let val = (prev as Record<string, unknown>)[cur];
              if (pipe && typeof val === 'string') {
                val = this.pipe.transform(val as string, pipe.name, pipe.args ?? []);
              }
              return val;
            } else {
              return undefined;
            }
          }, from);
        } catch {
          return undefined;
        }
      })
      .reduce((a: string, c) => (a ? `${a}${c ? ' ' : ''} ${c}` : c ? a + c : ''), '');
  };

  errorMessage = 'Only PDF up to 10 mb supported';

  onClosePopUp() {
    this.closePopup.emit();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    console.log(file);
    if (file) {
      this.validateFile(file);
    }
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;

    const file = target.files?.[0];
    if (file) {
      this.validateFile(file);
    }
  }

  validateFile(file: File) {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      this.errorMessage = 'Only PDF files are allowed';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage = 'File size must be less than 10MB';
      return;
    }
    this.errorMessage = '';
    const formData = new FormData();
    formData.append('Document', file);
    formData.append('CaseId', this.patient()!.CaseId || '');
    formData.append('PatientId', this.patient()!.PatientId?.toString() || '');
    this.api.call
      .post<
        FileUploadRequest,
        FileUploadResponse
      >('documents', formData as unknown as FileUploadRequest)
      .subscribe({
        next: res => {
          if (res.Status === 'SUCCESS') {
            this.toast.success('File uploaded Succesfully');
            this.closePopup.emit();
            this.showPopup.set(false);
          } else {
            this.toast.error('Error in Uploading File');
          }

          // After user creation, make API calls for each selected facility
        },
        error: err => {
          console.error('Error:', err);
        }
      });
  }

  goToNextPage() {
    this.patientCase.update(visible => !visible);
    this.currentPage.update(curr => curr + 1);
  }

  goToPrevPage() {
    this.patientCase.update(visible => !visible);
    this.currentPage.update(curr => curr - 1);
  }

  alertColumns: ColConfig[] = [
    {
      key: 'GenerateDate',
      title: 'Date & Time',
      pipeName: 'date',
      pipeAttr: ['MM/dd/yyyy, h:mm a']
    },
    { key: 'Alert', title: 'Action Needed' },
    { key: 'action', title: 'Acknowlege' }
  ];
  alertRowActions = [{ type: 'ack', name: 'Acknowledge' }];
  alertsData = computed(() =>
    (this.data()?.Alerts as Alert[] | undefined)?.filter(alert => alert.IsActive !== false)
  );

  prescriptionColumns: ColConfig[] = [
    { key: 'Drug', title: 'Drug Name' },
    { key: 'NDC', title: 'NDC' },
    { key: 'Dosage', title: 'Dosage' },
    { key: 'Quantity', title: 'Quantity' },
    { key: 'Refills', title: 'Refills' },
    { key: 'RxWrittenDate', title: 'RX Written Date' }
  ];
  prescriptionData = computed(() => this.data()?.PrescriptionInfo);

  medicalCols: ColConfig[] = [
    { key: 'iaType', title: 'IA Type' },
    { key: 'paForm', title: 'PA Form Available' },
    { key: 'phone', title: 'Phone', pipeName: 'phone' },
    { key: 'fax', title: 'Fax', pipeName: 'phone' },
    { key: 'authType', title: 'Authorization Type' },
    { key: 'paSubmit', title: 'PA Submitted By' },
    { key: 'paOutcome', title: 'PA Outcome' },
    { key: 'paStart', title: 'PA Start Date', pipeName: 'date', pipeAttr: ['MM/dd/yyyy'] },
    { key: 'paEnd', title: 'PA End Date', pipeName: 'date', pipeAttr: ['MM/dd/yyyy'] },
    { key: 'paAuth', title: 'PA Auth Number' }
  ];

  buyBillData = computed(() =>
    this.getAdditionalServiceData(
      this.data()?.MedicalInsuranceInfo.AdditionalServices ?? [],
      'Product Coverage Details'
    )
  );
  adminData = computed(() =>
    this.getAdditionalServiceData(
      this.data()?.MedicalInsuranceInfo.AdditionalServices ?? [],
      'Administration'
    )
  );
  iaData = computed(
    () => []
    // TODO Actual key unknown....
    // this.data()?.PharmacyInsuranceInfo.
  );

  getAdditionalServiceData(data: AdditionalService[], type: ServiceName) {
    return data
      .filter(x => x.Name === type)
      .map(x => {
        const iaType: 'PA' | 'PreD' | '' =
          x.PriorAuthRequired === 'Yes' ? 'PA' : x.PreDeterminationRequired === 'Yes' ? 'PreD' : '';

        const cleanValue = (val: string | null | undefined) => (val && val !== '--' ? val : null);
        const matchedAuth = x.DrugAuthorizations?.find(auth => auth.ServiceItemName === type);
        return {
          ProductOrServiceCovered: x.ProductOrServiceCovered || '',
          jCode: x.BillingCodes?.map(x => x.code)?.join(`, `),
          Copay: x.Copay,
          iaType,
          paForm: cleanValue(iaType === 'PA' ? x.PriorAuthRequired : x.PreDeterminationRequired),
          phone: cleanValue(iaType === 'PA' ? x.PriorAuthPhone : x.PreDeterminationPhone)
            ? cleanValue(iaType === 'PA' ? x.PriorAuthPhone : x.PreDeterminationPhone)!
            : null,

          fax: cleanValue(iaType === 'PA' ? x.PriorAuthFax : x.PreDeterminationFax)
            ? cleanValue(iaType === 'PA' ? x.PriorAuthFax : x.PreDeterminationFax)!
            : null,
          authType: cleanValue(iaType === 'PA' ? x.PriorAuthType : x.PreDeterminationAuthType),
          paSubmit: matchedAuth?.SubmittedBy || '',
          paOutcome: matchedAuth?.Outcome || '',
          paStart: matchedAuth?.StartDate || '',
          paEnd: matchedAuth?.EndDate || '',
          paAuth: matchedAuth?.AuthNumber || ''
        };
      });
  }

  insColumns: ColConfig[] = [
    { key: 'iaType', title: 'IA Type' },
    { key: 'paForm', title: 'PA Form Available' },
    { key: 'phone', title: 'Phone' },
    { key: 'fac', title: 'Fax' },
    { key: 'authType', title: 'Authorization Type' },
    { key: 'paSubmit', title: 'PA Submitted Date' },
    { key: 'paOutcome', title: 'PA Outcome' },
    { key: 'paStart', title: 'PA Start Date', pipeName: 'date', pipeAttr: ['MM/dd/yyyy'] },
    { key: 'paEnd', title: 'PA End Date', pipeName: 'date', pipeAttr: ['MM/dd/yyyy'] },
    { key: 'paAuth', title: 'PA Auth Number' }
  ];

  documentColumns: ColConfig[] = [
    { key: 'DocumentType', title: 'Document Name and Type' },
    { key: 'DocumentDate', title: 'Date', pipeName: 'date' }
  ];
  documents = computed(() => this.data()?.Documents);

  steps = signal({
    caseInfo: 'Case Info',
    alerts: 'Alerts',
    patientInfo: 'Patient Info',
    prescriberInfo: 'Prescriber Info',
    prescriptionInfo: 'Prescription Info',
    medicalInsuranceInfo: 'Medical Insurance Info',
    pharmacyInsuranceInfo: 'Pharmacy Insurance Info',
    documents: 'Documents'
  });
  // dummyTableData = computed(() => this.pagesData);

  currentStep = signal('Case Info');
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      console.log('key Clicked');
    }
  }

  onAlertAction(event: { type: string; data: unknown }) {
    if (event.type === 'ack') {
      const alert = event.data as Alert;
      this.acknowledgeAlert(alert.AlertPkId);
    }
  }

  acknowledgeAlert(alertId: number) {
    const caseId = this.selectedCaseId();
    if (!caseId) {
      this.toast.error('No Case ID selected.');
      return;
    }
    const endpoint = `cases/alerts/${caseId}/${alertId}`;
    this.api.call.delete(endpoint).subscribe({
      next: () => {
        this.toast.success('Alert acknowledged successfully.');
        this.alertAcknowledged.emit();
      },
      error: () => this.toast.error('Failed to acknowledge alert.')
    });
  }

  // consoleValue() {
  //   console.log(this.caseDataRs.value()?.Payload);

  //   console.log(this.tableData());
  // }
  ngAfterViewInit(): void {
    this.scrollLeft();
  }

  checkScroll() {
    const stepperEl = this.stepper.nativeElement as HTMLElement;
    this.canScrollLeft.set(stepperEl.scrollLeft > 0);
    this.canScrollRight.set(stepperEl.scrollLeft < stepperEl.scrollWidth - stepperEl.clientWidth);
  }

  scrollLeft() {
    (this.stepper.nativeElement as HTMLElement).scrollBy({ left: -250, behavior: 'smooth' });
    setTimeout(() => this.checkScroll(), 300);
  }

  scrollRight() {
    (this.stepper.nativeElement as HTMLElement).scrollBy({ left: 250, behavior: 'smooth' });
    setTimeout(() => this.checkScroll(), 300);
  }
  getFormattedDate(d: string | undefined) {
    if (d === undefined) {
      // Handle undefined case
      return 'Invalid date';
    }
    const date = new Date(d);
    const year = date.getFullYear();

    let month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;

    let day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;

    return month + '/' + day + '/' + year;
  }
}

// interface CaseDetailsItem {
//   PatientId?: string;
//   PatientName?: string;
//   DateOfBirth?: string | number;
//   PrescriberName?: string;
//   // PrescriberId?: string | number;
//   CaseStartDate?: string;
//   CaseType?: string;
//   PrescriberNpi?: string;
//   ActionNeeded?: string;
// }

// interface CaseDetail {
//   CaseId: string;
//   DateSubmitted: string;
//   EnrollmentStatus: string;
//   CaseStatus: string;
// }
// interface PatientCases {
//   PatientId: string;
//   Cases: CaseDetail[];
// }
export interface AuditFields {
  CreateDateTime: string;
  CreatedBy: string;
  UpdateDateTime: string | null;
  UpdatedBy: string | null;
}

export interface TherapyStatus {
  TherapyStatusPkID: number;
  Value: string;
  EpressionRule: string | null;
  IsActive: boolean;
  AuditFields: AuditFields;
}

export interface TherapySubStatus {
  TherapySubStatusPkId: number;
  Value: string;
  TherapyStatus: TherapyStatus;
  EpressionRule: string;
  IsActive: boolean;
  CanIterate: boolean;
  TherapyStatusGroupName: string | null;
  AuditFields: AuditFields;
}

export interface TherapyJourney {
  PatientTherapyJourneyPkId: number;
  PatientPkId: number;
  DrugPkId: number | null;
  TherapyStatus: TherapyStatus;
  TherapySubStatus: TherapySubStatus;
  CaseDataPkId: number;
  IsActive: boolean;
  AuditFields: AuditFields;
  CreateDateTime: string;
}

interface DocumentTable {
  DocumentType: string;
  DocumentDate: string;
  DocumentURL: string;
  PdfSrc?: Blob;
}

export interface DrugGroup {
  Id: number;
  Value: string;
  IsActive: boolean;
}

export interface Patient {
  prescriberId?: string;
  PatientId?: number;
  PatientName?: string;
  PatientMiddleName?: string;
  DateOfBirth?: string;
  Gender?: string;
  GenderIdentity?: string;
  IsFavorite?: boolean;
  CaseId?: string;
  AntibioticEndDate?: string | null;
  CaseType?: string;
  CaseStartDate?: string;
  CaseStatus?: string;
  CaseStatusReason?: string;
  PapOutcome?: string | null;
  PapOutcomeDate?: string | null;
  ActiveStages?: string[];
  PracticeName?: string;
  Drug?: string;
  TherapyJourneys?: TherapyJourney[];
  PatientFullName?: string;
  DrugGroup?: DrugGroup;
  CollaboratingProvider?: string | null;
  Reverification?: boolean;
  ActionNeeded?: boolean;
  EnrollmentStatus?: string;
  Alerts?: string | null;
  LastActivity?: string | null;
}

export interface FileUploadRequest {
  Document: File; // The file being uploaded
  CaseId: string; // Associated Case ID
  PatientId: string; // Associated Patient ID
}
export interface FileUploadResponse {
  Status: 'SUCCESS' | 'ERROR';
  Payload: {
    FileUrl?: string; // URL of the uploaded document (if successful)
    FileId?: string; // Unique identifier for the file
    Message?: string; // Success message
    StatusMessage?: string; // Additional status message
  };
  Errors?: string[]; // Array of error messages if the upload fails
}

interface Alert {
  AlertPkId: number;
  Category: string;
  Alert: string;
  GenerateDate: string;
  ResolveTime: string;
  IsActive: boolean;
  CreatedBy: string;
}
