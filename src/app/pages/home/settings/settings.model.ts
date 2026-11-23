import { Facility } from 'app/pages/auth/register/register.component';

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

export interface FacilityForm {
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

export interface AccountUpdatePayload {
  Username?: string;
  MasterAccountId: number;
  IsNewUser: boolean;
  MasterFacility?: Facility;
}

export interface DeleteFacilityResponse {
  StatusCode: number;
  Message: string;
}

export interface UserDetails {
  FirstName: string;
  LastName: string;
  Phone: string;
  Fax: string;
  Email: string;
  AccountStatus?: string | null;
}

export interface IdMeVerifyReq {
  Email: string;
  PortalAccountId: number;
}

export interface IdMeVerifyRes {
  IsVerified: boolean;
  VerifiedOn: string;
  IdMeUserId: string;
}
