export interface CaseDetail {
  StatusCode: number;
  Domain: null;
  CaseInfo: CaseInfo;
  PatientDetails: PatientDetails;
  HCPInfo: HCPInfo;
  MedicalInsuranceInfo: MedicalInsuranceInfo;
  MedicalInsuranceListInfo: MedicalInsuranceListInfo[];
  PharmacyInsuranceInfo: PharmacyInsuranceInfo;
  PharmacyInsuranceInfoList: unknown[];
  CopayCardInfo: CopayCardInfo;
  CopayCardListInfo: unknown[];
  PrescriptionInfo: PrescriptionInfo[];
  ShipmentInfo: ShipmentInfo;
  CaseStatusHistory: CaseStatusHistory[];
  Fulfillments: unknown[];
  NurseEducation: NurseEducation;
  NurseTeach: NurseTeach;
  Documents: Document[];
  Notes: null;
  TherapyJourney: TherapyJourney[];
  Treatment: unknown[];
  Alerts: unknown[];
  Stages: Stages;
  CaseFacilities: CaseFacility[];
  PrescriberID: number;
  HIPAAConsent: boolean;
  InitialSiteOfCare: null;
  MedicationAdministrationList: unknown[];
  AdministrationHCPInfo: AdministrationHCPInfo;
  SiteOfCareInfo: SiteOfCareInfo;
  OrdersAndShipmentsInfo: ShipmentInfo;
  CaseInteractionHistory: unknown[];
  NotesCategory: unknown[];
}

interface SiteOfCareInfo {
  FacilityName: null;
  Specialties: null;
  NPI: null;
  TreatmentSetting: null;
  Office: Office3;
  OfficeContact: OfficeContact2;
}

interface OfficeContact2 {
  FirstName: null;
  LastName: null;
  Email: null;
  Phone: null;
  Fax: null;
}

interface Office3 {
  Address: Address3;
  Phone: null;
  Fax: null;
}

interface AdministrationHCPInfo {
  FirstName: null;
  LastName: null;
  Specialties: null;
  NPI: null;
  TreatmentSetting: null;
  FacilityName: null;
  Office: Office2;
  OfficeContact: OfficeContact;
}

interface Office2 {
  Address: Address3;
  Phone: null;
  Fax: null;
  FacilityFax: null;
}

interface Address3 {
  Line1: null;
  Line2: null;
  City: null;
  State: null;
  PostalCode: null;
}

interface CaseFacility {
  id: number;
  caseDataId: number;
  facility: Facility;
  isActive: boolean;
  isPreferred: boolean;
  prescriberPkId: number;
  prescriberType: null;
  auditFields: AuditFields2;
  prescriber: Prescriber;
  administrationSetting: null;
  active: boolean;
}

export interface Prescriber {
  id: number;
  partyTypeCode: number;
  programPkId: null;
  partyLicenses: unknown[];
  auditFields: AuditFields3;
  firstName: string;
  middleInitial: string;
  lastName: string;
  nameSuffixCode: number;
  nameTitleCode: number;
  gender: null;
  dateOfBirth: null;
  preferredName: null;
  maritalStatusCode: null;
  languageCode: null;
  requiresTranslator: null;
  last4SSN: null;
  suffixValue: null;
  priorId: null;
  externalId: null;
  typeCode: number;
  taxIdentifier: null;
  prescriberStatus: null;
  statusDesc: string;
  typeShortDescription: null;
  prescriberType: number;
  isPAByMD: boolean;
  isAppealsByMD: boolean;
  isKOL: boolean;
  isVIP: boolean;
  peerToPeer: boolean;
  npiNumber: string;
  ptan: string;
  preferredNurses: null;
  excludedNurses: null;
  inactiveReason: null;
  infoSource: number;
  stateLicenses: StateLicense[];
  deaLicenses: DeaLicense[];
  sanctions: unknown[];
  isTrialApplicable: null;
  certificationNumber: null;
  certificationEfffectiveDate: null;
  certificationExpirationDate: null;
  eRxAuthorization: null;
  paByCoverMyMeds: null;
  erxAuthorizationDate: null;
  erxAuthorizationExpirationDate: null;
  masterAddress: null;
  isPrescriberNew: null;
  isUnderDirectionOfPrescriber: null;
  isVAHCP: null;
  isParticipatingInCC: null;
  isInsurancedContracted: null;
  specialities: Speciality[];
  practices: null;
  specialitiesName: string;
  age: number;
  name: string;
  vipindicator: number;
  addresses: Address2[];
  phones: Phone2[];
  emails: unknown[];
  phoneTypeMap: PhoneTypeMap2;
  faxes: Phone2[];
  entityActive: boolean;
  emailTypeMap: object;
  addressTypeMap: AddressTypeMap2;
  activePartyLicenses: unknown[];
  programId: string;
}

interface AddressTypeMap2 {
  BUSINESS: Address2;
}

interface PhoneTypeMap2 {
  Office: Phone2;
  Fax: Phone2;
}

interface Phone2 {
  id: number;
  phoneNumber: string;
  phoneExtNumber: null;
  phoneType: PhoneType2;
  auditFields: null;
  phoneDisplayName: null;
  active: boolean;
}

interface PhoneType2 {
  id: number;
  entityId: number;
  addressId: null;
  isPreferred: boolean;
  phoneType: string;
  isAllowsVoicemail: boolean;
  bestTimeToCall: null;
  phoneRank: null;
  active: boolean;
}

interface Address2 {
  id: number;
  warningText: null;
  line1: string;
  line2: string;
  city: string;
  county: null;
  state: string;
  zip: string;
  country: string;
  zipSuffixCode: string;
  addressType: AddressType;
}

interface Speciality {
  id: number;
  value: string;
  active: boolean;
}

interface DeaLicense {
  providerDealicensePkId: number;
  providerPkId: number;
  licenseNumber: string;
  drugSchedule: string;
  status: null;
  overallEligibility: string;
  businessActivityCode: string;
  businessActivitySubcode: string;
  effectiveDate: null;
  deactivationDate: string;
  lastVerfied: string;
  lastReceived: string;
  isActive: boolean;
  auditFields: AuditFields3;
}

interface StateLicense {
  id: number;
  providerId: number;
  licenseNumber: string;
  state: string;
  status: null;
  specialty: null;
  professionalDesignation: null;
  professionalDesignationFamily: null;
  lastReceived: null;
  deactivationDate: null;
  effectiveDate: null;
  lastVerifiedDate: null;
  auditFields: null;
  active: boolean;
}

interface AuditFields3 {
  createDateTime: string;
  createdBy: string;
  updateDateTime: string;
  updatedBy: string;
}

interface Facility {
  id: number;
  partyTypeCode: number;
  programPkId: number;
  partyLicenses: unknown[];
  auditFields: AuditFields2;
  name: string;
  parentId: null;
  organizationTypeCode: number;
  drugGroupValue: null;
  facilityAddressPkId: number;
  facilityType: FacilityType;
  prescriberId: null;
  rank: null;
  needsReview: null;
  isClosedForLunch: null;
  groupName: string;
  npiNumber: null;
  taxID: null;
  specialtySet: unknown[];
  isBAA1: null;
  notes: null;
  isActive: boolean;
  isDefaultTarget: null;
  prescriberCommercialNumber: null;
  locationNumber: null;
  stateLicenseNumber: null;
  spiDirectory: null;
  isVAFacility: null;
  linkedToAccount: boolean;
  distributorAccountId: null;
  accountStatus: null;
  prescirberId: null;
  providerPractice: ProviderPractice;
  addresses: ProviderPractice[];
  phones: Phone[];
  emails: Email[];
  phoneTypeMap: PhoneTypeMap;
  faxes: Phone[];
  entityActive: boolean;
  emailTypeMap: EmailTypeMap;
  addressTypeMap: AddressTypeMap;
  activePartyLicenses: unknown[];
  programId: string;
}

interface AddressTypeMap {
  Provider_Practice: ProviderPractice;
}

interface EmailTypeMap {
  Company: Email;
}

interface PhoneTypeMap {
  Office: Phone;
  Fax: Phone;
}

interface Email {
  id: number;
  email: string;
  noAskIndicator: boolean;
  sendInformation: boolean;
  textHtmlind: boolean;
  emailType: EmailType;
}

interface EmailType {
  id: number;
  entityId: number;
  emailType: string;
  preferred: boolean;
  active: boolean;
}

interface Phone {
  id: number;
  phoneNumber: string;
  phoneExtNumber: null;
  phoneType: PhoneType;
  auditFields: null;
  phoneDisplayName: null;
  active: boolean;
}

interface PhoneType {
  id: number;
  entityId: number;
  addressId: null;
  isPreferred: null;
  phoneType: string;
  isAllowsVoicemail: null;
  bestTimeToCall: null;
  phoneRank: null;
  active: boolean;
}

interface ProviderPractice {
  id: number;
  warningText: null;
  line1: string;
  line2: string;
  city: string;
  county: string;
  state: string;
  zip: string;
  country: string;
  zipSuffixCode: string;
  addressType: AddressType;
}

interface AddressType {
  id: number;
  entityId: number;
  addressType: string;
  active: boolean;
  primary: boolean;
}

interface FacilityType {
  id: number;
  value: string;
  isActive: boolean;
}

interface AuditFields2 {
  createDateTime: string;
  createdBy: string;
  updateDateTime: null;
  updatedBy: null;
}

interface Stages {
  Intake: Intake;
  'Benefit Investigation': Intake;
}

interface Intake {
  CaseId: number;
  Stage: string;
  StartTime: string;
  EndTime: string;
  ActiveTaskName: null;
  TaskOwner: null;
  AuditFields: AuditFields;
}

interface AuditFields {
  CreateDateTime: string;
  CreatedBy: string;
  UpdateDateTime: string;
  UpdatedBy: string;
}

interface TherapyJourney {
  TherapyStatus: string;
  TherapySubStatus: string;
  TherapyStatusDate: string;
}

interface Document {
  DocumentType: string;
  DocumentDate: string;
  DocumentURL: string;
}

interface NurseTeach {
  Overview: Overview;
  History: unknown[];
}

interface Overview {
  ExternalPatientId: null;
  CarePlanStatus: null;
  DischargeDate: null;
  Disposition: null;
  DispositionDetails: null;
}

interface NurseEducation {
  NurseAdherenceServices: NurseAdherenceServices;
  NurseAdherenceCallActivity: null;
}

interface NurseAdherenceServices {
  RequestReceivedDate: null;
  TherapyStartDate: null;
  VMSPatientId: null;
  Optin: null;
  Optout: null;
  OptoutDetail: null;
  DiscontinuedDate: null;
  DiscontinuedReason: null;
  ReactivatedDate: null;
  WelcomeKitOrdered: string;
  OrderedDate: null;
}

interface CaseStatusHistory {
  StatusReceivedDate: string;
  Status: string;
  Substatus: string;
  StatusSource: string;
}

interface ShipmentInfo {
  Shipments: unknown[];
}

interface PrescriptionInfo {
  RxNumber: null;
  RxWrittenDate: null;
  Drug: string;
  NDC: string;
  Directions: null;
  PerDoseQuantity: null;
  Quantity: null;
  Refills: null;
  QuantityRemaining: string;
  RefillsRemaining: string;
  Status: null;
  Dosage: string;
  MDSignatureDate: null;
  TotalPerWeekDose: null;
}

interface CopayCardInfo {
  CopayCardStatus: null;
  DenialReason: null;
  EnrollmentDate: null;
  ExpirationDate: null;
  BIN: null;
  PCN: null;
  Group: null;
  ID: null;
  MaxAmountPerYear: null;
  MaxRxFillsPerYear: null;
  Claims: unknown[];
  MinOutOfPocketPerFill: null;
  MaxCopayCardAmount: null;
  CopayAmountUsed: null;
  RemainingAmount: null;
}

interface PharmacyInsuranceInfo {
  PayorName: null;
  PlanName: null;
  ExtPayorName: null;
  PayorType: null;
  PlanType: null;
  AdditionalCoverageInfo: null;
  PlanStatus: string;
  EffectiveDate: null;
  TerminationDate: null;
  BIN: null;
  PCN: null;
  Group: null;
  MemberID: null;
  Carveout: null;
  RelationshipToCardholder: null;
  ProductName: null;
  ProductNDC: null;
  DrugCovered: null;
  DrugFormulary: null;
  DrugTier: null;
  PriorAuthorizationRequired: null;
  AuthorizationType: null;
  AuthorizationPhone: null;
  AuthorizationFax: null;
  FormularyExceptionRequired: null;
  StepTherapyRequired: null;
  StepTherapyDrugs: unknown[];
  TriedAndFailedTreatments: unknown[];
  TierExceptionAvailable: null;
  TierExceptionPhone: null;
  TierExceptionFax: null;
  TierExceptionAuthType: null;
  MedicareCoveragePhase: null;
  LISLevel: null;
  LISAmountRemaining: null;
  LISStartDate: null;
  LISEndDate: null;
  PolicyHolder: string;
  PolicyHolderDOB: null;
  PharmacyCoverage: unknown[];
  PlanPhones: unknown[];
  PlanFaxes: unknown[];
}

interface MedicalInsuranceListInfo {
  PayorName: string;
  PlanName: string;
  PlanRank: string;
  PayorType: string;
  PlanType: null;
  PlanStatus: string;
  PlanCode: null;
  MemberID: string;
  Group: null;
  Employer: null;
  ProductName: null;
  ProductNDC: null;
  IANotes: null;
  AdditionalCoverageInfo: null;
  RelationshipToCardholder: null;
  EffectiveDate: null;
  TerminationDate: null;
  MajorMedicalCoverage: unknown[];
  HCPCCodeCovered: null;
  HCPCCoInsurance: null;
  PreDeterminationRequired: null;
  PreDeterminationType: null;
  PreDeterminationPhone: null;
  PreDeterminationFax: null;
  PolicyHolder: string;
  PolicyHolderDOB: string;
  PrescriberInNetwork: null;
  PCPReferralRequired: null;
  AOBAvailable: null;
  PlanPhones: unknown[];
  PlanAddresses: unknown[];
  Website: null;
  AdditionalServices: unknown[];
}

interface MedicalInsuranceInfo {
  PayorName: null;
  PlanName: string;
  PayorType: string;
  PlanType: null;
  PlanStatus: string;
  PlanCode: null;
  MemberID: string;
  Carveout: null;
  Group: null;
  Employer: null;
  RelationshipToCardholder: null;
  EffectiveDate: null;
  TerminationDate: null;
  MajorMedicalCoverage: unknown[];
  HCPCCodeCovered: null;
  HCPCCoInsurance: null;
  PreDeterminationRequired: null;
  PreDeterminationType: null;
  PreDeterminationPhone: null;
  PreDeterminationFax: null;
  PolicyHolder: string;
  PolicyHolderDOB: string;
  PrescriberInNetwork: null;
  PCPReferralRequired: null;
  AOBAvailable: null;
  PlanPhones: unknown[];
  PlanAddresses: unknown[];
  Website: null;
  IANotes: null;
  AdditionalCoverageInfo: null;
  AdditionalServices: AdditionalService[];
}

export type ServiceName = 'Product Coverage Details' | 'Administration';
export interface AdditionalService {
  Name: ServiceName;
  Copay: string;
  ProductOrServiceCovered: string;
  PriorAuthRequired: string;
  PriorAuthType: string;
  PriorAuthAuthPaperType: string;
  PriorAuthFax: string;
  PriorAuthPhone: string;
  PreDeterminationRequired: string;
  PreDeterminationAuthType: string;
  PreDeterminationAuthPaperType: string;
  PreDeterminationFax: string;
  PreDeterminationPhone: string;
  DrugAuthorizations: {
    AuthNumber: string;
    AuthType: string;
    EndDate: string;
    Outcome: string;
    StartDate: string;
    SubmittedBy: string;
    ServiceItemName: string;
  }[];
  BillingCodes: {
    code: string;
    description: string;
  }[];
  jCode?: string;
  // ExplanationSummary: string;
  // CoInsurance: string;
  // MaxOccurrences: string;
  // OccurrencesToDate: string;
}
interface HCPInfo {
  FirstName: string;
  LastName: string;
  Specialties: string[];
  NPI: string;
  CollaboratigHCP: null;
  CollaboratigNPI: null;
  Contacts: unknown[];
  PracticeName: string;
  PracticeNPI: null;
  Office: Office;
  SalesRep: SalesRep;
}

interface SalesRep {
  FirstName: string;
  LastName: string;
  Territory: string;
}

interface Office {
  Address: Address;
  Phone: string;
  Fax: string;
  OfficeContact: OfficeContact;
}

interface OfficeContact {
  FirstName: null;
  LastName: null;
  Email: null;
  Phone: null;
  Fax: null;
  AltPhone: null;
}

export interface PatientDetails {
  FirstName: string;
  LastName: string;
  MiddleName: string;
  PatientID: number;
  PatientExternalID: null;
  DateOfBirth: string;
  Gender: string;
  GenderIdentity: string;
  Caregiver: unknown[];
  Phone: string;
  MobilePhone: null;
  Address: Address;
  Email: string;
  DeidentifiedPatientID: string;
  PatientReceivedSample: null;
  PatientReceivedSampleDate: null;
  PatientStatus: null;
  PriorHubPatientId: null;
  PatientReps: unknown[];
  CurrentMedications: null;
  ActiveOnTherapy: string;
  UnmaskedPatientId: number;
}

interface Address {
  Line1: string;
  Line2: string;
  City: string;
  State: string;
  PostalCode: string;
}

export interface CaseInfo {
  CaseId: string;
  CaseStatus: string;
  CaseSubStatus: string;
  CaseSubStatusReason: string;
  CaseReferralDate: string;
  CaseType: string;
  ServiceType: string;
  PAPStatus: null;
  ModifiedIndicationCategory: null;
  Source: string;
  InquirySource: null;
  PAPEffectiveDate: null;
  PAPExpirationDate: null;
  PAPOutCome: null;
  ProgramName: string;
  HipaaConsentDate: null;
  LastActivityDate: string;
  TherapyStatus: string;
  TherapySubStatus: string;
  DiagnosisCode: null;
  DiagnosisCodeDescription: null;
  CaseManager: null;
  TemSupply: string;
  RefillDueDate: null;
  ConsumerID: null;
  HasRxProcessedBySP: null;
  CoverageRoute: null;
  DiagnosisList: DiagnosisList[];
  AntibioticCourseType: null;
  AntibioticDaysSupply: null;
  AntibioticStartDate: null;
  NumberOfRefills: null;
  CaseDisposition: null;
  IndicationCategory: null;
  ServiceRequested: unknown[];
}

interface DiagnosisList {
  Category: string;
  Code: string;
  Description: string;
  CPTModifier: null;
}
