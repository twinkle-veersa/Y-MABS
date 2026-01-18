import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  linkedSignal,
  signal
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SETTING, SETTING_TABS, SettingTab } from '@constants/settings';
import {
  ColConfig,
  OnRowAction,
  RowAction,
  TableComponent
} from '@shared/components/table/table.component';
import { FormTitleComponent } from '@shared/layouts/form-title/form-title.component';
import { HeaderWrapComponent } from '@shared/layouts/header-wrap/header-wrap.component';
import { UtilityService } from '@shared/services/utility.service';
import { DynamicFieldDirective } from '@shared/utils/dynamic-field.directive';
import { AccordionComponent } from '@shared/components/accordion/accordion.component';
import { PhonePipe } from '@shared/utils/phone.pipe';
import { PopupComponent } from '@shared/components/popup/popup.component';
import { formatPhoneInObj, sanitizeObj } from '@shared/utils/utility.functions';
import { AddressPipe } from '@shared/utils/address.pipe';
import { Address, Facility } from 'app/pages/auth/register/register.component';
import { ApiService } from '@shared/services/api.service';
import { TooltipModule } from 'primeng/tooltip';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '@shared/services/data.service';
import { Facility as PFacility } from 'app/pages/profile/profile.model';
import { AlertService } from '@shared/services/alert.service';
import { lastValueFrom } from 'rxjs';

const NPI_ERROR_MSG = `One or more pieces of information entered do not match our records. Please try again or contact us for additional assistance.`;

@Component({
  selector: 'app-settings',
  imports: [
    HeaderWrapComponent,
    FormTitleComponent,
    DynamicFieldDirective,
    ReactiveFormsModule,
    TableComponent,
    PopupComponent,
    AccordionComponent,
    TooltipModule,
    FormsModule,
    IconComponent
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PhonePipe, AddressPipe]
})
export class SettingsComponent {
  readonly tabs = SETTING_TABS;
  readonly content = SETTING.content;
  readonly forms = SETTING.forms;

  private readonly util = inject(UtilityService);
  private readonly api = inject(ApiService);
  private readonly data = inject(DataService);
  private readonly alert = inject(AlertService);
  private readonly toast = inject(ToastrService);

  hasUnsavedChanges = signal(false);
  searchTerm = signal('');
  updateTable = signal(false);
  addedFacilities = signal<PFacility[]>([]);
  updatedFacilities = signal<PFacility[]>([]);
  latestNpiPrescriber = signal<PrescriberWithFacilities | null>(null);
  prescriberSelectedFacilities = signal<Facility[]>([]);
  assPopupOpen = false;
  popupContent = '';
  errMsg = signal('');
  toDelete: string[] = [];
  activeTab: SettingTab = this.tabs[0];
  selectedPrescriberIdx = signal<number | null>(null);
  updateData: Facility | null = null;
  private prescriberId: number | null = null;
  groups = this.util.generateForm(this.forms);
  preSelectedRows = signal<Facility[]>([]);

  private readonly facilitiesRs = this.api.getRs<Facility[]>(`portal/facilities`, {
    query: {
      portalAccountId: this.api.tokenInfo()!.acctid
    }
  });

  readonly practiceData = linkedSignal(
    () =>
      this.facilitiesRs
        .value()
        ?.Payload?.filter(
          x => x.LinkedToAccount && x.AccountStatus?.toLowerCase()?.replace('-', '') !== 'inactive'
        )
        .map(
          x =>
            ({
              ...x,
              Address: [this.getAddress(x.Address ?? [])],
              Status: x.AccountStatus
            }) as PFacility
        ) ?? []
  );

  readonly prescribers = linkedSignal<PrescriberWithFacilities[]>(
    () =>
      (this.data.userPrescribers()?.length &&
        this.data.userPrescribers()?.map(prescriber => ({
          providerId: prescriber.ProviderId,
          prescriberNPI: prescriber.NPI,
          AccountStatus: prescriber.AccountStatus,
          firstName: prescriber.FirstName,
          lastName: prescriber.LastName,
          facilities: this.uniqueFacilities([...this.practiceData(), ...prescriber.Facilities]),
          selectedFacilities: prescriber.Facilities.filter(x => x.LinkedToAccount).map(x => ({
            ...x,
            Address: [this.getAddress(x.Address ?? [])]
          }))
        }))) ||
      []
  );

  uniqueFacilities(facilities: Facility[]) {
    return facilities
      .filter((f, i, arr) => arr.findIndex(x => x.OfficeName === f.OfficeName) === i)
      .map(x => ({
        ...x,
        Address: [this.getAddress(x.Address ?? [])],
        FacilityContacts: [],
        Contacts: []
      }));
  }

  readonly allFacilitiesForTable = computed(() => {
    // const base = this.practiceData() || [];
    // const latest = this.latestNpiPrescriber();
    // const prescriberFacilities = latest?.facilities || [];

    // const combined = [...base, ...prescriberFacilities].filter(
    //   (f, i, arr) => arr.findIndex(x => x.OfficeName === f.OfficeName) === i
    // );
    const combined = this.prescribers().at(this.selectedPrescriberIdx() ?? 0)?.facilities ?? [];
    const search = this.searchTerm()?.toString().toLowerCase().trim() || '';
    const filtered = search
      ? combined.filter(f =>
          Object.values(f).some(
            v => typeof v === 'string' && v.toLowerCase().includes(search.toLowerCase())
          )
        )
      : combined;
    return filtered.map(f => ({
      ...f
      // ...(latest && prescriberFacilities.includes(f)
      //   ? {
      //       prescriberName: `${latest.firstName} ${latest.lastName}`,
      //       prescriberNPI: latest.prescriberNPI
      //     }
      //   : {})
    }));
  });

  readonly cols: ColConfig[] = [
    { key: 'PracticeGroup', title: 'Practice Name' },
    { key: 'Address', pipeName: 'address', isArray: true },
    { key: 'Phone', pipeName: 'phone' },
    { key: 'Fax', pipeName: 'phone' }
  ];
  readonly practiceCols: ColConfig[] = [...this.cols, { key: 'action', title: 'Edit / Delete' }];
  readonly practiceRowActions: RowAction[] = [
    { type: 'edit', name: 'Edit' },
    { type: 'delete', name: 'Delete' }
  ];

  @HostListener('window:beforeunload', ['$event'])
  canNavigateOut(e: BeforeUnloadEvent): Promise<boolean> {
    if (this.hasUnsavedChanges() && this.api.token()) {
      if (e) {
        e.preventDefault();
        return Promise.resolve(false);
      }
      return this.alert.confirm(SETTING.exitConfirmation).then(confirmed => confirmed);
    }
    return Promise.resolve(true);
  }

  onRowAction(e: OnRowAction) {
    const { type, data } = e;
    const facility = data as Facility;

    if (type === 'edit') {
      this.updateData = facility;
      const address = facility.Address?.[0] || {};
      this.groups.practice.patchValue(formatPhoneInObj({ ...facility, ...address }));
    }
    if (type === 'delete') {
      this.alert.confirm('Are you sure you want to delete this row?').then(confirm => {
        if (confirm) {
          if (facility?.Id) {
            this.toDelete.push(String(facility.Id));
          }
          this.practiceData.set(this.practiceData().filter(x => x !== data));
        }
      });
    }
  }

  private get preparedFacilityData(): PFacility {
    const formData = this.groups.practice.value as FacilityForm;
    const addressObj = {
      Line1: formData.Line1 || '',
      Line2: formData.Line2 || '',
      City: formData.City || '',
      State: formData.State || '',
      Zipcode: formData.Zipcode || ''
    };

    return sanitizeObj({
      PracticeGroup: formData.PracticeGroup || '',
      Email: formData.Email || '',
      Fax: formData.Fax || null,
      OfficeName: formData.PracticeGroup || '',
      Rank: 3, // Default rank or logic for dynamic rank
      Id: this.updateData?.Id, // Retain existing ID
      Phone: formData.Phone || null,
      PhoneType: 'Office', // Default phone type
      Extension: null, // Default extension
      Address: [addressObj],
      Contacts: (this.updateData?.Contacts as FacilityContact[]) || [] // Retain existing contacts
    });
  }

  addFacility() {
    const newFacility = this.preparedFacilityData;
    const exists = this.practiceData().some(
      x => x.OfficeName?.trim() === newFacility.OfficeName?.trim()
    );

    if (exists) {
      this.toast.warning(`${newFacility.OfficeName} is already added`);
      return;
    }

    this.practiceData.update(x => [...new Set([newFacility, ...x])]);
    this.addedFacilities.update(x => [...x, newFacility]);
    this.groups.practice.reset();
    this.hasUnsavedChanges.set(true);
  }

  updateFacility() {
    const facilityForm = this.groups.practice;
    if (!facilityForm.valid || !this.updateData) return;

    const updatedFacility = this.preparedFacilityData;
    this.practiceData.update(x => [updatedFacility, ...x.filter(d => d !== this.updateData)]);
    this.updatedFacilities.update(x => [...x, updatedFacility]);

    this.updateData = null;
    facilityForm.reset();
    this.hasUnsavedChanges.set(true);
  }

  cancelUpdateFacility() {
    this.groups.practice.reset();
    this.updateData = null;
  }

  addFacilityByNPI(prescriberOverride?: {
    prescriberNPI: string;
    firstName: string;
    lastName: string;
  }) {
    const formValue = this.groups.prescriber?.value as searchByNPIForm;
    const { prescriberNPI, firstName, lastName } = prescriberOverride ?? formValue;
    if (this.prescribers().find(x => x.prescriberNPI === prescriberNPI)) {
      this.toast.warning(`Prescriber ${firstName} ${lastName} is already added..!`);
      return;
    }
    // this.reRenderTable();
    const formattedValue = `${prescriberNPI}/${firstName.trim()}/${lastName.trim()}`;
    this.api.call
      .get<[{ Id: number; Facilities: PrescriberFacility[] }]>('provider/' + formattedValue)
      .subscribe({
        next: res => this.handlePrescriberResponse(res, prescriberNPI, firstName, lastName),
        error: () => this.handlePrescriberError()
      });
  }

  private handlePrescriberResponse(
    res: { Status: string; Payload: [{ Id: number; Facilities: PrescriberFacility[] }] },
    prescriberNPI: string,
    firstName: string,
    lastName: string
  ) {
    if (res.Status !== 'SUCCESS') {
      this.errMsg.set(NPI_ERROR_MSG);
      console.error('No facilities found in response or invalid response structure.');
      return;
    }
    this.errMsg.set('');
    const prescriberData = res.Payload[0];
    this.prescriberId = prescriberData?.Id;
    const facilities = this.uniqueFacilities(
      prescriberData?.Facilities.map(facility => ({
        PracticeGroup: facility.GroupName || '',
        Email: facility.Email ?? '',
        Fax: facility.Fax || '',
        OfficeName: facility.Name || '',
        Rank: 1,
        Id: facility.Id || null,
        Phone: facility.Phone || '',
        PhoneType: 'Office',
        Address: [
          {
            Line1: facility.Address1 || '',
            Line2: facility.Address2,
            City: facility.City || '',
            State: facility.State || '',
            Zipcode: `${facility.Zip || ''}${facility.ZipSuffixCode ? '-' + facility.ZipSuffixCode : ''}`
          }
        ],
        Contacts: []
      }))
    );

    const prescriberInfo: PrescriberWithFacilities = {
      providerId: this.prescriberId,
      prescriberNPI,
      firstName,
      lastName,
      facilities,
      selectedFacilities: []
    };
    this.updatePrescribersList(prescriberInfo);
    this.latestNpiPrescriber.set(prescriberInfo);
    this.editPrescriberFacilities(this.prescribers().length - 1);
    // this.prescribers.update(x => [...x, prescriberInfo]);
    // console.log(this.prescribers());
    // this.assPopupOpen = true;
    this.groups.prescriber.reset?.();
  }

  private updatePrescribersList(newPrescriber: PrescriberWithFacilities) {
    const existingIndex = this.prescribers().findIndex(
      x => x.prescriberNPI === newPrescriber.prescriberNPI
    );
    const updatedPrescribers = [...this.prescribers()];
    if (existingIndex >= 0) {
      updatedPrescribers[existingIndex] = newPrescriber;
    } else {
      updatedPrescribers.push(newPrescriber);
    }
    this.prescribers.set(updatedPrescribers);
  }

  private handlePrescriberError() {
    this.errMsg.set(NPI_ERROR_MSG);
  }

  closePrescriberPopup() {
    const prescribers = this.prescribers();
    prescribers.at(this.selectedPrescriberIdx()!)!.selectedFacilities =
      this.prescriberSelectedFacilities();
    this.prescribers.set(prescribers);
    this.assPopupOpen = false;
    this.latestNpiPrescriber.set(null);
    this.prescriberSelectedFacilities.set([]);
  }

  selectFacility(e: unknown[]) {
    if (this.selectedPrescriberIdx() === null) return;
    const validFacilities = e.filter(
      (item): item is Facility =>
        item !== null &&
        typeof item === 'object' &&
        'PracticeGroup' in item &&
        'Email' in item &&
        'Fax' in item
    ) as PFacility[];
    this.prescriberSelectedFacilities.set([
      ...this.uniqueFacilities(
        validFacilities.map(x => ({ ...x, Address: [this.getAddress(x.Address ?? [])] }))
      )
    ]);
    // const prescribers = this.prescribers();
    // const editingPrescriber = prescribers[this.selectedPrescriberIdx];
    // if (editingPrescriber) {
    //   editingPrescriber.selectedFacilities = [
    //     ...validFacilities.map(x => ({ ...x, Address: [this.getAddress(x.Address ?? [])] }))
    //   ] as Facility[];
    //   this.prescribers.set(prescribers);
    // }
    this.hasUnsavedChanges.set(true);
  }

  editPrescriberFacilities(idx: number) {
    this.selectedPrescriberIdx.set(idx);
    const preSelect = () => {
      if (this.selectedPrescriberIdx() !== null && this.selectedPrescriberIdx()! >= 0) {
        const prescriber = this.prescribers()[this.selectedPrescriberIdx()!];
        const selectedFacilities = prescriber.selectedFacilities.map(x => x.Id);
        const result = prescriber.facilities.filter(x => selectedFacilities.includes(x.Id));
        this.prescriberSelectedFacilities.set(result);
        return result;
      }
      return [];
    };
    this.preSelectedRows.set(preSelect());
    this.reRenderTable();
    // const p = this.prescribers()[idx];
    // this.addFacilityByNPI({
    //   prescriberNPI: p.prescriberNPI,
    //   firstName: p.firstName,
    //   lastName: p.lastName
    // });
    this.assPopupOpen = true;
  }

  removePrescriber(idx: number) {
    this.alert.confirm('Are you sure you want to delete this prescriber?').then(confirmed => {
      if (!confirmed) return;
      const prescribers = [...this.prescribers()];
      const target = prescribers[idx];
      if (target?.providerId) this.toDelete.push(String(target.providerId));
      prescribers.splice(idx, 1);
      this.prescribers.set(prescribers);
      this.reRenderTable();
    });
  }

  reRenderTable() {
    this.updateTable.set(false);
    this.searchTerm.set('');
    setTimeout(() => this.updateTable.set(true), 50);
  }

  onSave() {
    if (this.activeTab === 'prescriber') {
      this.savePrescriberData();
      this.data.caseDataRs.reload();
    } else {
      this.saveFacilities();
    }
    if (this.toDelete.length > 0) {
      this.deletdData();
    }
    this.addedFacilities.set([]);
    this.updatedFacilities.set([]);
  }

  private saveFacilities() {
    const facilitiesSource = [...this.addedFacilities(), ...this.updatedFacilities()];
    if (facilitiesSource.length === 0) return;
    const masterAccountId = this.data.accountInfoRs.value()?.Payload?.PortalAccountPkId as number;
    const username = this.data.accountInfoRs.value()?.Payload?.Username as string;
    const contacts = this.getContact();
    const saveRequests = facilitiesSource.map(facility => {
      const payload: AccountUpdatePayload = {
        Username: username,
        MasterAccountId: masterAccountId,
        IsNewUser: false,
        MasterFacility: {
          PracticeGroup: facility.PracticeGroup || '',
          Email: null,
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

      return lastValueFrom(this.addFacilityOrProvider(payload)).then(res => {
        const message =
          res?.Status === 'SUCCESS'
            ? `Facility "${facility.OfficeName}" saved successfully`
            : `Failed to save facility "${facility.OfficeName}"`;

        if (res.Status === 'SUCCESS') {
          this.toast.success(message);
        } else {
          this.toast.error(message);
        }
      });
    });

    Promise.all(saveRequests).then(() => {
      this.hasUnsavedChanges.set(false);
      this.facilitiesRs.reload();
      this.data.accountInfoRs.reload();
    });
  }

  private savePrescriberData() {
    if (this.selectedPrescriberIdx === null) return;
    const selectedFacilities =
      this.prescribers()[this.selectedPrescriberIdx()!]?.selectedFacilities;
    if (!selectedFacilities) return;
    const masterAccountId = this.data.accountInfoRs.value()?.Payload?.PortalAccountPkId as number;
    const username = this.data.accountInfoRs.value()?.Payload?.Username as string;
    const contacts = this.getContact();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {
      MasterAccountId: masterAccountId,
      IsNewUser: false,
      Username: username,
      Facilities: selectedFacilities.map(facility => ({
        PracticeGroup: facility.PracticeGroup || '',
        Email: facility.Email || null,
        Fax: facility.Fax || null,
        OfficeName: facility.OfficeName || '',
        Rank: facility.Rank ?? 3,
        Id: Number(facility.Id) || 0,
        Phone: facility.Phone || null,
        Extension: null,
        Address: this.getAddress(facility.Address ?? []),
        Contacts: contacts
      }))
    };

    if (this.activeTab === 'prescriber') {
      if (this.toDelete.length > 0) {
        this.deletdData();
        return;
      }
      (payload as AccountUpdatePayload & { PrescriberId: number }).PrescriberId =
        this.prescriberId == null
          ? Number(
              (this.prescribers()[this.selectedPrescriberIdx()!] as { providerId?: string })
                ?.providerId
            )
          : Number(this.prescriberId);
    }

    this.addFacilityOrProvider(payload).subscribe(res => {
      if (res.Status === 'SUCCESS') {
        this.toast.success('Facilities saved successfully');
        this.updatePrescriberStatus(this.selectedPrescriberIdx()!, 'Pending');
        this.hasUnsavedChanges.set(false);
        this.facilitiesRs.reload();
        this.data.accountInfoRs.reload();
      } else {
        this.toast.error('Failed to save facilities');
      }
    });
  }

  private updatePrescriberStatus(index: number, status: string) {
    this.prescribers.update(prescribers =>
      prescribers.map((p, i) => (i === index ? { ...p, AccountStatus: status } : p))
    );
  }

  private deletdData() {
    if (this.toDelete.length === 0) return;
    const endpoint =
      this.activeTab === 'practice'
        ? `portal/account/deleteFacility/${this.api.tokenInfo()?.acctid}`
        : `portal/account/deleteProvider/${this.api.tokenInfo()?.acctid}`;
    lastValueFrom(
      this.api.call.put<string[], DeleteProviderResponse>(endpoint, this.toDelete)
    ).then(res => {
      const message =
        res.Status === 'SUCCESS'
          ? this.activeTab === 'practice'
            ? 'Facilities deleted successfully'
            : 'Providers deleted successfully'
          : 'Failed to delete';

      if (res.Status === 'SUCCESS') {
        this.toast.success(message);
      } else {
        this.toast.error(message);
      }
    });
    this.toDelete = [];
  }

  private addFacilityOrProvider(payload: AccountUpdatePayload) {
    return this.api.call.post<AccountUpdatePayload, unknown>('account/update', payload);
  }

  private getAddress(addressField: Address[] | Address): Address {
    if (Array.isArray(addressField)) {
      return {
        Line1: addressField[0]?.Line1 || '',
        Line2: addressField[0]?.Line2 || null,
        City: addressField[0]?.City || '',
        State: addressField[0]?.State || '',
        Zipcode: addressField[0]?.Zipcode || ''
      };
    }
    return addressField;
  }

  private getContact(): FacilityContact[] {
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

interface FacilityForm {
  PracticeGroup: string;
  Phone: string | null;
  Fax: string | null;
  Email: string | null;
  Line1: string;
  Line2: string;
  City: string;
  State: string;
  Zipcode: string;
}

interface searchByNPIForm {
  prescriberNPI: string;
  firstName: string;
  lastName: string;
}

interface PrescriberFacility {
  Id: number;
  Name: string;
  GroupName: string;
  Address1: string;
  Address2: string | null;
  City: string;
  County: string | null;
  State: string;
  Phone: string;
  Fax: string;
  Email: string;
  Zip: string;
  ZipSuffixCode: string;
}

interface PrescriberWithFacilities {
  prescriberNPI: string;
  AccountStatus?: string;
  firstName: string;
  lastName: string;
  facilities: Facility[] | PFacility[];
  selectedFacilities: PFacility[];
  providerId?: number;
}

interface FacilityAddress {
  City: string;
  Line1: string;
  Line2: string | null;
  State: string;
  Zipcode: string;
}

export interface FacilityContact {
  Id: number | null;
  Email: string;
  Fax: string;
  FirstName: string;
  LastName: string;
  OfficeContactType: string;
  Rank: number;
  Title: string | null;
  Phone: string;
  Extension: string | null;
}

interface FacilityPayload {
  PracticeGroup: string;
  Email: string;
  Fax: string;
  OfficeName: string;
  Rank: number;
  Id: number | string | null;
  Phone: string;
  Extension: string | null;
  Address: FacilityAddress[];
  Contacts: FacilityContact[];
  FacilityContacts?: FacilityContact[];
}

interface AccountUpdatePayload {
  Username?: string;
  MasterAccountId: number;
  IsNewUser: boolean;
  PrescriberId?: number | null;
  Facilities?: FacilityPayload;
  MasterFacility?: Facility;
}

interface DeleteProviderResponse {
  StatusCode: number;
  Message: string;
}

interface UserDetails {
  FirstName: string;
  LastName: string;
  Phone: string;
  Fax: string;
  Email: string;
  AccountStatus?: string | null;
}
