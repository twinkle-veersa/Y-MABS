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
