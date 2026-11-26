import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { SETTING } from '@constants/settings';
import { IconComponent } from '@shared/components/icon/icon.component';
import { PopupComponent } from '@shared/components/popup/popup.component';
import {
  ColConfig,
  OnRowAction,
  RowAction,
  TableComponent
} from '@shared/components/table/table.component';
import { FormTitleComponent } from '@shared/layouts/form-title/form-title.component';
import { AlertService } from '@shared/services/alert.service';
import { ApiService } from '@shared/services/api.service';
import { DataService } from '@shared/services/data.service';
import { UtilityService } from '@shared/services/utility.service';
import { AddressPipe } from '@shared/utils/address.pipe';
import { DynamicFieldDirective } from '@shared/utils/dynamic-field.directive';
import { PhonePipe } from '@shared/utils/phone.pipe';
import { formatPhoneInObj, sanitizeObj } from '@shared/utils/utility.functions';
import { Address, Facility } from 'app/pages/auth/register/register.component';
import {
  AccountUpdatePayload,
  DeleteFacilityResponse,
  FacilityContact,
  FacilityForm,
  UserDetails
} from '../settings.model';

const idOf = (f: Facility): string | null => (f.Id != null ? String(f.Id) : null);

const isSame = (a: Facility, b: Facility) => a === b || (idOf(a) !== null && idOf(a) === idOf(b));

const isLinkedAndActive = (f: Facility) =>
  !!f.LinkedToAccount && f.AccountStatus?.toLowerCase().replace('-', '') !== 'inactive';

@Component({
  selector: 'app-practice-tab',
  imports: [
    FormTitleComponent,
    DynamicFieldDirective,
    ReactiveFormsModule,
    TableComponent,
    IconComponent,
    PopupComponent
  ],
  templateUrl: './practice-tab.component.html',
  styleUrl: './practice-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PhonePipe, AddressPipe]
})
export class PracticeTabComponent {
  readonly content = SETTING.practice;
  readonly fields = SETTING.forms.practice;

  private readonly util = inject(UtilityService);
  private readonly api = inject(ApiService);
  private readonly data = inject(DataService);
  private readonly alert = inject(AlertService);
  private readonly toast = inject(ToastrService);

  readonly form = this.util.generateForm(SETTING.forms).practice;

  readonly cols: ColConfig[] = [
    { key: 'PracticeGroup', title: 'Practice Name' },
    { key: 'Address', pipeName: 'address', isArray: true },
    { key: 'Phone', pipeName: 'phone' },
    { key: 'Fax', pipeName: 'phone' },
    { key: 'Email', title: 'Email' }
  ];
  readonly practiceCols: ColConfig[] = [...this.cols, { key: 'action', title: 'Edit / Delete' }];
  readonly rowActions: RowAction[] = [
    { type: 'edit', name: 'Edit' },
    { type: 'delete', name: 'Delete' }
  ];

  private readonly facilitiesRs = this.api.getRs<Facility[]>(`portal/facilities`, {
    query: { portalAccountId: this.api.tokenInfo()!.acctid }
  });

  readonly allFacilities = computed(
    () => this.facilitiesRs.value()?.Payload?.map(x => this.normalize(x)) ?? []
  );
  readonly practiceData = linkedSignal(() => this.allFacilities().filter(isLinkedAndActive));

  readonly addedFacilities = signal<Facility[]>([]);
  readonly updatedFacilities = signal<Facility[]>([]);
  readonly toDelete = signal<string[]>([]);
  readonly editing = signal<Facility | null>(null);
  readonly isSaving = signal(false);
  readonly hasUnsavedChanges = computed(
    () =>
      this.addedFacilities().length > 0 ||
      this.updatedFacilities().length > 0 ||
      this.toDelete().length > 0
  );

  readonly isDialogOpen = signal(false);
  readonly searchTerm = signal('');
  readonly dialogInitial = signal<Facility[]>([]);
  private readonly dialogSelection = signal<Facility[]>([]);

  readonly filteredFacilities = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    if (!search) return this.allFacilities();
    return this.allFacilities().filter(f => {
      const address = f.Address?.[0];
      return [
        f.PracticeGroup,
        f.OfficeName,
        f.Phone,
        f.Fax,
        f.Email,
        address?.Line1,
        address?.Line2,
        address?.City,
        address?.State,
        address?.Zipcode
      ].some(v => typeof v === 'string' && v.toLowerCase().includes(search));
    });
  });

  canNavigateOut(): Promise<boolean> {
    if (!this.hasUnsavedChanges() || !this.api.token()) return Promise.resolve(true);
    return this.alert.confirm(SETTING.exitConfirmation);
  }

  onRowAction({ type, data }: OnRowAction) {
    const facility = data as Facility;
    if (type === 'edit') {
      this.editing.set(facility);
      this.form.patchValue(formatPhoneInObj({ ...facility, ...(facility.Address?.[0] ?? {}) }));
    }
    if (type === 'delete') {
      this.alert.confirm('Are you sure you want to delete this row?').then(confirmed => {
        if (confirmed) this.unlinkFacility(facility);
      });
    }
  }

  addFacility() {
    const facility = this.fromForm();
    const name = facility.OfficeName?.trim();
    if (this.practiceData().some(x => x.OfficeName?.trim() === name)) {
      this.toast.warning(`Facility is already added`);
      return;
    }
    this.practiceData.update(list => [facility, ...list]);
    this.addedFacilities.update(list => [...list, facility]);
    this.form.reset();
  }

  updateFacility() {
    const original = this.editing();
    if (!this.form.valid || !original) return;

    const updated = this.fromForm(original);
    const replace = (list: Facility[]) => list.map(x => (isSame(x, original) ? updated : x));

    if (this.addedFacilities().some(x => isSame(x, original))) {
      this.addedFacilities.update(replace);
    } else if (this.updatedFacilities().some(x => isSame(x, original))) {
      this.updatedFacilities.update(replace);
    } else {
      this.updatedFacilities.update(list => [...list, updated]);
    }
    this.practiceData.update(replace);
    this.cancelEdit();
  }

  cancelEdit() {
    this.form.reset();
    this.editing.set(null);
  }

  openDialog() {
    const linkedIds = new Set(this.practiceData().map(idOf));
    const initial = this.allFacilities().filter(f => idOf(f) !== null && linkedIds.has(idOf(f)));
    this.searchTerm.set('');
    this.dialogInitial.set(initial);
    this.dialogSelection.set(initial);
    this.isDialogOpen.set(true);
  }

  onDialogSelect(rows: unknown[]) {
    this.dialogSelection.set([...(rows as Facility[])]);
  }

  confirmDialog() {
    const selectedIds = new Set(this.dialogSelection().map(idOf));
    const currentIds = new Set(this.practiceData().map(idOf));

    this.allFacilities()
      .filter(f => idOf(f) !== null && selectedIds.has(idOf(f)) && !currentIds.has(idOf(f)))
      .forEach(f => this.linkFacility(f));
    this.practiceData()
      .filter(f => idOf(f) !== null && !selectedIds.has(idOf(f)))
      .forEach(f => this.unlinkFacility(f));

    this.isDialogOpen.set(false);
  }

  async save() {
    if (!this.hasUnsavedChanges() || this.isSaving()) return;
    this.isSaving.set(true);

    const toSave = [...this.addedFacilities(), ...this.updatedFacilities()];
    const deleteIds = this.toDelete();
    const contacts = this.getContacts();

    await Promise.all([
      ...toSave.map(f => this.saveFacility(f, contacts)),
      deleteIds.length ? this.deleteFacilities(deleteIds) : Promise.resolve()
    ]);

    this.addedFacilities.set([]);
    this.updatedFacilities.set([]);
    this.toDelete.set([]);
    this.isSaving.set(false);
    this.facilitiesRs.reload();
    this.data.accountInfoRs.reload();
  }

  private linkFacility(facility: Facility) {
    const id = idOf(facility);
    if (id && this.toDelete().includes(id)) {
      this.toDelete.update(list => list.filter(x => x !== id));
    } else {
      this.addedFacilities.update(list => [...list, facility]);
    }
    this.practiceData.update(list => [facility, ...list]);
  }

  private unlinkFacility(facility: Facility) {
    const id = idOf(facility);
    const isPendingAdd = this.addedFacilities().some(x => isSame(x, facility));
    const without = (list: Facility[]) => list.filter(x => !isSame(x, facility));

    this.addedFacilities.update(without);
    this.updatedFacilities.update(without);
    this.practiceData.update(without);
    if (!isPendingAdd && id && !this.toDelete().includes(id)) {
      this.toDelete.update(list => [...list, id]);
    }
  }

  private fromForm(original?: Facility): Facility {
    const formData = this.form.value as FacilityForm;
    return sanitizeObj({
      PracticeGroup: formData.PracticeGroup || '',
      Email: formData.Email || '',
      Fax: formData.Fax || null,
      OfficeName: formData.PracticeGroup || '',
      Rank: 3,
      Id: original?.Id,
      Phone: formData.Phone || null,
      PhoneType: 'Office',
      Extension: null,
      Address: [
        {
          Line1: formData.Line1 || '',
          Line2: formData.Line2 || '',
          City: formData.City || '',
          State: formData.State || '',
          Zipcode: formData.Zipcode || ''
        }
      ],
      Contacts: original?.Contacts ?? []
    });
  }

  private saveFacility(facility: Facility, contacts: FacilityContact[]): Promise<void> {
    const account = this.data.accountInfoRs.value()?.Payload;
    const payload: AccountUpdatePayload = {
      Username: account?.Username as string,
      MasterAccountId: account?.PortalAccountPkId as number,
      IsNewUser: false,
      MasterFacility: {
        PracticeGroup: facility.PracticeGroup || '',
        Email: facility.Email || null,
        Fax: facility.Fax || null,
        OfficeName: facility.OfficeName || '',
        Rank: facility.Rank ?? 1,
        Id: facility.Id ? Number(facility.Id) : null,
        Phone: facility.Phone || null,
        PhoneType: 'Office',
        Extension: null,
        Address: [this.getAddress(facility.Address ?? [])],
        Contacts: contacts
      }
    };

    return lastValueFrom(
      this.api.call.post<AccountUpdatePayload, unknown>('account/update', payload)
    )
      .then(res => {
        if (res.Status === 'SUCCESS') {
          this.toast.success(`Facility saved successfully`);
        } else {
          this.toast.error(`Failed to save facility`);
        }
      })
      .catch(() => {
        this.toast.error(`Failed to save facility`);
      });
  }

  private deleteFacilities(ids: string[]): Promise<void> {
    return lastValueFrom(
      this.api.call.put<string[], DeleteFacilityResponse>(
        `portal/account/deleteFacility/${this.api.tokenInfo()?.acctid}`,
        ids
      )
    )
      .then(res => {
        if (res.Status === 'SUCCESS') {
          this.toast.success('Facilities deleted successfully');
        } else {
          this.toast.error('Failed to delete');
        }
      })
      .catch(() => {
        this.toast.error('Failed to delete');
      });
  }

  private normalize(facility: Facility): Facility {
    return { ...facility, Address: [this.getAddress(facility.Address ?? [])] };
  }

  private getAddress(addressField: Address[] | Address): Address {
    if (!Array.isArray(addressField)) return addressField;
    const [first] = addressField;
    return {
      Line1: first?.Line1 || '',
      Line2: first?.Line2 || null,
      City: first?.City || '',
      State: first?.State || '',
      Zipcode: first?.Zipcode || ''
    };
  }

  private getContacts(): FacilityContact[] {
    const userDetails = this.data.accountInfoRs.value()?.Payload?.UserDetails;
    if (!userDetails) return [];

    const toContact = (user: UserDetails): FacilityContact =>
      sanitizeObj({
        Id: null,
        Email: user?.Email ?? '',
        Fax: user?.Fax ?? '',
        FirstName: user?.FirstName ?? '',
        LastName: user?.LastName ?? '',
        OfficeContactType: 'Office Contact',
        Rank: 1,
        Title: null,
        Phone: user?.Phone ?? null,
        Extension: null
      });

    return Array.isArray(userDetails) ? userDetails.map(toContact) : [toContact(userDetails)];
  }
}
