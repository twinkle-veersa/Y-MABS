import { FieldConfig, SelectOptions, StepDetail } from '@shared/models';
import { stateOptions } from './dropdown-options';
import { groupedIntoOne } from '@shared/utils/utility.functions';
import { REGEX } from './regex';
import { PopupType } from '@shared/components/popup/popup.component';

const genderOptions: SelectOptions[] = [
  { option: 'Male', value: 'Male' },
  { option: 'Female', value: 'Female' }
];
const contactPreferences: SelectOptions[] = [
  { option: 'Phone', value: 'Phone' },
  { option: 'Voicemail', value: 'Voicemail' },
  { option: 'Text', value: 'Text' },
  { option: 'Mail', value: 'Mail' },
  { option: 'Email', value: 'Email' }
];
const relationShipToPatient: SelectOptions[] = [
  { option: 'Unknown', value: 'Unknown' },
  { option: 'Dependent', value: 'Dependent' },
  { option: 'Spouse', value: 'Spouse' },
  { option: 'Mother', value: 'Mother' },
  { option: 'Father', value: 'Father' },
  { option: 'Parent / legal guardian', value: 'ParentLegalGuardian' }
];
const contactTime: SelectOptions[] = [
  { option: 'Morning', value: 'Morning' },
  { option: 'Afternoon', value: 'Afternoon' },
  { option: 'Evening', value: 'Evening' },
  { option: 'Anytime', value: 'Anytime' }
];
const insurancePlans: SelectOptions[] = [
  { option: 'Private/Commercial', value: 'Private/Commercial' },
  { option: 'Medicaid', value: 'Medicaid' },
  { option: 'Medicare', value: 'Medicare' },
  { option: 'Medicare Advantage', value: 'Medicare Advantage' }
];
const relationShipToPatientInsurance: SelectOptions[] = [
  { option: 'Self', value: 'Self' },
  { option: 'Spouse', value: 'Spouse' },
  { option: 'Children', value: 'Children' },
  { option: 'Other', value: 'Other' }
];

const diagnosticCode: SelectOptions[] = [
  { option: 'C61 (primary)', value: 'C61' },
  { option: 'C79.82', value: 'C7982' },
  { option: 'Z19.1', value: 'Z191' },
  { option: 'Z19.2', value: 'Z192' },
  { option: 'Z85.46', value: 'Z8546' },
  { option: 'R97.21', value: 'R9721' }
];
const procedureCode: SelectOptions[] = [
  { option: '78815', value: '78815' },
  { option: '78816', value: '78816' },
  { option: 'Other', value: 'other' }
];
const cptMofifier: SelectOptions[] = [
  { option: 'PI (Initial)', value: 'PI' },
  { option: 'PS (Recurrent)', value: 'PS' }
];
const HCPCSCode: SelectOptions[] = [{ option: 'A9595', value: 'A9595' }];

export const STEPS = [
  'patientInfo',
  'prescriberInfo',
  'insuranceInfo',
  'clinicalInfo',
  'attestAndSign'
] as const;
export type EnrollmentStep = (typeof STEPS)[number];
export const ENROLLMENT_STEPS: Record<EnrollmentStep, StepDetail> = {
  patientInfo: { title: 'Patient\nInformation', isEnabled: true },
  prescriberInfo: { title: 'Prescriber\nInformation', isEnabled: true },
  insuranceInfo: { title: 'Insurance\nInformation', isEnabled: true },
  clinicalInfo: { title: 'Clinical\nInformation', isEnabled: true },
  attestAndSign: { title: 'Attestation\nand Signatures', isEnabled: true }
};

export const PATIENT_REFERRAL: {
  patientInformation: {
    newPatient: FieldConfig[];
    existingPatient: FieldConfig[];
  };
  prescriberInformation: {
    prescriberInfo: FieldConfig[];
  };
  insuranceInformation: {
    primaryInsurance: FieldConfig[];
    secondaryInsurance: FieldConfig[];
    noInsurance: FieldConfig[];
  };
  clinicalInformation: FieldConfig[];
} = {
  patientInformation: {
    newPatient: groupedIntoOne({
      left: [
        {
          fieldType: 'text',
          label: 'First Name',
          name: 'firstName',
          placeholder: 'Enter first name',
          validation: { required: true, pattern: REGEX.character }
        },
        {
          fieldType: 'text',
          label: 'Last Name',
          name: 'lastName',
          placeholder: 'Enter last name',
          validation: { required: true, pattern: REGEX.character }
        },
        {
          fieldType: 'text',
          label: 'Address',
          name: 'address',
          placeholder: 'Enter address',
          validation: { required: true }
        },
        {
          fieldType: 'text',
          label: 'City',
          name: 'city',
          placeholder: 'Enter city',
          validation: { required: true, pattern: REGEX.character }
        },
        {
          fieldType: 'select',
          label: 'State',
          name: 'state',
          placeholder: 'Select state',
          options: stateOptions,
          validation: { required: true }
        },
        {
          fieldType: 'text',
          label: 'Zip',
          name: 'zip',
          placeholder: 'Enter Zip',
          inputValidation: 'numberOnly',
          validation: { required: true, pattern: REGEX.zip, maxLength: 5 }
        },
        {
          fieldType: 'date',
          label: 'Date of Birth',
          name: 'dateOfBirth',
          placeholder: 'MM/DD/YYYY',
          iconColor: '#0D62FF',
          validation: { required: true, maxDate: new Date() }
        },
        {
          fieldType: 'radio',
          label: 'Gender',
          name: 'gender',
          options: genderOptions
        },
        {
          fieldType: 'text',
          label: 'Patient Weight',
          name: 'patientWeight',
          placeholder: 'Enter weight in pounds',
          inputValidation: 'numberOnly',
          validation: { required: true, pattern: REGEX.numeric }
        },
        {
          fieldType: 'text',
          label: 'Email',
          name: 'email',
          placeholder: 'Enter email',
          validation: { required: true, pattern: REGEX.email }
        }
      ],
      right: [
        {
          fieldType: 'checkbox',
          label: 'Please select all ways Y-MABS Connect may contact me:',
          name: 'contactPreferences',
          options: contactPreferences,
          class: 'contact-preferences'
        },
        {
          fieldType: 'text',
          label: 'Patient’s Authorized Representative Name',
          name: 'authRepName',
          placeholder: 'Enter patient’s authorized representative name',
          validation: { required: true, pattern: REGEX.character }
        },
        {
          fieldType: 'text',
          label: 'Patient’s Authorized Representative Primary Mobile Phone',
          name: 'primaryMobile',
          placeholder: 'Enter patient authorized rep primary mobile phone',
          inputValidation: 'phone',
          validation: { required: true, pattern: REGEX.phone }
        },
        {
          fieldType: 'text',
          label: 'Patient’s Authorized Representative Secondary Mobile Phone',
          name: 'secondaryMobile',
          placeholder: 'Enter secondary mobile phone',
          inputValidation: 'phone',
          validation: { required: true, pattern: REGEX.phone }
        },
        {
          fieldType: 'select',
          label: 'Relationship',
          name: 'relationship',
          placeholder: 'Select relationship',
          options: relationShipToPatient
        },
        {
          fieldType: 'radio',
          label: 'Best Time to Call: Mon-Fri, 9-11 AM Central',
          name: 'contactTime',
          options: contactTime,
          class: 'contact-time'
        },
        {
          fieldType: 'text',
          label: 'Patient’s Authorized Representative Email',
          name: 'authRepEmail',
          placeholder: 'Enter patient’s authorized representative email',
          validation: { pattern: REGEX.email }
        }
      ]
    }),

    existingPatient: groupedIntoOne({
      left: [
        {
          fieldType: 'select',
          label: 'Select Name',
          name: 'selectName',
          placeholder: 'Select name',
          validation: { required: true },
          options: []
        },
        {
          fieldType: 'text',
          label: 'Address',
          name: 'address',
          placeholder: 'Enter address',
          validation: { required: true }
        },
        {
          fieldType: 'text',
          label: 'City',
          name: 'city',
          placeholder: 'Enter city',
          validation: { required: true, pattern: REGEX.character }
        },
        {
          fieldType: 'select',
          label: 'State',
          name: 'state',
          placeholder: 'Select state',
          options: stateOptions,
          validation: { required: true }
        },
        {
          fieldType: 'text',
          label: 'Zip',
          name: 'zip',
          placeholder: 'Enter Zip',
          inputValidation: 'numberOnly',
          validation: { required: true, pattern: REGEX.zip, maxLength: 5 }
        },
        {
          fieldType: 'date',
          label: 'Date of Birth',
          name: 'dateOfBirth',
          placeholder: 'MM/DD/YYYY',
          disabled: true,
          validation: { required: true, maxDate: new Date() }
        },
        {
          fieldType: 'radio',
          label: 'Gender',
          name: 'gender',
          options: genderOptions,
          disabled: true
        },
        {
          fieldType: 'text',
          label: 'Patient Weight',
          name: 'patientWeight',
          placeholder: 'Enter weight in pounds',
          inputValidation: 'numberOnly',
          validation: { required: true, pattern: REGEX.numeric }
        },
        {
          fieldType: 'text',
          label: 'Email',
          name: 'email',
          placeholder: 'Enter email',
          validation: { required: true, pattern: REGEX.email }
        }
      ],
      right: [
        {
          fieldType: 'checkbox',
          label: 'Please select all ways Y-MABS Connect may contact me:',
          name: 'contactPreferences',
          options: contactPreferences,
          class: 'contact-preferences'
        },
        {
          fieldType: 'text',
          label: 'Patient’s Authorized Representative Name',
          name: 'authRepName',
          placeholder: 'Enter patient’s authorized representative name',
          validation: { required: true, pattern: REGEX.character }
        },
        {
          fieldType: 'text',
          label: 'Patient’s Authorized Representative Primary Mobile Phone',
          name: 'primaryMobile',
          placeholder: 'Enter patient authorized rep primary mobile phone',
          inputValidation: 'phone',
          validation: { required: true, pattern: REGEX.phone }
        },
        {
          fieldType: 'text',
          label: 'Patient’s Authorized Representative Secondary Mobile Phone',
          name: 'secondaryMobile',
          placeholder: 'Enter secondary mobile phone',
          inputValidation: 'phone',
          validation: { required: true, pattern: REGEX.phone }
        },
        {
          fieldType: 'select',
          label: 'Relationship',
          name: 'relationship',
          placeholder: 'Select relationship',
          options: relationShipToPatient
        },
        {
          fieldType: 'radio',
          label: 'Best Time to Call: Mon-Fri, 9-11 AM Central',
          name: 'contactTime',
          options: contactTime,
          class: 'contact-time'
        },
        {
          fieldType: 'text',
          label: 'Patient’s Authorized Representative Email',
          name: 'authRepEmail',
          placeholder: 'Enter patient’s authorized representative email',
          validation: { pattern: REGEX.email }
        }
      ]
    })
  },

  prescriberInformation: {
    prescriberInfo: groupedIntoOne({
      left: [
        {
          fieldType: 'text',
          label: 'Prescriber Name',
          name: 'prescriberName',
          placeholder: 'Enter prescriber name',
          validation: { required: true }
        },
        {
          fieldType: 'text',
          label: 'NPI #',
          name: 'npiNumber',
          placeholder: 'Enter NPI number',
          inputValidation: 'numberOnly',
          validation: {
            required: true,
            pattern: REGEX.numeric,
            minLength: 10,
            maxLength: 10
          }
        },
        {
          fieldType: 'text',
          label: 'Tax ID#',
          name: 'taxId',
          placeholder: 'Enter tax ID',
          inputValidation: 'numberOnly',
          validation: {
            required: true,
            pattern: REGEX.taxId,
            maxLength: 9
          }
        },
        {
          fieldType: 'text',
          label: 'Center/Hospital Name',
          name: 'centerName',
          placeholder: 'Enter center/hospital name',
          validation: { required: true }
        },
        {
          fieldType: 'text',
          label: 'Address',
          name: 'address',
          placeholder: 'Enter address'
        },
        {
          fieldType: 'text',
          label: 'City',
          name: 'city',
          placeholder: 'Enter city',
          validation: { pattern: REGEX.character }
        },
        {
          fieldType: 'select',
          label: 'State',
          name: 'state',
          placeholder: 'Select state',
          options: stateOptions
        },
        {
          fieldType: 'text',
          label: 'Zip',
          name: 'zip',
          placeholder: 'Enter Zip',
          inputValidation: 'numberOnly',
          validation: { pattern: REGEX.zip, maxLength: 5 }
        },
        {
          fieldType: 'text',
          label: 'Prescriber Direct Contact #',
          name: 'prescriberDirectContact',
          placeholder: 'Enter prescriber direct contact #',
          inputValidation: 'phone',
          validation: { pattern: REGEX.phone }
        },
        {
          fieldType: 'text',
          label: 'Prescriber Email',
          name: 'prescriberEmail',
          placeholder: 'Enter prescriber email',
          validation: { pattern: REGEX.email }
        }
      ],
      right: [
        {
          fieldType: 'text',
          label: 'Primary Office Contact Name',
          name: 'officeName',
          placeholder: 'Enter primary office contact name',
          validation: { required: true }
        },
        {
          fieldType: 'text',
          label: 'Primary Office Phone',
          name: 'officePhoneNumber',
          placeholder: 'Enter primary office phone',
          inputValidation: 'phone',
          validation: { required: true, pattern: REGEX.phone }
        },
        {
          fieldType: 'text',
          label: 'Primary Office Phone Ext',
          name: 'officeExt',
          placeholder: 'Enter primary office ext'
        },
        {
          fieldType: 'text',
          label: 'Primary Office Email',
          name: 'officeMail',
          placeholder: 'Enter primary office email',
          validation: { pattern: REGEX.email }
        },
        {
          fieldType: 'text',
          label: 'Primary Office Fax',
          name: 'officeFax',
          placeholder: 'Enter primary office fax',
          inputValidation: 'phone',
          validation: { pattern: REGEX.phone }
        },
        {
          fieldType: 'text',
          label: 'Additional Office/Provider Contact Name',
          name: 'additionalContactName',
          placeholder: 'Enter office/provider contact name'
        },
        {
          fieldType: 'text',
          label: 'Additional Office/Provider Contact Primary Phone',
          name: 'additionalContactPhone',
          placeholder: 'Enter office/provider contact primary phone',
          inputValidation: 'phone',
          validation: { pattern: REGEX.phone }
        },
        {
          fieldType: 'text',
          label: 'Additional Office/Provider Contact Primary Phone Ext',
          name: 'additionalContactExt',
          placeholder: 'Enter office/provider contact primary phone ext'
        },
        {
          fieldType: 'text',
          label: 'Additional Office/Provider Contact Primary Email',
          name: 'additionalContactEmail',
          placeholder: 'Enter office/provider contact primary email',
          validation: { pattern: REGEX.email }
        }
      ]
    })
  },

  insuranceInformation: {
    primaryInsurance: groupedIntoOne({
      top: [
        {
          fieldType: 'checkbox',
          label: '',
          name: 'primaryInsuranceType',
          options: insurancePlans,
          validation: { required: true }
        }
      ],
      left: [
        {
          fieldType: 'text',
          label: 'Primary Insurance Name',
          name: 'primaryInsuranceName',
          placeholder: 'Enter primary insurance name',
          validation: { required: true }
        },
        {
          fieldType: 'text',
          label: 'Plan Name',
          name: 'primaryPlanName',
          placeholder: 'Enter plan name',
          validation: { required: true }
        },
        {
          fieldType: 'text',
          label: 'Policy Holder Name',
          name: 'primaryPolicyHolderName',
          placeholder: 'Enter policy holder name',
          validation: { required: true }
        },
        {
          fieldType: 'select',
          label: 'Relationship to Patient',
          name: 'primaryPatientRelation',
          options: relationShipToPatientInsurance,
          placeholder: 'Select relationship',
          validation: { required: true }
        },
        {
          fieldType: 'text',
          label: ' ',
          name: 'primaryOtherRelationship',
          placeholder: 'Enter Other Relationship',
          validation: { required: true },
          dependsOn: 'primaryPatientRelation',
          condition: 'Other'
        }
      ],
      right: [
        {
          fieldType: 'text',
          label: 'Insurance Phone Number',
          name: 'primaryInsurancePhone',
          placeholder: 'Enter insurance phone number',
          inputValidation: 'phone',
          validation: {
            required: true,
            pattern: REGEX.phone
          }
        },
        {
          fieldType: 'text',
          label: 'Member ID',
          name: 'primaryMemberId',
          placeholder: 'Enter member ID',
          validation: { required: true }
        },
        {
          fieldType: 'date',
          label: 'Policy Holder Date of Birth',
          name: 'primaryPolicyHolderDOB',
          placeholder: 'MM/DD/YYYY',
          iconColor: '#0D62FF',
          validation: { required: true, maxDate: new Date() }
        }
      ]
    }),

    secondaryInsurance: groupedIntoOne({
      top: [
        {
          fieldType: 'checkbox',
          label: '',
          name: 'secondaryInsuranceType',
          options: insurancePlans,
          validation: { required: true }
        }
      ],
      left: [
        {
          fieldType: 'text',
          label: 'Secondary Insurance Name',
          name: 'secondaryInsuranceName',
          placeholder: 'Enter secondary insurance name',
          validation: { required: true }
        },
        {
          fieldType: 'text',
          label: 'Plan Name',
          name: 'secondaryPlanName',
          placeholder: 'Enter plan name',
          validation: { required: true }
        },
        {
          fieldType: 'text',
          label: 'Policy Holder Name',
          name: 'secondaryPolicyHolderName',
          placeholder: 'Enter policy holder name',
          validation: { required: true }
        },
        {
          fieldType: 'select',
          label: 'Relationship to Patient',
          name: 'secondaryPatientRelation',
          options: relationShipToPatientInsurance,
          placeholder: 'Select relationship',
          validation: { required: true }
        },
        {
          fieldType: 'text',
          label: ' ',
          name: 'secondaryOtherRelationship',
          placeholder: 'Enter Other Relationship',
          validation: { required: true },
          dependsOn: 'secondaryPatientRelation',
          condition: 'Other'
        }
      ],
      right: [
        {
          fieldType: 'text',
          label: 'Insurance Phone Number',
          name: 'secondaryInsurancePhone',
          placeholder: 'Enter insurance phone number',
          inputValidation: 'phone',
          validation: {
            required: true,
            pattern: REGEX.phone
          }
        },
        {
          fieldType: 'text',
          label: 'Member ID',
          name: 'secondaryMemberId',
          placeholder: 'Enter member ID',
          validation: { required: true }
        },
        {
          fieldType: 'date',
          label: 'Policy Holder Date of Birth',
          name: 'secondaryPolicyHolderDOB',
          placeholder: 'MM/DD/YYYY',
          iconColor: '#0D62FF',
          validation: { required: true, maxDate: new Date() }
        }
      ]
    }),

    noInsurance: [
      {
        fieldType: 'checkbox',
        label: '',
        name: 'noInsurance',
        options: [{ option: 'Patient has no insurance', value: 'noInsurance' }]
      }
    ]
  },

  clinicalInformation: groupedIntoOne({
    left: [
      {
        class: 'grid-3',
        fieldType: 'checkbox',
        label: 'ICD-10 Diagnosis Code(s)',
        name: 'diagnosticCode',
        options: diagnosticCode,
        validation: { required: true }
      },
      {
        class: 'grid-3',
        fieldType: 'checkbox',
        label: 'Procedure (CPT) Code',
        name: 'cptCode',
        options: procedureCode,
        validation: { required: true }
      },
      {
        fieldType: 'text',
        dependsOn: 'cptCode',
        condition: 'other',
        label: ' ',
        name: 'otherCptCode',
        placeholder: 'Enter other procedure (CPT) code',
        validation: { required: true }
      }
    ],
    right: [
      {
        fieldType: 'checkbox',
        label: 'HCPCS Code',
        name: 'cptModifier',
        options: HCPCSCode,
        validation: { required: true }
      },
      {
        fieldType: 'checkbox',
        label: 'CPT Modifier',
        name: 'CptModifier',
        options: cptMofifier,
        validation: { required: true }
      }
    ]
  })
};

export const POPUP_CONTENT: EnrollmentPopups = {
  prescriberLegalContent: {
    type: 'custom',
    open: false,
    title: 'Prescriber Legal Content/Agreement',
    action: [{ index: 1, label: 'I Agree', action: 'agree' }],
    content:
      'By signing, I confirm that the patient named on this form is under my care, and the information provided is accurate to the best of my knowledge. The ordered diagnostic procedure, a PET scan using PYLARIFY®, is medically necessary and aligns with FDA-approved labeling. I certify that I have obtained any permission, consent or authorization necessary under applicable law in order to disclose the patient’s individually identifiable health information provided on this form with Lantheus Link for: (1) Verifying insurance coverage and eligibility for a PET scan using PYLARIFY®, (2) identifying imaging centers for the ordered scan, and (3) introducing related services  to my patient and contacting them for these purposes. I acknowledge that I am not obligated to order any Lantheus products and have not received nor will receive any benefit from Lantheus for doing so. I consent to being contacted by Lantheus Link via fax, phone, mail, or email to assist the above-named patient and/or to provide me with additional program information. I understand that Lantheus may change or end program services without notice.'
  },
  patientSignSupport: {
    type: 'custom',
    open: false,
    title: 'Patient Support Services',
    action: [],
    content: ``
  },
  patientSignHealthInfo: {
    type: 'custom',
    open: false,
    title: 'Permission to Share Health Information',
    action: [{ index: 1, label: 'OK', action: 'ok' }],
    content: `By enrolling in Lantheus Link, I authorize my health insurance, physicians, and other healthcare providers (“Providers”) to share My Information with Lantheus, its affiliates, and partners to enroll me in Lantheus Link, provide program services and conduct quality assurance and other business activities. Lantheus Link may  use my de-identified information for internal analysis or research purposes. I understand that federal privacy laws may not protect My Information from further disclosure once disclosed to Lantheus Link, but Lantheus Link  has agreed to only use it as allowed by me in this authorization or required by law. Signing this form is voluntary and will not affect my ability to obtain medical treatment, my eligibility for insurance benefits, or coverage under my health insurance, or access to Lantheus products including a PET scan with PYLARIFY®. Without this authorization, Lantheus Link cannot provide Services to me. Unless revoked, this authorization expires one year from the date signed, or earlier if required by law. I understand that I may revoke this authorization at any time by emailing such cancellation to support@lantheuslink.com or calling 844-339-8514; however, this cancellation will not apply to My Information already used or disclosed before notice of cancellation is received by Lantheus Link. I understand that I am entitled to a copy of this form.`
  },
  confirmation: {
    type: 'alert',
    open: false,
    title: 'Confirmation',
    action: [
      { index: 1, label: 'Cancel', action: 'cancel' },
      { index: 1, label: 'Proceed', action: 'proceed' }
    ],
    content: `You are about to finalize the enrollment form and proceed to e-sign the enrollment form. You will not be able to edit the information once you proceed.`
  }
};

export const EXIT_CONFIRMATION = `Are you sure you want to exit the patient enrollment process? <br/> All enrollment progress will be lost.`;
export const E_SIGN_CONFIRMATION = `You are about to finalize the enrollment form and <br> proceed to e-sign the enrollment form.<br> You will not be able to edit the information once  <br> you proceed.`;

export const VIEW_DOWNLOAD = {
  title: `You 're almost done!`,
  content: `Please download, print, complete, sign and fax the PYLARIFY<sup class="text-small">TM</sup> enrollment form to <br /> 1-844-339-8515. <br />  <br /> If you have any questions, please contact us at 1-844-339-8514.`
};

interface EnrollmentPopups {
  prescriberLegalContent: PopupConfig;
  patientSignSupport: PopupConfig;
  patientSignHealthInfo: PopupConfig;
  confirmation: PopupConfig;
}
interface PopupConfig {
  type: PopupType;
  open: boolean;
  title: string;
  action: { index: number; label: string; action: string }[];
  content: string;
}
