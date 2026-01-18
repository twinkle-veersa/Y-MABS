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
import { ColConfig, TableComponent } from '@shared/components/table/table.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { CaseData } from '../dashboard/dashboard.model';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '@shared/services/data.service';
import { DatePipe } from '@angular/common';

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
  showFilter = signal<boolean>(false);
  private patientService = inject(DataService);
  selectedFilters = signal<string[]>([]);
  activeFilters = signal<string[]>([]);
  patientsData = signal<CaseData[]>([]);

  ngOnInit() {
    this.patientsData.set(this.patientService.patientsData());
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
    return search.length
      ? this.filteredData().filter(office =>
          Object.values(office).some((v: string) => v?.toString().toLowerCase().includes(search))
        )
      : this.filteredData();
  });

  // filteredData = computed(() => {
  //   const patients: CaseData[] = this.patientService.patientsData();
  //   const active = this.activeFilters();

  //   console.log(' Active filters:', active);
  //   return patients.filter((patient: CaseData) =>
  //     this.activeFilters().length
  //       ? this.activeFilters().some(x => {
  //           const [key, value] = x.split('>>');
  //           return patient[key as keyof CaseData] == value;
  //         })
  //       : true
  //   );
  // });
  filteredData = computed(() => {
    const patients: CaseData[] = this.patientService.patientsData();
    const active = this.activeFilters();

    return patients.filter((patient: CaseData) => {
      if (active.length) {
        return active.every(filter => {
          const [key, value] = filter.split('>>');
          const patientVal = (patient[key as keyof CaseData] as string)?.toLowerCase();
          const targetVal = value.toLowerCase();
          if (key === 'EnrollmentStatus') {
            return patientVal?.includes(targetVal);
          }
          return patientVal === targetVal;
        });
      } else {
        return true;
      }
    });
  });

  onFilter(type: string, item: string) {
    const filterKey = `${type}>>${item}`;
    this.selectedFilters.update(filters =>
      filters.includes(filterKey) ? filters.filter(x => x !== filterKey) : [...filters, filterKey]
    );
  }

  activateFilter() {
    this.activeFilters.set([...this.selectedFilters()]); // force new reference
    this.showFilter.set(false);
  }

  clearFilters() {
    this.selectedFilters.set([]);
    this.activeFilters.set([]);
    this.activateFilter();
  }

  filters = FILTERS;

  patientsColumns: ColConfig[] = [
    {
      key: 'PatientId',
      title: 'Patient Id',
      classList: 'fw-bold text-decoration-underline',
      sortable: true
    },
    { key: 'PatientName', title: 'Patient Name', sortable: true },
    {
      key: 'DateOfBirth',
      title: 'Date of Birth',
      sortable: true,
      pipeName: 'date',
      pipeAttr: ['MM/dd/YYYY']
    },
    { key: 'PrescriberName', title: 'Prescriber', sortable: true },
    { key: 'PrescriberNpi', title: 'Prescriber NPI', sortable: true },
    { key: 'DateSubmitted', title: 'Date Submitted', sortable: true },
    { key: 'EnrollmentStatus', title: 'Enrollment Status', sortable: true },
    { key: 'ActionNeeded', title: 'Action Needed', sortable: true }
  ];

  onSelect(row: unknown[]) {
    this.patientService.selectedPatient.set(row[0] as CaseData);
    this.router.navigate([(row[0] as CaseData).PatientId ?? 0], {
      relativeTo: this.route
    });
  }

  sanitizeFilters(param: string): string[] {
    if (param) {
      const [key, value] = param.split('>>');
      const filterType = FILTERS.find(x => x.key === key);
      if (filterType && filterType.options.filter(x => x.label === value))
        return [param, 'CaseStatus>>Open'];
    }
    return [];
  }
}
const FILTERS = [
  {
    label: 'Status',
    key: 'EnrollmentStatus',
    options: [
      { id: 'Intake', label: 'Intake' },
      { id: 'Benefit Investigation', label: 'Benefit Investigation' },
      { id: 'Insurance Auth Required', label: 'Insurance Auth Required' },
      { id: 'Scan Scheduled/Ready to Schedule', label: 'Scan Scheduled/Ready to Schedule' }
    ]
  },
  {
    label: 'Case Status',
    key: 'CaseStatus',
    options: [
      { id: 'Open', label: 'Active' },
      { id: 'Closed', label: 'Inactive' }
    ]
  }
];
interface NavigationState {
  filter?: string;
}
