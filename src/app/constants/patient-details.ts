import { DASHBOARD_STATUSES } from './dashboard';
import type { ColConfig } from '@shared/components/table/table.component';

export interface PatientDetailField {
  label: string;
  key: string | string[];
  format?: 'date' | 'phone';
}
export interface PatientDetailFields {
  left: PatientDetailField[];
  right: PatientDetailField[];
}

export const PATIENT_DETAIL = {
  cases: 'Patient Cases',
  back: 'Back',
  print: 'Print',
  patientId: 'Patient ID',
  empty: 'No information available',
  retry: 'Retry',
  loadError: 'Patient case details could not be loaded.',
  upload: 'Upload Supplemental Documents',
  dragFiles: 'Drag and drop file here',
  browse: 'Browse Files',
  or: 'or',
  fileRestriction: 'Only PDF up to 10 MB supported',
  close: 'Close upload',
  uploading: 'Uploading…',
  previous: 'Previous tabs',
  next: 'Next tabs',
  pdfOnly: 'Only PDF files are allowed.',
  fileTooLarge: 'File size must be no more than 10 MB.',
  uploadSuccess: 'File uploaded successfully.',
  uploadError: 'File could not be uploaded. Please try again.',
  previewError: 'The document could not be opened. Please try again.',
  acknowledgeSuccess: 'Alert acknowledged successfully.',
  acknowledgeError: 'Failed to acknowledge alert.',
  noCase: 'No case selected.',
  acknowledge: 'Acknowledge'
} as const;

export const PATIENT_TABS = [
  'Case Info',
  'Alerts',
  'Patient Info',
  'Prescriber Info',
  'Prescription Info',
  'Medical Insurance Info',
  'Pharmacy Insurance Info',
  'Copay Card Info',
  'Shipment Info',
  'Notes',
  'Documents'
] as const;
export type PatientDetailTab = (typeof PATIENT_TABS)[number];

export const PATIENT_TAB_TITLES: Record<PatientDetailTab, string> = {
  'Case Info': 'Case Information',
  Alerts: 'Case Alerts',
  'Patient Info': 'Patient Information',
  'Prescriber Info': 'Prescriber Information',
  'Prescription Info': 'Prescription Info',
  'Medical Insurance Info': 'Medical Insurance Information',
  'Pharmacy Insurance Info': 'Prescription Insurance Information',
  'Copay Card Info': 'Copay Card Information',
  'Shipment Info': 'Shipment Information',
  Notes: 'Notes',
  Documents: 'Documents'
};
export const PATIENT_COVERAGE_TITLES = {
  product: 'Buy and Bill Product Coverage Details',
  administration: 'Administration',
  medicare: 'Medicare Coverage Information',
  authorization: 'Insurance Authorization (IA) Information'
} as const;

export const PATIENT_DETAIL_FIELDS: Record<string, PatientDetailFields> = {
  case: {
    left: [
      { label: 'Case ID', key: 'CaseId' },
      { label: 'Date Submitted', key: 'DateSubmitted', format: 'date' },
      { label: 'Enrollment Status', key: 'EnrollmentStatus' }
    ],
    right: [
      { label: 'Case Status', key: 'CaseStatus' },
      { label: 'Action Needed', key: 'ActionNeeded' }
    ]
  },
  patient: {
    left: [
      { label: 'Patient ID', key: 'PatientID' },
      { label: 'Patient First Name', key: 'FirstName' },
      { label: 'Patient Last Name', key: 'LastName' },
      { label: 'Patient DOB', key: 'DateOfBirth', format: 'date' },
      { label: 'Patient Phone Number', key: 'ContactPhone', format: 'phone' },
      { label: 'Patient Email Address', key: 'Email' }
    ],
    right: [
      { label: 'Patient Address', key: ['Address.Line1', 'Address.Line2'] },
      { label: 'City', key: 'Address.City' },
      { label: 'State', key: 'Address.State' },
      { label: 'Zip Code', key: 'Address.PostalCode' },
      { label: 'Caregiver/Patient Rep Name', key: 'RepresentativeName' }
    ]
  },
  prescriber: {
    left: [
      { label: 'First Name', key: 'FirstName' },
      { label: 'Last Name', key: 'LastName' },
      { label: 'NPI', key: 'NPI' },
      { label: 'Office Contact Name', key: 'ContactName' }
    ],
    right: [
      { label: 'Email Address', key: 'ContactEmail' },
      { label: 'Phone Number', key: 'ContactPhone', format: 'phone' },
      { label: 'Fax Number', key: 'ContactFax', format: 'phone' },
      { label: 'Sales Rep Name', key: 'SalesRepName' }
    ]
  },
  medical: {
    left: [
      { label: 'Plan Type', key: 'PlanType' },
      { label: 'Plan Status', key: 'PlanStatus' },
      { label: 'Member ID', key: 'MemberID' }
    ],
    right: [
      { label: 'Group Number', key: 'Group' },
      { label: 'Plan Phone Number', key: 'CustomerPhone', format: 'phone' }
    ]
  },
  pharmacy: {
    left: [
      { label: 'Plan Type', key: 'PlanType' },
      { label: 'Plan Status', key: 'PlanStatus' },
      { label: 'Member ID', key: 'MemberID' },
      { label: 'Group Number', key: 'Group' }
    ],
    right: [
      { label: 'BIN', key: 'BIN' },
      { label: 'PCN', key: 'PCN' },
      { label: 'Plan Phone Number', key: 'CustomerPhone', format: 'phone' },
      { label: 'Plan Fax Number', key: 'CustomerFax', format: 'phone' }
    ]
  },
  medicare: {
    left: [
      { label: 'Medicare Coverage Phase', key: 'MedicareCoveragePhase' },
      { label: 'LIS Amount Remaining', key: 'LISAmountRemaining' },
      { label: 'LIS Start Date', key: 'LISStartDate', format: 'date' }
    ],
    right: [
      { label: 'LIS End Date', key: 'LISEndDate', format: 'date' },
      { label: 'LIS Level', key: 'LISLevel' }
    ]
  },
  coverage: {
    left: [
      { label: 'Product Covered?', key: 'ProductOrServiceCovered' },
      { label: 'J-Code', key: 'BillingCodes' },
      { label: 'Copay', key: 'Copay' }
    ],
    right: []
  }
};

export const CASE_DETAIL_COLUMNS: ColConfig[] = [
  { key: 'CaseId', title: 'Case ID' },
  { key: 'DateSubmitted', title: 'Date Submitted' },
  { key: 'EnrollmentStatus', title: 'Enrollment Status' },
  { key: 'CaseStatus', title: 'Case Status' },
  { key: 'Reverification', title: 'Benefits Reverification?' },
  { key: 'ActionNeeded', title: 'Actions Needed' }
];

export const PATIENT_DETAIL_COLUMNS: Record<string, ColConfig[]> = {
  alerts: [
    { key: 'GenerateDate', title: 'Date & Time' },
    { key: 'Alert', title: 'Action Needed' },
    { key: 'action', title: 'Acknowledge' }
  ],
  prescription: [
    { key: 'Drug', title: 'Drug Name' },
    { key: 'NDC', title: 'NDC' },
    { key: 'Dosage', title: 'Dosage' },
    { key: 'Quantity', title: 'Quantity' },
    { key: 'Refills', title: 'Refills' },
    { key: 'RxWrittenDate', title: 'RX Written Date' }
  ],
  authorization: [
    { key: 'iaType', title: 'IA Type' },
    { key: 'available', title: 'Available' },
    { key: 'phone', title: 'Phone' },
    { key: 'fax', title: 'Fax' },
    { key: 'authType', title: 'Authorization Type' }
  ],
  copay: [
    { key: 'CopayCardStatus', title: 'Status' },
    { key: 'DenialReason', title: 'Denial Reason' },
    { key: 'EnrollmentDate', title: 'Enrollment Date' },
    { key: 'ExpirationDate', title: 'Expiration Date' },
    { key: 'ID', title: 'Member ID' },
    { key: 'Group', title: 'Group' },
    { key: 'BIN', title: 'BIN' },
    { key: 'PCN', title: 'PCN' }
  ],
  shipment: [
    { key: 'Drug', title: 'Product Details' },
    { key: 'PrescriptionType', title: 'Prescription Type' },
    { key: 'FillType', title: 'Triage Type' },
    { key: 'TrackingNumber', title: 'Tracking Number' },
    { key: 'Pharmacy', title: 'Fulfilled By' },
    { key: 'ShippedDate', title: 'Shipment Date' },
    { key: 'ShippedTo', title: 'Shipped To' },
    { key: 'FulfillmentStatus', title: 'Fulfillment Status' }
  ],
  notes: [
    { key: 'DateTime', title: 'Date and Time' },
    { key: 'Note', title: 'Note' }
  ],
  documents: [
    { key: 'DocumentType', title: 'Document Name and Type' },
    { key: 'DocumentDate', title: 'Date', pipeName: 'date', pipeAttr: ['M/d/yyyy'] }
  ]
};

export const PATIENT_LIST_COLUMNS: ColConfig[] = [
  {
    key: 'PatientId',
    title: 'Patient Id',
    classList: 'fw-bold text-decoration-underline',
    sortable: true
  },
  { key: 'PatientName', title: 'Patient Name', sortable: true },
  {
    key: 'DateOfBirth',
    title: 'Date of Birth',
    sortable: true,
    pipeName: 'date',
    pipeAttr: ['MM/dd/yyyy']
  },
  { key: 'PrescriberName', title: 'Prescriber', sortable: true },
  { key: 'PrescriberNpi', title: 'Prescriber NPI', sortable: true },
  { key: 'DateSubmitted', title: 'Date Submitted', sortable: true },
  { key: 'EnrollmentStatus', title: 'Enrollment Status', sortable: true },
  { key: 'ActionNeeded', title: 'Action Needed', sortable: true }
];

export const PATIENT_LIST_FILTERS = [
  {
    label: 'Status',
    key: 'EnrollmentStatus',
    options: [
      ...DASHBOARD_STATUSES.map(status => ({ id: status.filter, label: status.label })),
      { id: 'Scan Scheduled/Ready to Schedule', label: 'Scan Scheduled/Ready to Schedule' }
    ]
  },
  {
    label: 'Case Status',
    key: 'CaseStatus',
    options: [
      { id: 'Open', label: 'Active' },
      { id: 'Closed', label: 'Inactive' }
    ]
  }
];
