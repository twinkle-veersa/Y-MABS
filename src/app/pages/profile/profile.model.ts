import { FacilityContact } from '../home/settings/settings.model';

export interface ReqPass {
  CurrentPassword: string;
  Password: string;
  PasswordConfirmation: string;
  UserName: string | null;
}

export interface ResPass {
  Message: string;
}

export interface ReqSec {
  PortalAccountId: number;
  CurrentPassword: string;
  SecurityQuestion: [
    { Id: number; Answer: string },
    { Id: number; Answer: string },
    { Id: number; Answer: string }
  ];
}

export interface ResSec {
  StatusCode: number;
  Message: string;
  ErrorMessage?: string;
}

export interface SecurityFormValue {
  CurrentPassword: string;
  [key: string]: string;
}

export interface ReqInfo {
  MasterAccountId: number;
  UserContactDetails: ReqInfoUser;
}

export interface ReqInfoUser {
  Id: null;
  FirstName: string;
  LastName: string;
  Title: string;
  Email: string;
  EmailType: null;
  Phone?: string | null;
  Fax?: string | null;
}

export interface ResInfo {
  StatusMessage: string;
}

export interface SecurityQuestion {
  Id: number;
  QuestionType: QuestionType;
  SequenceNumber: string;
  QuestionText: string;
  IsActive: boolean;
  Choices: [];
}

interface QuestionType {
  QuestionTypePkId: number;
  Value: string;
  IsActive: boolean;
}

export interface ProfileInfo {
  FirstName: string;
  LastName: string;
  Username: string;
  PortalAccountPkId: number;
  Role: Role;
  Providers: Provider[];
  UserDetails: UserDetails;
}

export interface SecurityQuestionPayload {
  SecurityQuestion: { Id: number };
}

interface UserDetails {
  FirstName: string;
  LastName: string;
  Phone: string;
  Fax: string;
  Email: string;
  AccountStatus: null;
}

interface Role {
  RolePkId: number;
  Value: string;
  Active: boolean;
}

export interface Provider {
  ProviderId: number;
  FirstName: string;
  AccountStatus: string;
  AccountType: string;
  LastName: string;
  NPI: string;
  PTAN: null;
  TaxId: null;
  StateLicenses: StateLicense[];
  DEALicenses: unknown[];
  Facilities: Facility[];
}

export interface Facility {
  Id?: number | string | null;
  PracticeGroup?: string;
  OfficeName?: string;
  PrescriberId?: number;
  Address?: Address[];
  Phone?: string | null;
  Extension?: null | string;
  Fax?: string | null;
  Email?: null | string;
  LinkedToAccount?: boolean;
  AccountStatus?: string;
  Rank?: number | null;
  FacilityContacts?: FacilityContact[];
  Contacts?: FacilityContact[];
}

interface Address {
  Line1?: string;
  Line2?: null | string;
  Suite?: string;
  City?: string;
  State?: string;
  Zipcode?: string;
}

interface StateLicense {
  State: string;
  Number: string;
}
