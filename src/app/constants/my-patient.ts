import { FieldConfig } from '@shared/models';
import { PipeName } from '@shared/utils/dynamic-pipe.pipe';

export const MY_PATIENT: {
  particularPatientInfo: {
    CaseInfo: { left: Info[]; right: Info[] };
    patientInfo: { left: Info[]; right: Info[] };
    prescriberInfo: { left: Info[]; right: Info[] };
    medicalInsuranceInfo: {
      medicalInfo: { left: Info[]; right: Info[] };
      buyAndBill: { left: Info[] };
      adminstration: { left: Info[] };
    };
    pharmacyInsuranceInfo: {
      prescriptionInsuranceInfo: { left: Info[]; right: Info[] };
      medicareCoverageInformation: { left: Info[]; right: Info[] };
    };
  };
} = {
  particularPatientInfo: {
    CaseInfo: {
      left: [
        { label: 'Case ID', key: 'CaseId' },
        { label: 'Case Referral Date', key: 'CaseReferralDate' },
        { label: 'Diagnosis Code', key: 'DiagnosisCode' },
        {
          label: 'Diagnosis Code Description',
          key: 'DiagnosisCodeDescription'
        }
      ],
      right: [
        { label: 'Administration Setting', key: 'administrationSetting' },
        { label: 'Case Status', key: 'CaseStatus' },
        { label: 'Case Sub-status', key: 'CaseSubStatus' }
      ]
    },
    patientInfo: {
      left: [
        { label: 'Patient ID', key: 'PatientID' },
        { label: 'Patient First Name', key: 'FirstName' },
        { label: 'Patient Last Name', key: 'LastName' },
        { label: 'Patient DOB', key: 'DateOfBirth', pipe: { name: 'date', args: ['MM/dd/yyyy'] } },
        { label: 'Patient Phone Number', key: 'Phone', pipe: { name: 'phone' } },
        { label: 'Patient Email Address', key: 'Email' }
      ],
      right: [
        { label: ' Patient Address', key: ['Address.Line1', 'Address.Line2'] },
        { label: 'City', key: 'Address.City' },
        { label: 'State', key: 'Address.State' },
        { label: 'Zip Code', key: 'Address.PostalCode' },
        { label: 'Caregiver/Patient Rep Name', key: 'PatientReps.FirstName' }
      ]
    },
    prescriberInfo: {
      left: [
        { label: 'First Name', key: 'FirstName' },
        { label: 'Last Name', key: 'LastName' },
        { label: 'NPI', key: 'NPI' },
        { label: 'Office Contact Name', key: 'PracticeName' }
      ],
      right: [
        { label: 'Email Address', key: 'Office.OfficeContact.Email' },
        { label: 'Phone Number', key: 'Office.Phone', pipe: { name: 'phone' } },
        { label: 'Fax Number', key: 'Office.Fax', pipe: { name: 'phone' } },
        { label: 'Sales Rep Name', key: ['SalesRep.FirstName', 'SalesRep.LastName'] }
      ]
    },
    medicalInsuranceInfo: {
      medicalInfo: {
        left: [
          {
            field: {
              label: 'Plan Name',
              name: 'PlanName',
              fieldType: 'select',
              class: 'label-field',
              options: []
            },
            key: 'PlanName'
          },
          { label: 'Plan Type', key: 'PlanType' },
          { label: 'Plan Status', key: 'PlanStatus' },
          { label: 'Member ID', key: 'MemberID' }
        ],

        right: [
          { label: 'Group Number', key: 'Group' },
          { label: 'Plan Phone Number', key: 'PlanPhones[0].Phone', pipe: { name: 'phone' } } // Key missing in API response
        ]
      },

      buyAndBill: {
        left: [
          { label: 'Product Covered?', key: 'ProductOrServiceCovered' },
          { label: 'J-Code', key: 'jCode' },
          { label: 'Copay', key: 'Copay' }
        ]
      },
      adminstration: {
        left: [
          { label: 'Product Covered?', key: 'ProductOrServiceCovered' },
          { label: 'J-Code', key: 'jCode' },
          { label: 'Copay', key: 'Copay' }
        ]
      }
    },
    pharmacyInsuranceInfo: {
      prescriptionInsuranceInfo: {
        left: [
          {
            field: {
              label: 'Plan Name',
              name: 'PlanName',
              fieldType: 'select',
              class: 'label-field',
              options: []
            },
            key: 'PlanName'
          },
          { label: 'Plan Type', key: 'PlanType' },
          { label: 'Plan Status', key: 'PlanStatus' },
          { label: 'Member ID', key: 'MemberID' },
          { label: 'Group Number', key: 'Group' }
        ],
        right: [
          { label: 'BIN', key: 'BIN' },
          { label: 'PCN', key: 'PCN' },
          { label: 'Plan Phone Number', key: 'PlanPhones' },
          { label: 'Plan Fax Number', key: 'PlanFaxes' }
        ]
      },
      medicareCoverageInformation: {
        left: [
          { label: 'Medicare Coverage Phase', key: 'MedicareCoveragePhase' },
          { label: 'LIS Amount Remaining', key: 'LISAmountRemaining' },
          { label: 'LIS Start Date', key: 'LISStartDate' }
        ],
        right: [
          { label: 'LIS End Date', key: 'LISEndDate' },
          { label: 'LIS Level', key: 'LISLevel' }
        ]
      }
    }
  }
};

interface Info {
  label?: string;
  key: string | string[];
  value?: string;
  pipe?: { name: PipeName; args?: string[] };
  field?: FieldConfig;
}
