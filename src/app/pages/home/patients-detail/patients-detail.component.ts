import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  OnInit,
  signal
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CASE_DETAIL_COLUMNS, PATIENT_DETAIL } from '@constants/patient-details';
import { HomeHeaderComponent } from '@shared/layouts/home-header/home-header.component';
import { TableComponent } from '@shared/components/table/table.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ApiService } from '@shared/services/api.service';
import { DataService } from '@shared/services/data.service';
import { environment } from 'environments/environment';
import { CaseData } from '../dashboard/dashboard.model';
import { PatientsComponent } from '../patients/patients.component';
import { CaseDetail } from '../patients/case-details.model';
import { detailRecord, detailText, mapPatientCaseRows } from '../patients/patient-details.mapper';

@Component({
  selector: 'app-patients-detail',
  imports: [
    HomeHeaderComponent,
    TableComponent,
    IconComponent,
    RouterLink,
    PatientsComponent,
    NgOptimizedImage
  ],
  templateUrl: './patients-detail.component.html',
  styleUrl: './patients-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientsDetailComponent implements OnInit {
  readonly content = PATIENT_DETAIL;
  readonly caseColumns = CASE_DETAIL_COLUMNS;
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly data = inject(DataService);
  private readonly route = inject(ActivatedRoute);
  readonly patientId = this.route.snapshot.paramMap.get('id');
  readonly popupOpen = signal(false);
  readonly caseData = computed(() =>
    this.data.caseData().filter(item => String(item.PatientId) === this.patientId)
  );
  readonly patientData = computed<CaseData | undefined>(() => {
    const patient = this.data.selectedPatient();
    return patient && String(patient.PatientId) === this.patientId ? patient : this.caseData()[0];
  });
  readonly selectedCaseId = linkedSignal<CaseData[], string | undefined>({
    source: this.caseData,
    computation: (cases, previous) => {
      const currentId = previous?.value;
      if (cases.some(item => item.CaseId === currentId)) return currentId;
      const preferredId = this.patientData()?.CaseId;
      return cases.find(item => item.CaseId === preferredId)?.CaseId ?? cases[0]?.CaseId;
    }
  });
  readonly selectedCase = computed(
    () => this.caseData().find(item => item.CaseId === this.selectedCaseId()) ?? null
  );
  readonly caseRows = computed(() => mapPatientCaseRows(this.caseData()));
  readonly selectedRows = computed(() =>
    this.caseRows().filter(item => item['CaseId'] === this.selectedCaseId())
  );
  readonly patientDetailsRs = this.api.getRs<CaseDetail>(`case/${this.api.tokenInfo()?.acctname}`, {
    baseUrl: environment.portalv11Url,
    parameter: this.selectedCaseId
  });
  readonly caseDetails = computed(() => this.patientDetailsRs.value()?.Payload);

  ngOnInit() {
    if (!this.patientData() && !this.data.caseDataRs.isLoading()) {
      void this.router.navigate(['../'], { relativeTo: this.route });
    }
  }
  onSelect(rows: unknown[]) {
    const caseId = detailText(detailRecord(rows[0])['CaseId']);
    if (caseId) this.selectedCaseId.set(caseId);
  }
  closeUpload() {
    this.popupOpen.set(false);
    this.patientDetailsRs.reload();
  }
  print() {
    window.print();
  }
}
