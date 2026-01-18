import { computed, inject, Injectable, signal } from '@angular/core';
import { CaseData, CaseDataReq } from '../../app/pages/home/dashboard/dashboard.model';
import { API } from '@constants/endpoints';
import { ApiService } from '@shared/services/api.service';
import { sanitizeArrayResponse } from '@shared/utils/utility.functions';
import { ProfileInfo } from '../../app/pages/profile/profile.model';
import { ENDPOINTS } from '@constants/profile';

const MINUTES_UNITL_AUTO_LOGOUT = 14; // in mins
const CHECK_INTERVAL = 30000; // in ms
const STORE_KEY = 'actvt';

@Injectable()
export class DataService {
  private api = inject(ApiService);
  accountInfoRs = this.api.getRs<ProfileInfo>(
    ENDPOINTS.accountInfo + this.api.tokenInfo()!.acctname,
    { query: { ShowAccountIndicator: 'True' } }
  );
  activePrescribers = computed(() =>
    this.accountInfoRs.value()?.Payload.Providers.filter(x => x.AccountStatus === 'Active')
  );
  userDetails = computed(() => this.accountInfoRs.value()?.Payload.UserDetails);
  userPrescribers = computed(() => this.accountInfoRs.value()?.Payload.Providers);
  sortedPatients = computed(() => {
    const payload = sanitizeArrayResponse(this.caseDataRs.value()?.Payload) ?? [];
    return payload
      .filter(item => !!item.CaseId)
      .sort((a, b) => {
        const aId = parseInt(a.CaseId!.slice(3));
        const bId = parseInt(b.CaseId!.slice(3));
        return bId - aId;
      });
  });

  pylarifyPatients = computed(() => {
    const map = new Map<string, CaseData>();

    this.sortedPatients()
      .filter(item => {
        const drugValue = item?.DrugGroup?.Value?.trim?.().toLowerCase();
        return (
          drugValue === 'pylarify' &&
          typeof item.PatientId === 'number' &&
          typeof item.CaseId === 'string' &&
          !!item.PatientName &&
          !!item.DateOfBirth
        );
      })
      .forEach(item => {
        const name = item.PatientName?.trim()?.toLowerCase() || '';
        const dob = item.DateOfBirth?.trim() || '';
        const key = `${name}_${dob}`;

        const currentCaseNum = parseInt(item.CaseId ? item.CaseId.slice(3) : '') || 0;
        const existing = map.get(key);
        const existingCaseNum = existing
          ? parseInt(existing.CaseId ? existing.CaseId.slice(3) : '') || 0
          : -1;

        if (!existing || currentCaseNum > existingCaseNum) {
          map.set(key, item);
        }
      });

    return Array.from(map.values());
  });

  enrichedPatients = computed(() => {
    let idCounter = 0;
    return this.sortedPatients().map(m => ({
      ...m,
      id: idCounter++,
      formattedDOB: this.getFormattedDate(m.DateOfBirth)
    }));
  });

  caseDataRs = this.api.getRs<CaseData[], CaseDataReq>(API.CASE_DATA, {
    query: {
      prescriberIds: (this.api.tokenInfo()?.prescribers ?? []).join(','),
      masterPortalAccountId: this.api.tokenInfo()!.acctid
    }
  });
  caseData = computed(() =>
    (sanitizeArrayResponse(this.caseDataRs.value()?.Payload) ?? [])
      .map(item => {
        if ('prescriberId ' in item) {
          item.prescriberId = (item['prescriberId '] as string)?.trim() ?? ' ';
        }

        return item as CaseData;
      })
      .sort((a, b) => {
        const aId = parseInt(a.CaseId!.slice(3));
        const bId = parseInt(b.CaseId!.slice(3));
        return bId - aId;
      })
  );

  patientsData = computed(() =>
    this.caseData()
      .map((caseItem: CaseData) => {
        const providerDetails = this.getProviderDetailsById(Number(caseItem.prescriberId));

        return {
          CaseId: caseItem.CaseId,
          PatientId: String(caseItem.PatientId),
          PatientName: String(caseItem.PatientName),
          DateOfBirth: caseItem.DateOfBirth,
          PrescriberName: providerDetails?.fullName || '',
          PrescriberNpi: providerDetails?.npi || '',
          DateSubmitted: this.getFormattedDate(caseItem.CaseStartDate),
          EnrollmentSource: caseItem.CaseType,
          ActionNeeded: caseItem.ActionNeeded ? 'Yes' : 'No',
          EnrollmentStatus: caseItem.EnrollmentStatus,
          CaseStatus: caseItem.CaseStatus
        };
      })
      .filter((item, index, self) => index === self.findIndex(t => t.PatientId === item.PatientId))
      .sort((a, b) => {
        const aId = parseInt(a.PatientId);
        const bId = parseInt(b.PatientId);
        return aId - bId;
      })
  );

  selectedPatient = signal<CaseData | null>(null);

  // Check Idle State
  constructor() {
    this.initListener();
    this.initInterval();
  }

  getProviderDetailsById(providerId: number): { fullName: string; npi: string } | null {
    const provider = this.accountInfoRs
      .value()
      ?.Payload.Providers.find(p => p.ProviderId === providerId);
    if (provider) {
      return {
        fullName: `${provider.FirstName} ${provider.LastName}`,
        npi: provider.NPI
      };
    }
    return null;
  }

  private get lastAction() {
    return sessionStorage.getItem(STORE_KEY)
      ? parseInt(sessionStorage.getItem(STORE_KEY)!, 10)
      : null;
  }

  private setLastAction(lastAction: number) {
    if (sessionStorage.getItem('token')) {
      sessionStorage.setItem(STORE_KEY, lastAction.toString());
    }
  }

  private initListener() {
    if (sessionStorage.getItem('token')) {
      document.body.addEventListener('click', () => this.reset());
      document.body.addEventListener('mouseover', () => this.reset());
      document.body.addEventListener('mouseout', () => this.reset());
      document.body.addEventListener('keydown', () => this.reset());
      document.body.addEventListener('keyup', () => this.reset());
      document.body.addEventListener('keypress', () => this.reset());
    }
  }

  private reset() {
    this.setLastAction(Date.now());
  }
  private initInterval() {
    setInterval(() => this.check(), CHECK_INTERVAL);
  }
  private check() {
    if (sessionStorage.getItem('token')) {
      const timeleft = (this.lastAction || 0) + MINUTES_UNITL_AUTO_LOGOUT * 60 * 1000;
      if (timeleft - Date.now() < 0) this.api.logout();
    }
  }

  private getFormattedDate(d: string | undefined) {
    if (d === undefined) {
      // Handle undefined case
      return 'Invalid date';
    }
    const date = new Date(d);
    const year = date.getFullYear();

    let month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;

    let day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;

    return month + '/' + day + '/' + year;
  }
}
