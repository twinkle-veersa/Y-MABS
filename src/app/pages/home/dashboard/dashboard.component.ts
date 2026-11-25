import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal
} from '@angular/core';
import { Router } from '@angular/router';
import type { ChartData, ChartOptions } from 'chart.js';
import { DASHBOARD, DASHBOARD_STATUSES, DashboardStatusKey } from '@constants/dashboard';
import { ChartComponent } from '@shared/components/chart/chart.component';
import { DataService } from '@shared/services/data.service';
import { HomeHeaderComponent } from '@shared/layouts/home-header/home-header.component';
import { sanitizeArrayResponse } from '@shared/utils/utility.functions';
import { CaseData, dashboardStepSize, dashboardSummary, needsAction } from './dashboard.model';

@Component({
  selector: 'app-dashboard',
  imports: [ChartComponent, HomeHeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  readonly content = DASHBOARD;
  private readonly data = inject(DataService);
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly loading = this.data.caseDataRs.isLoading;
  readonly error = computed(() => !!this.data.caseDataRs.error());
  readonly actionsExpanded = signal(true);
  readonly caseData = computed(
    () => sanitizeArrayResponse(this.data.caseDataRs.value()?.Payload) ?? []
  );
  readonly statuses = computed(() => dashboardSummary(this.caseData()));
  readonly hasPatients = computed(() => this.statuses().some(status => status.count > 0));
  readonly cases = computed(() =>
    this.caseData()
      .filter(needsAction)
      .sort((a, b) => (b.CaseId ?? '').localeCompare(a.CaseId ?? '', undefined, { numeric: true }))
  );
  readonly chartLabel = computed(() =>
    this.statuses()
      .map(status => `${status.label}: ${status.count}`)
      .join('; ')
  );
  readonly chartData = computed<ChartData<'bar'>>(() => ({
    labels: this.statuses().map(status => [...status.lines]),
    datasets: [
      {
        label: DASHBOARD.chart,
        data: this.statuses().map(status => status.count),
        backgroundColor: context =>
          this.chartColor(
            context.chart.canvas,
            `--dashboard-${DASHBOARD_STATUSES[context.dataIndex]?.key ?? 'intake'}-bar`
          ),
        borderRadius: { topLeft: 12, topRight: 12 },
        borderSkipped: 'bottom',
        barPercentage: 0.65,
        categoryPercentage: 0.8,
        maxBarThickness: 68
      }
    ]
  }));
  readonly chartOptions = computed<ChartOptions<'bar'>>(() => {
    const maximum = Math.max(0, ...this.statuses().map(status => status.count));
    const stepSize = dashboardStepSize(maximum);
    return {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 24, right: 8, bottom: 12 } },
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: Math.max(stepSize, Math.ceil(maximum / stepSize) * stepSize),
          border: { display: false },
          title: {
            display: true,
            text: DASHBOARD.chart,
            color: this.chartColor(this.host.nativeElement, '--dashboard-axis'),
            font: { size: 14, weight: 500 }
          },
          ticks: { stepSize, precision: 0, padding: 10 },
          grid: { color: context => this.chartColor(context.chart.canvas, '--dashboard-grid') }
        },
        x: {
          border: { display: false },
          grid: { display: false },
          ticks: {
            autoSkip: false,
            maxRotation: 0,
            padding: 18,
            color: context => this.chartColor(context.chart.canvas, '--dashboard-axis'),
            font: { size: 12 }
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: item => `${DASHBOARD.chart}: ${item.raw}` } }
      },
      onClick: (_event, elements) => {
        const index = elements[0]?.index;
        if (index !== undefined) this.redirectToSpecificCase(DASHBOARD_STATUSES[index].key);
      },
      onHover: (_event, elements, chart) => {
        chart.canvas.style.cursor = elements.length ? 'pointer' : 'default';
      }
    };
  });

  retry() {
    this.data.caseDataRs.reload();
  }

  navigateTo(item: CaseData) {
    if (!item.PatientId) return;
    this.data.selectedPatient.set(item);
    return this.router.navigate(['/home/my-patients', item.PatientId]);
  }

  redirectToSpecificCase(key: DashboardStatusKey) {
    const status = DASHBOARD_STATUSES.find(item => item.key === key);
    if (!status) return;
    return this.router.navigate(['/home/my-patients'], {
      state: { filter: `EnrollmentStatus>>${status.filter}` }
    });
  }

  private chartColor(canvas: HTMLElement, property: string): string {
    return getComputedStyle(canvas).getPropertyValue(property).trim();
  }
}
