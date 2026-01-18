import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { HomeHeaderComponent } from '@shared/layouts/home-header/home-header.component';
import { ColConfig, TableComponent } from '@shared/components/table/table.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CaseData } from '../dashboard/dashboard.model';
import { PatientsComponent } from '../patients/patients.component';
import { ApiService } from '@shared/services/api.service';
import { environment } from 'environments/environment';
import { DataService } from '@shared/services/data.service';
import { DatePipe } from '@angular/common';
import { BooleanPipe } from '@shared/utils/boolean.pipe';
import { CaseDetail } from '../patients/case-details.model';

@Component({
  selector: 'app-patients-detail',
  imports: [
    HomeHeaderComponent,
    ReactiveFormsModule,
    TableComponent,
    IconComponent,
    RouterLink,
    PatientsComponent
  ],
  providers: [DatePipe, BooleanPipe],
  templateUrl: './patients-detail.component.html',
  styleUrls: ['./patients-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientsDetailComponent implements OnInit {
  private router = inject(Router);
  private api = inject(ApiService);
  private data = inject(DataService);
  private activeatedRoute = inject(ActivatedRoute);
  patientId = this.activeatedRoute.snapshot.paramMap.get('id');
  popupOpen = signal<boolean>(false);
  patientData = this.data.selectedPatient;
  caseData = computed(() =>
    this.data.caseData().filter(x => x.PatientId == this.patientData()?.PatientId)
  );
  selectedCaseId = signal<string | undefined>(this.caseData()?.at(0)?.CaseId ?? undefined);
  patientDetailsRs = this.api.getRs<CaseDetail>(`case/${this.api?.tokenInfo()?.acctname}`, {
    baseUrl: environment.portalv11Url,
    parameter: this.selectedCaseId
  });
  caseDetails = computed(() => this.patientDetailsRs.value()?.Payload);

  ngOnInit(): void {
    if (!this.patientData()) {
      const patient = this.data.caseData().find(x => x.PatientId?.toString() == this.patientId);
      if (patient) {
        this.data.selectedPatient.set(patient);
      } else {
        this.router.navigate(['../'], { relativeTo: this.activeatedRoute });
      }
    }
  }

  onSelect(row: unknown[]) {
    this.selectedCaseId.set((row[0] as CaseData).CaseId ?? '');
  }

  onUploadPopup() {
    this.popupOpen.set(true);
  }

  onClose() {
    this.popupOpen.set(false);
    this.patientDetailsRs.reload();
  }

  onAlertAcknowledged() {
    this.patientDetailsRs.reload();
  }

  caseColumns: ColConfig[] = [
    { key: 'CaseId', title: 'Case ID' },
    { key: 'CaseStartDate', title: 'Date Submitted', pipeName: 'date', pipeAttr: ['MM/dd/yyyy'] },
    { key: 'EnrollmentStatus', title: 'Enrollment Status' },
    { key: 'CaseStatus', title: 'Case Status' },
    { key: 'Reverification', title: 'Benefits Reverification?', pipeName: 'boolean' },
    { key: 'ActionNeeded', title: 'Action Needed', pipeName: 'boolean' }
  ];
}
