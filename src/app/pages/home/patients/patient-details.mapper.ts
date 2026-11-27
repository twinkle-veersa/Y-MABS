import {
  PATIENT_DETAIL_COLUMNS,
  PATIENT_DETAIL_FIELDS,
  PatientDetailFields
} from '@constants/patient-details';
import type { ColConfig } from '@shared/components/table/table.component';
import type { CaseData } from '../dashboard/dashboard.model';
import type { CaseDetail } from './case-details.model';

export type PatientDetailRecord = Record<string, unknown>;
export interface PatientDisplayFields {
  left: { label: string; value: string }[];
  right: { label: string; value: string }[];
}

export function detailRecord(value: unknown): PatientDetailRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as PatientDetailRecord)
    : {};
}
function records(value: unknown): PatientDetailRecord[] {
  return Array.isArray(value)
    ? value.map(detailRecord).filter(item => Object.keys(item).length > 0)
    : [];
}
export function detailText(value: unknown): string {
  if (typeof value === 'number') return String(value);
  if (typeof value !== 'string') return '';
  const text = value.trim();
  return text === '--' ? '' : text;
}
export function detailFlag(value: unknown): string {
  if (value === undefined || value === null || value === '' || value === '--') return '';
  return /^(yes|true|y|1)$/i.test(String(value)) ? 'Yes' : 'No';
}
function join(values: unknown[], separator = ' '): string {
  return values.map(detailText).filter(Boolean).join(separator);
}
export function detailDate(value: unknown, includeTime = false): string {
  const text = detailText(value);
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return text;
  if (includeTime) {
    const date = new Date(text);
    if (!Number.isNaN(date.getTime()))
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
  }
  return `${Number(match[2])}/${Number(match[3])}/${match[1]}`;
}
function phone(value: unknown): string {
  const text = detailText(value);
  const digits = text.replace(/\D/g, '');
  return digits.length === 10
    ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    : text;
}
function read(source: PatientDetailRecord, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => detailRecord(value)[key], source);
}
export function detailFields(
  source: PatientDetailRecord,
  definitions: PatientDetailFields
): PatientDisplayFields {
  const map = (fields: PatientDetailFields['left']) =>
    fields
      .map(field => {
        const value = Array.isArray(field.key)
          ? join(field.key.map(key => read(source, key)))
          : read(source, field.key);
        return { label: field.label, value: displayValue(value, field.format) };
      })
      .filter(field => field.value !== '');
  return { left: map(definitions.left), right: map(definitions.right) };
}
function planPhone(value: unknown, type: string): string {
  return detailText(records(value).find(item => item['PhoneType'] === type)?.['Phone']);
}
function plans(
  root: PatientDetailRecord,
  listKey: string,
  singleKey: string
): PatientDetailRecord[] {
  const list = records(root[listKey]);
  if (list.length) return list;
  const single = detailRecord(root[singleKey]);
  return hasRecordData(single) ? [single] : [];
}
function hasRecordData(record: PatientDetailRecord): boolean {
  return Object.values(record).some(value => detailText(value) || typeof value === 'boolean');
}
function tableRows(rows: PatientDetailRecord[], columns: ColConfig[]): PatientDetailRecord[] {
  return rows.map(row =>
    Object.fromEntries(
      columns.map(({ key }) => {
        let format: 'date' | 'datetime' | 'phone' | undefined;
        if (/date/i.test(key))
          format = key === 'DateTime' || key === 'GenerateDate' ? 'datetime' : 'date';
        else if (/phone|fax/i.test(key)) format = 'phone';
        return [key, displayValue(row[key], format) || '--'];
      })
    )
  );
}
function authorizationRows(service: PatientDetailRecord): PatientDetailRecord[] {
  const rows: PatientDetailRecord[] = [];
  for (const [type, prefix] of [
    ['PA', 'PriorAuth'],
    ['PreD', 'PreDetermination']
  ]) {
    if (detailFlag(service[`${prefix}Required`]) !== 'Yes') continue;
    const authorization =
      records(service['DrugAuthorizations']).find(
        item =>
          (!item['ServiceItemName'] || item['ServiceItemName'] === service['Name']) &&
          (!item['IAType'] || item['IAType'] === type)
      ) ?? {};
    rows.push({
      iaType: type,
      available: 'Yes',
      authType:
        (service['Name'] === 'Administration' && service[`${prefix}AuthPaperType`]) ||
        service[`${prefix}Type`] ||
        service[`${prefix}AuthType`] ||
        service[`${prefix}AuthPaperType`],
      phone: service[`${prefix}Phone`],
      fax: service[`${prefix}Fax`],
      submittedBy: authorization['SubmittedBy'],
      outcome: authorization['Outcome'],
      startDate: authorization['StartDate'],
      endDate: authorization['EndDate'],
      authNumber: authorization['AuthNumber']
    });
  }
  return tableRows(rows, PATIENT_DETAIL_COLUMNS['authorization']);
}
function coverage(service: PatientDetailRecord) {
  const normalized = {
    ...service,
    BillingCodes: join(
      records(service['BillingCodes']).map(code => code['code']),
      ', '
    )
  };
  return {
    fields: detailFields(normalized, PATIENT_DETAIL_FIELDS['coverage']),
    rows: authorizationRows(service)
  };
}
function pharmacyAuthorizations(plan: PatientDetailRecord): PatientDetailRecord[] {
  const rows: PatientDetailRecord[] = [];
  for (const [type, key, prefix] of [
    ['PFE', 'FormularyExceptionRequired', 'Authorization'],
    ['PA', 'PriorAuthorizationRequired', 'Authorization'],
    ['TE', 'TierExceptionAvailable', 'TierException']
  ]) {
    const flag = detailFlag(plan[key]);
    if (!flag || (type === 'TE' && flag !== 'Yes')) continue;
    rows.push({
      iaType: type,
      available: flag,
      authType: plan[`${prefix}Type`] || plan[`${prefix}AuthType`],
      phone: plan[`${prefix}Phone`],
      fax: plan[`${prefix}Fax`]
    });
  }
  return tableRows(rows, PATIENT_DETAIL_COLUMNS['authorization']);
}
export function mapPatientDetail(
  data: CaseDetail | undefined,
  patient: CaseData | null | undefined,
  medicalIndex = 0,
  pharmacyIndex = 0
) {
  const root = detailRecord(data),
    caseInfo = detailRecord(root['CaseInfo']),
    patientInfo = detailRecord(root['PatientDetails']),
    prescriber = detailRecord(root['HCPInfo']);
  const medicalPlans = plans(root, 'MedicalInsuranceListInfo', 'MedicalInsuranceInfo');
  const pharmacyPlans = plans(root, 'PharmacyInsuranceInfoList', 'PharmacyInsuranceInfo');
  const medical = medicalPlans[medicalIndex] ?? medicalPlans[0] ?? {};
  const pharmacy = pharmacyPlans[pharmacyIndex] ?? pharmacyPlans[0] ?? {};
  const office = detailRecord(prescriber['Office']);
  const officeContact = detailRecord(office['OfficeContact']);
  const salesRep = detailRecord(prescriber['SalesRep']);
  const contact = records(prescriber['Contacts'])[0] ?? {};
  const representative =
    records(patientInfo['PatientReps'])[0] ?? records(patientInfo['Caregiver'])[0] ?? {};
  const services = records(medical['AdditionalServices']);
  const copayInfo = detailRecord(root['CopayCardInfo']);
  const copay = hasRecordData(copayInfo) ? [copayInfo] : records(root['CopayCardListInfo']);
  const shipments = records(detailRecord(root['ShipmentInfo'])['Shipments']);
  const normalizedCase = {
    ...caseInfo,
    CaseId: caseInfo['CaseId'] || patient?.CaseId,
    DateSubmitted: caseInfo['CaseReferralDate'] || patient?.CaseStartDate,
    EnrollmentStatus:
      patient?.EnrollmentStatus ||
      join([caseInfo['TherapyStatus'], caseInfo['TherapySubStatus']], ' - '),
    CaseStatus: detailCaseStatus(caseInfo['CaseStatus'] || patient?.CaseStatus),
    ActionNeeded: detailFlag(patient?.ActionNeeded),
    AdministrationSetting: root['InitialSiteOfCare']
  };
  const notes = records(root['Notes']).filter(note => note['Category'] === 'HCP Portal Note');
  return {
    case: detailFields(normalizedCase, PATIENT_DETAIL_FIELDS['case']),
    patient: detailFields(
      {
        ...patientInfo,
        ContactPhone: patientInfo['MobilePhone'] || patientInfo['Phone'],
        RepresentativeName:
          join([representative['FirstName'], representative['LastName']]) || representative['Name']
      },
      PATIENT_DETAIL_FIELDS['patient']
    ),
    prescriber: detailFields(
      {
        ...prescriber,
        ContactName:
          join([officeContact['FirstName'], officeContact['LastName']]) || contact['Name'],
        ContactEmail: contact['Email'] || officeContact['Email'],
        ContactPhone: contact['Phone'] || office['Phone'],
        ContactFax: contact['Fax'] || office['Fax'],
        SalesRepName: join([salesRep['FirstName'], salesRep['LastName']])
      },
      PATIENT_DETAIL_FIELDS['prescriber']
    ),
    medicalPlans,
    pharmacyPlans,
    medical: detailFields(
      { ...medical, CustomerPhone: planPhone(medical['PlanPhones'], 'Customer_Care') },
      PATIENT_DETAIL_FIELDS['medical']
    ),
    pharmacy: detailFields(
      {
        ...pharmacy,
        CustomerPhone: planPhone(pharmacy['PlanPhones'], 'Customer_Care'),
        CustomerFax: planPhone(pharmacy['PlanFaxes'], 'Customer_Care_Fax')
      },
      PATIENT_DETAIL_FIELDS['pharmacy']
    ),
    medicare: detailFields(pharmacy, PATIENT_DETAIL_FIELDS['medicare']),
    product: coverage(
      services.find(service => service['Name'] === 'Product Coverage Details') ?? {}
    ),
    administration: coverage(services.find(service => service['Name'] === 'Administration') ?? {}),
    pharmacyAuthorizations: pharmacyAuthorizations(pharmacy),
    alerts: records(root['Alerts'])
      .filter(alert => alert['IsActive'] === true && alert['Category'] === 'HCP_Portal')
      .map(alert => ({ ...alert, GenerateDate: detailDate(alert['GenerateDate'], true) })),
    prescriptions: tableRows(
      records(root['PrescriptionInfo']),
      PATIENT_DETAIL_COLUMNS['prescription']
    ),
    copay: tableRows(copay, PATIENT_DETAIL_COLUMNS['copay']),
    shipments: tableRows(
      (shipments.length
        ? shipments
        : records(detailRecord(root['OrdersAndShipmentsInfo'])['Shipments'])
      ).map(shipment => ({
        ...shipment,
        PrescriptionType: shipment['PrescriptionnType'] || shipment['PrescriptionType'],
        ShippedTo: detailRecord(shipment['ShipToAddress'])['City']
      })),
      PATIENT_DETAIL_COLUMNS['shipment']
    ),
    notes: tableRows(notes, PATIENT_DETAIL_COLUMNS['notes']),
    documents: records(root['Documents'])
  };
}
export function detailCaseStatus(value: unknown): string {
  const status = detailText(value);
  return status === 'Open' ? 'Active' : status === 'Closed' ? 'Inactive' : status;
}
export function mapPatientCaseRows(cases: CaseData[]): PatientDetailRecord[] {
  return cases.map(item => ({
    ...item,
    DateSubmitted: detailDate(item.CaseStartDate),
    CaseStatus: detailCaseStatus(item.CaseStatus),
    Reverification: detailFlag(item.Reverification) || '--',
    ActionNeeded: detailFlag(item.ActionNeeded) || '--'
  }));
}

function displayValue(value: unknown, format?: 'date' | 'datetime' | 'phone'): string {
  switch (format) {
    case 'date':
      return detailDate(value);
    case 'datetime':
      return detailDate(value, true);
    case 'phone':
      return phone(value);
    default:
      return typeof value === 'boolean' ? detailFlag(value) : detailText(value);
  }
}
