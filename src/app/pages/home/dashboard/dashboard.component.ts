import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ChartData, ChartOptions } from 'chart.js/auto';
import { DataService } from '@shared/services/data.service';
import { ChartComponent } from '@shared/components/chart/chart.component';
import { CaseData } from './dashboard.model';
import { HomeHeaderComponent } from '@shared/layouts/home-header/home-header.component';
import { sanitizeArrayResponse } from '@shared/utils/utility.funtions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [ReactiveFormsModule, ChartComponent, HomeHeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  private data = inject(DataService);
  private router = inject(Router);
  isCollapsed = false;

  claimStatusData = [
    { type: 'Intake', key: 'intake', value: 0 },
    { type: 'Benefit Investigation', key: 'benefitInvestigation', value: 0 },
    { type: 'Insurance Auth Required', key: 'insuranceAuthRequired', value: 0 },
    { type: 'Scan Scheduled / Ready to Schedule', key: 'triage', value: 0 }
  ];

  caseData = computed(() => sanitizeArrayResponse(this.data.caseDataRs.value()?.Payload));
  chart = computed(() => (this.caseData()?.length ? this.buildChart(this.caseData()) : null));
  cases = computed(() =>
    this.caseData()
      ?.filter(c => c.ActionNeeded === true)
      .map(c => ({ id: c.CaseId, name: c.PatientName, ...c }))
  );

  toggleActionsList() {
    if (window.innerWidth <= 768) {
      this.isCollapsed = !this.isCollapsed;
    }
  }

  updateClaimStatusData(data: CaseData[]) {
    data.forEach(c => {
      this.claimStatusData.forEach(s => {
        const normalizedStatus = c.EnrollmentStatus?.toLowerCase().includes('benefit investigation')
          ? 'Benefit Investigation'
          : c.EnrollmentStatus;
        if (normalizedStatus === s.type) {
          s.value++;
        }
      });
    });
  }

  buildChart(data: CaseData[] | undefined) {
    if (data?.length != null) {
      this.updateClaimStatusData(data);
      const totalPatients = this.claimStatusData.reduce((a, c) => a + c.value, 0);
      const chartData: ChartData<'bar'> = {
        labels: [
          'Intake',
          ['Benefit', 'Investigation'],
          ['Insurance Auth', 'Required'],
          ['Scan Scheduled/', 'Ready to Schedule']
        ],
        datasets: [
          {
            label: 'My Active Patients',
            backgroundColor: ['#002D05', '#058348', '#74DD48', '#F3F7DC'],
            borderColor: '#C1C8CB',
            data: this.claimStatusData.map(c => c.value)
          }
        ]
      };
      const chartOptions: ChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              color: '#000',
              font: { weight: 'bold', size: 14 },
              text: `Number of Active Patients (Total: ${totalPatients})`
            }
          },
          x: { ticks: { autoSkip: false }, grid: { display: false } }
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#000',
              font: { weight: 'bold', size: 16 },
              usePointStyle: true,
              pointStyle: 'line'
            },
            onClick: () => void 0
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: tooltipItem => `${tooltipItem.dataset.label}: ${tooltipItem.raw}`
            }
          }
        }
      };
      return { chartData, chartOptions };
    }
    return null;
  }
  navigateTo(item: CaseData) {
    const patient = this.data.caseData()?.find(x => x.PatientId == item.PatientId);
    this.data.selectedPatient.set(patient || null);
    this.router.navigate(['//home/my-patients/', item.CaseId]);
  }
  redirectToSpecificCase(key: string) {
    const enrollmentStatusMapping: Record<string, string> = {
      intake: 'Intake',
      benefitInvestigation: 'Benefit Investigation',
      insuranceAuthRequired: 'Insurance Auth Required',
      triage: 'Scan Scheduled/Ready to Schedule'
    };
    this.router.navigate(['/home/my-patients'], {
      state: { filter: `EnrollmentStatus>>${enrollmentStatusMapping[key]}` }
    });
  }
}
