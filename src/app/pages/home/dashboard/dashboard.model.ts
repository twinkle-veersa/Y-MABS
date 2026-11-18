import { DASHBOARD_STATUSES, DashboardStatusKey } from '@constants/dashboard';

interface AuditFields {
  CreateDateTime: string;
  CreatedBy: string;
  UpdateDateTime?: string | null;
  UpdatedBy?: string | null;
}

interface TherapyStatus {
  TherapyStatusPkID: number;
  Value: string;
  EpressionRule?: string | null;
  IsActive: boolean;
  AuditFields: AuditFields;
}

interface TherapySubStatus {
  TherapySubStatusPkId: number;
  Value: string;
  TherapyStatus: TherapyStatus;
  EpressionRule?: string | null;
  IsActive: boolean;
  CanIterate: boolean;
  TherapyStatusGroupName?: string | null;
  AuditFields: AuditFields;
}

interface TherapyJourney {
  PatientTherapyJourneyPkId: number;
  PatientPkId: number;
  DrugPkId?: number | null;
  TherapyStatus: TherapyStatus;
  TherapySubStatus: TherapySubStatus;
  CaseDataPkId: number;
  IsActive: boolean;
  AuditFields: AuditFields;
  CreateDateTime: string;
}

interface DrugGroup {
  Id: number;
  Value: string;
  IsActive: boolean;
}

export interface CaseData {
  prescriberId?: string;
  PatientId?: number | string;
  PatientName?: string;
  PatientMiddleName?: string;
  DateOfBirth?: string;
  Gender?: string;
  GenderIdentity?: string | null;
  IsFavorite?: boolean;
  CaseId?: string;
  AntibioticEndDate?: string | null;
  CaseType?: string;
  CaseStartDate?: string;
  CaseStatus?: string;
  CaseStatusReason?: string;
  PapOutcome?: string | null;
  PapOutcomeDate?: string | null;
  ActiveStages?: string[];
  PracticeName?: string;
  Drug?: string;
  TherapyJourneys?: TherapyJourney[];
  PatientFullName?: string;
  DrugGroup?: DrugGroup;
  CollaboratingProvider?: string | null;
  Reverification?: boolean;
  ActionNeeded?: boolean | string;
  EnrollmentStatus?: string;
  PrescriberName?: string;
  NPI?: string;
  DateSubmitted?: string;
  EnrollmentSource?: string;
}

export interface CaseDataReq {
  prescriberIds: number[] | string;
  masterPortalAccountId: number;
}

export function dashboardStatus(item: CaseData): DashboardStatusKey {
  const status = (item.EnrollmentStatus ?? '').toLowerCase().replace(/[^a-z]/g, '');
  if (status === 'intake') return 'intake';
  if (status.startsWith('benefitinvestigation')) return 'benefitInvestigation';
  if (status.startsWith('insuranceauth')) return 'insuranceAuthRequired';
  if (status.startsWith('financialservice')) return 'financialServices';
  if (status === 'pap' || status.startsWith('papevaluation')) return 'papEvaluation';
  return 'other';
}

export function dashboardSummary(cases: CaseData[]) {
  const counts: Record<DashboardStatusKey, number> = {
    intake: 0,
    benefitInvestigation: 0,
    insuranceAuthRequired: 0,
    financialServices: 0,
    papEvaluation: 0,
    other: 0
  };
  for (const item of cases) {
    if (item.CaseStatus?.trim().toLowerCase() === 'open') counts[dashboardStatus(item)]++;
  }
  return DASHBOARD_STATUSES.map(status => ({ ...status, count: counts[status.key] }));
}

export function needsAction(item: CaseData): boolean {
  return item.ActionNeeded === true || /^(true|yes)$/i.test(String(item.ActionNeeded).trim());
}

export function dashboardStepSize(maximum: number): number {
  const thresholds = [20, 50, 100, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1000000];
  const steps = [3, 6, 10, 50, 100, 500, 1000, 5000, 10000, 50000, 100000];
  const index = thresholds.findIndex(threshold => maximum < threshold);
  return index === -1 ? 500000 : steps[index];
}
