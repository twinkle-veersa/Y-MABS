import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  OnInit
} from '@angular/core';
import { HomeHeaderComponent } from '@shared/layouts/home-header/home-header.component';
import { HeaderWrapComponent } from '@shared/layouts/header-wrap/header-wrap.component';
import { FormsModule } from '@angular/forms';
import { TableComponent } from '@shared/components/table/table.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { CaseData, dashboardStatus } from '../dashboard/dashboard.model';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '@shared/services/data.service';
import { DatePipe } from '@angular/common';
import { DASHBOARD_STATUSES } from '@constants/dashboard';
import { PATIENT_LIST_COLUMNS, PATIENT_LIST_FILTERS } from '@constants/patient-details';

@Component({
  providers: [DatePipe],
  selector: 'app-my-patients',
  imports: [HomeHeaderComponent, HeaderWrapComponent, FormsModule, TableComponent, IconComponent],
  templateUrl: './my-patients.component.html',
  styleUrl: './my-patients.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyPatientsComponent implements OnInit {
  searchTerm = signal('');
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  showFilter = signal(false);
  private patientService = inject(DataService);
  selectedFilters = signal<string[]>([]);
  activeFilters = signal<string[]>([]);

  ngOnInit() {
    const state = history.state as NavigationState;
    if (state?.filter) {
      const filters = this.sanitizeFilters(state.filter);
      this.selectedFilters.set(filters);
      this.activeFilters.set(filters);
      history.replaceState({ ...state, filter: undefined }, '');
    }
  }

  searchedData = computed<CaseData[]>(() => {
    const search = this.searchTerm().toLowerCase().trim();
    return search
      ? this.filteredData().filter(patient =>
          Object.values(patient).some(value => value?.toString().toLowerCase().includes(search))
        )
      : this.filteredData();
  });

  readonly filteredData = computed(() => {
    const active = this.activeFilters();
    return this.patientService.patientsData().filter((patient: CaseData) =>
      active.every(filter => {
        const [key, value] = filter.split('>>');
        const patientValue = (patient[key as keyof CaseData] as string)?.toLowerCase();
        const targetValue = value.toLowerCase();
        if (key !== 'EnrollmentStatus') return patientValue === targetValue;
        const status = DASHBOARD_STATUSES.find(item => item.filter.toLowerCase() === targetValue);
        return status
          ? dashboardStatus(patient) === status.key
          : patientValue?.includes(targetValue);
      })
    );
  });

  onFilter(type: string, item: string) {
    const filterKey = `${type}>>${item}`;
    this.selectedFilters.update(filters =>
      filters.includes(filterKey) ? filters.filter(x => x !== filterKey) : [...filters, filterKey]
    );
  }

  activateFilter() {
    this.activeFilters.set([...this.selectedFilters()]);
    this.showFilter.set(false);
  }

  clearFilters() {
    this.selectedFilters.set([]);
    this.activateFilter();
  }

  filters = PATIENT_LIST_FILTERS;

  readonly patientsColumns = PATIENT_LIST_COLUMNS;

  onSelect(row: unknown[]) {
    const patient = row[0] as CaseData;
    this.patientService.selectedPatient.set(patient);
    this.router.navigate([patient.PatientId ?? 0], {
      relativeTo: this.route
    });
  }

  sanitizeFilters(param: string): string[] {
    const [key, value] = param.split('>>');
    const filter = PATIENT_LIST_FILTERS.find(item => item.key === key);
    return filter?.options.some(option => option.id === value || option.label === value)
      ? [param, 'CaseStatus>>Open']
      : [];
  }
}

interface NavigationState {
  filter?: string;
}
