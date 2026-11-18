import {
  ChangeDetectionStrategy,
  Component,
  output,
  input,
  computed,
  signal,
  effect
} from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { Facility } from 'app/pages/auth/register/register.component';
import { ColConfig, TableComponent } from '../table/table.component';

@Component({
  selector: 'app-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, IconComponent, TableComponent]
})
export class AccordionComponent {
  searchTerm = signal('');
  searchControl = new FormControl('');

  constructor() {
    effect(() => {
      this.searchControl.setValue(this.searchTerm(), { emitEvent: false });
    });

    this.searchControl.valueChanges.subscribe(value => {
      this.searchTerm.set(value ?? '');
    });
  }
  open = input<boolean>(false);
  preSelect = input<Facility[]>([]);
  isOpen = signal<boolean>(this.open());
  title = input<string>('');
  name = input<string>('');
  practiceOffices = input<Facility[]>([]);
  selectedOfficesAddress = output<Facility[]>();
  filteredOffices = computed<Facility[]>(() => {
    const search = this.searchTerm().toLowerCase().trim();
    if (!search.length) return this.practiceOffices();

    return this.practiceOffices().filter(office => {
      const address = office.Address?.[0];
      const searchable = [
        office.PracticeGroup,
        office.OfficeName,
        office.Email,
        office.Phone,
        office.Fax,
        address?.Line1,
        address?.City,
        address?.State,
        address?.Zipcode
      ];
      return searchable.some(v => v?.toString().toLowerCase().includes(search));
    });
  });
  facilityCols: ColConfig[] = [
    { key: 'PracticeGroup', title: 'Practice Name' },
    { key: 'Address', pipeName: 'address', isArray: true },
    { key: 'Phone', pipeName: 'phone' },
    { key: 'Fax', pipeName: 'phone' },
    { key: 'Email' }
  ];

  selectedData: Facility[] = [];

  onSelection(facilities: unknown) {
    this.selectedData = facilities as Facility[];
    this.selectedOfficesAddress.emit(this.selectedData);
  }

  emitSelectedData(e: Event) {
    e.preventDefault();
    this.searchTerm.set('');
    this.selectedOfficesAddress.emit(this.selectedData);
    this.isOpen.update(curr => !curr);
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.isOpen.set(!this.isOpen());
    }
  }
}
export interface Address {
  Line1?: string;
  Line2?: string | null;
  City?: string;
  State?: string;
  Zipcode?: string;
}
