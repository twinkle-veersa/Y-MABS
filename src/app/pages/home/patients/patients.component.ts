import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  untracked,
  ViewChild
} from '@angular/core';
import { DatePipe, NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { FormControl, FormGroup } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import {
  PATIENT_DETAIL,
  PATIENT_DETAIL_COLUMNS,
  PATIENT_TABS,
  PATIENT_TAB_TITLES,
  PATIENT_COVERAGE_TITLES,
  PatientDetailTab
} from '@constants/patient-details';
import { FieldConfig } from '@shared/models';
import { TableComponent } from '@shared/components/table/table.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { SelectComponent } from '@shared/components/select/select.component';
import { ApiService } from '@shared/services/api.service';
import { CaseData } from '../dashboard/dashboard.model';
import { CaseDetail } from './case-details.model';
import {
  detailRecord,
  detailText,
  mapPatientDetail,
  PatientDetailRecord
} from './patient-details.mapper';

@Component({
  selector: 'app-patients',
  imports: [IconComponent, TableComponent, SelectComponent, NgTemplateOutlet, NgOptimizedImage],
  providers: [DatePipe],
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:resize)': 'checkScroll()' }
})
export class PatientsComponent implements AfterViewInit {
  readonly content = PATIENT_DETAIL;
  readonly tabs = PATIENT_TABS;
  readonly columns = PATIENT_DETAIL_COLUMNS;
  readonly titles = PATIENT_TAB_TITLES;
  readonly coverageTitles = PATIENT_COVERAGE_TITLES;
  readonly data = input<CaseDetail>();
  readonly patient = input<CaseData | null>();
  readonly selectedCaseId = input<string>();
  readonly openPopUp = input(false);
  readonly closePopup = output<void>();
  readonly alertAcknowledged = output<void>();
  readonly showPopup = linkedSignal(() => this.openPopUp());
  readonly currentStep = signal<PatientDetailTab>('Case Info');
  readonly pdfSrc = signal<Blob | null>(null);
  readonly uploading = signal(false);
  readonly uploadError = signal('');
  readonly canScrollLeft = signal(false);
  readonly canScrollRight = signal(false);
  readonly alertActions = [{ type: 'ack', name: PATIENT_DETAIL.acknowledge }];
  readonly planForm = new FormGroup({
    medicalPlan: new FormControl(0, { nonNullable: true }),
    pharmacyPlan: new FormControl(0, { nonNullable: true })
  });
  private readonly medicalIndex = toSignal(this.planForm.controls.medicalPlan.valueChanges, {
    initialValue: 0
  });
  private readonly pharmacyIndex = toSignal(this.planForm.controls.pharmacyPlan.valueChanges, {
    initialValue: 0
  });
  readonly view = computed(() =>
    mapPatientDetail(this.data(), this.patient(), this.medicalIndex(), this.pharmacyIndex())
  );
  readonly medicalPlanField = computed(() =>
    this.planField('medicalPlan', this.view().medicalPlans)
  );
  readonly pharmacyPlanField = computed(() =>
    this.planField('pharmacyPlan', this.view().pharmacyPlans)
  );
  readonly documentPrompt = computed(() => {
    const patient = this.data()?.PatientDetails;
    const name =
      [patient?.FirstName, patient?.LastName].map(detailText).filter(Boolean).join(' ') ||
      this.patient()?.PatientName ||
      '';
    return `Please add any document you want to submit for the Patient: ${name} with Case ID: ${this.selectedCaseId() ?? ''}`;
  });
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly documentCache = new Map<string, Blob>();
  private previewRequest?: AbortController;
  @ViewChild('stepper') private stepper?: ElementRef<HTMLElement>;

  constructor() {
    effect(() => {
      this.selectedCaseId();
      untracked(() => this.currentStep.set('Case Info'));
    });
    effect(() => {
      this.data();
      untracked(() => {
        this.planForm.reset({ medicalPlan: 0, pharmacyPlan: 0 });
        this.documentCache.clear();
        this.previewRequest?.abort();
        this.pdfSrc.set(null);
      });
    });
    this.destroyRef.onDestroy(() => this.previewRequest?.abort());
  }
  private planField(name: string, plans: PatientDetailRecord[]): FieldConfig {
    return {
      fieldType: 'select',
      name,
      label: 'Plan Name',
      options: plans.map((plan, index) => ({
        value: index,
        option: detailText(plan['PlanName']) || detailText(plan['PayorName']) || `Plan ${index + 1}`
      }))
    };
  }
  ngAfterViewInit() {
    setTimeout(() => this.checkScroll());
  }
  checkScroll() {
    const element = this.stepper?.nativeElement;
    if (!element) return;
    this.canScrollLeft.set(element.scrollLeft > 1);
    this.canScrollRight.set(element.scrollLeft + element.clientWidth < element.scrollWidth - 1);
  }
  scrollTabs(direction: number) {
    this.stepper?.nativeElement.scrollBy({ left: direction * 300, behavior: 'smooth' });
  }
  closeUpload() {
    if (this.uploading()) return;
    this.showPopup.set(false);
    this.uploadError.set('');
    this.closePopup.emit();
  }
  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.uploadFile(file);
  }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.uploadFile(file);
    input.value = '';
  }
  private uploadFile(file: File) {
    if (this.uploading()) return;
    if (file.type !== 'application/pdf') return this.uploadError.set(this.content.pdfOnly);
    if (file.size > 10 * 1024 * 1024) return this.uploadError.set(this.content.fileTooLarge);
    const caseId = this.selectedCaseId();
    const patientId = this.patient()?.PatientId ?? this.data()?.PatientDetails?.PatientID;
    if (!caseId || patientId === undefined) return this.uploadError.set(this.content.noCase);
    const body = new FormData();
    body.append('Document', file);
    body.append('CaseId', caseId);
    body.append('PatientId', String(patientId));
    this.uploadError.set('');
    this.uploading.set(true);
    this.api.call
      .post<FormData, unknown>('documents', body, {
        showSuccessToast: false,
        showErrorToast: false
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.uploading.set(false))
      )
      .subscribe({
        next: response => {
          if (response.Status === 'SUCCESS') {
            this.toast.success(this.content.uploadSuccess);
            this.showPopup.set(false);
            this.closePopup.emit();
          } else this.uploadError.set(this.content.uploadError);
        },
        error: () => this.uploadError.set(this.content.uploadError)
      });
  }
  async handlePdfSrc(rows: unknown[]) {
    this.previewRequest?.abort();
    this.pdfSrc.set(null);
    const url = detailText(detailRecord(rows[0])['DocumentURL']);
    if (!url) return;
    const cached = this.documentCache.get(url);
    if (cached) {
      this.pdfSrc.set(cached);
      return;
    }
    const request = new AbortController();
    this.previewRequest = request;
    this.api.isLoading.set(true);
    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${this.api.token()}` },
        signal: request.signal
      });
      if (!response.ok) throw new Error(String(response.status));
      const blob = await response.blob();
      if (request.signal.aborted) return;
      this.documentCache.set(url, blob);
      this.pdfSrc.set(blob);
    } catch {
      if (!request.signal.aborted) this.toast.error(this.content.previewError);
    } finally {
      if (this.previewRequest === request) this.api.isLoading.set(false);
    }
  }
  onAlertAction(event: { type: string; data: unknown }) {
    if (event.type !== 'ack') return;
    const caseId = this.selectedCaseId(),
      alertId = detailRecord(event.data)['AlertPkId'];
    if (!caseId || typeof alertId !== 'number') return;
    this.api.call
      .delete(`cases/alerts/${caseId}/${alertId}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.success(this.content.acknowledgeSuccess);
          this.alertAcknowledged.emit();
        },
        error: () => this.toast.error(this.content.acknowledgeError)
      });
  }
}
