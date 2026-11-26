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
const yesNoOptions: SelectOptions[] = [
  { option: 'Yes', value: 'Yes' },
  { option: 'No', value: 'No' }
];
const primaryIcd10Options: SelectOptions[] = [
  {
    option: 'C74.90: Malignant neoplasm of unspecified part of unspecified adrenal gland ',
    value: 'C74.90',
    inputName: 'primaryIcdC7490',
    inputPlaceholder: 'Enter C74.90 code',
    inputLayout: 'below',
    showInputWhenChecked: true
  },
  {
    option: 'Other',
    value: 'Other',
    inputName: 'primaryIcdOther',
    inputPlaceholder: 'Enter other primary ICD 10 code',
    inputLayout: 'inline',
    showInputWhenChecked: true
  }
];
const secondaryIcd10Options: SelectOptions[] = [
  {
    option: '',
    value: 'secondary1',
    inputName: 'secondaryIcdCode1',
    inputPlaceholder: 'Enter secondary ICD 10 code',
    inputLayout: 'inline'
  },
  {
    option: '',
    value: 'secondary2',
    inputName: 'secondaryIcdCode2',
    inputPlaceholder: 'Enter secondary ICD 10 code',
    inputLayout: 'inline'
  }
];
const additionalInformationOptions: SelectOptions[] = [
  {
    option: 'Relapsed or Refractory High-risk Neuroblastoma with Bone or Bone Marrow involvement',
    value: 'Relapsed'
  }
];
const treatmentSettingOptions: SelectOptions[] = [
  { option: 'In-Patient', value: 'In-Patient' },
  { option: 'Outpatient', value: 'Outpatient' }
];

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
  clinicalInformation: {
    copayEligibility: FieldConfig[];
    diagnosisInformation: FieldConfig[];
    productInformation: FieldConfig[];
  };
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
          inputValidation: 'taxId',
          validation: {
            required: true,
            pattern: REGEX.taxId,
            maxLength: 10
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

  clinicalInformation: {
    copayEligibility: [
      {
        fieldType: 'radio',
        label:
          'Is the patient enrolled in any state or federal health care program, including but not limited to, Medicare, Medicaid, Managed Medicare, Managed Medicaid, Medigap, Veterans Affairs, TRICARE, CHIP, CHAMPUS, or Indian Health?',
        name: 'federalProgramEnrollment',
        options: yesNoOptions,
        class: 'federal-program-enrollment'
      }
    ],
    diagnosisInformation: [
      {
        fieldType: 'checkbox',
        label: 'Primary ICD 10 Code(s)',
        name: 'primaryIcd10Codes',
        options: primaryIcd10Options,
        validation: { required: true },
        class: 'primary-icd10-codes'
      },
      {
        fieldType: 'checkbox',
        label: 'Secondary ICD 10 Code(s)',
        name: 'secondaryIcdCodes',
        options: secondaryIcd10Options,
        validation: { required: true },
        class: 'secondary-icd10-codes'
      },
      {
        fieldType: 'checkbox',
        label: 'Additional Information',
        name: 'additionalInformation',
        options: additionalInformationOptions,
        validation: { required: true }
      },
      {
        fieldType: 'checkbox',
        label: 'Anticipated Treatment Setting',
        name: 'treatmentSetting',
        options: treatmentSettingOptions,
        validation: { required: true },
        class: 'treatment-setting'
      }
    ],
    productInformation: [
      {
        fieldType: 'text',
        label: 'Product Name',
        name: 'productName',
        disabled: true
      },
      {
        fieldType: 'text',
        label: 'NDC',
        name: 'productNdc',
        disabled: true
      },
      {
        fieldType: 'text',
        label: 'Estimated Quantity',
        name: 'estimatedQuantity',
        placeholder: 'Enter estimated quantity'
      },
      {
        fieldType: 'date',
        label: 'Anticipated Date of Infusion',
        name: 'anticipatedInfusionDate',
        placeholder: 'MM/DD/YYYY',
        iconColor: '#0D62FF'
      }
    ]
  }
};

export const POPUP_CONTENT: EnrollmentPopups = {
  prescriberLegalContent: {
    type: 'custom',
    open: false,
    title: 'Healthcare provider certification and authorization',
    action: [{ index: 1, label: 'I Agree', action: 'agree' }],
    content: `I hereby attest that I am the prescribing healthcare provider and I have determined that the Product selected in the Product Information section is medically appropriate for this patient and I have explained such to my patient. I agree to notify Y-MABS Connect if I become aware at any time in the future of changes in my patient’s circumstances that would affect his or her eligibility, including but not limited to changes in health insurance status or coverage, financial status, United States residency status, or the indication for which the Product has been prescribed for this patient. My signature certifies that I have read, understand, and agree to this Prescriber Certification and Attestation Statement and that the information being disclosed on this enrollment form is complete and accurate to the best of my knowledge, that the use of the indicated treatment is medically necessary, and I will be supervising the patient’s treatment.`
  },
  patientAuthorization: {
    type: 'custom',
    open: false,
    title: 'Patient Authorization Statement',
    action: [{ index: 1, label: 'I Agree', action: 'agree' }],
    content: `I authorize my healthcare providers and insurance companies to disclose to BTG International, Inc. (d/b/a SERB Pharmaceuticals), and its affiliates, its authorized agents and assignees, its business partners, service providers, and third-party contractors, including Valeris, Inc., the company providing HUB services to the Y-mAbs Connect Program, and other companies used to administer the Y-mAbs Connect Program (collectively, “SERB”), all medical records, insurance information and other documentation relevant to my treatment with SERB Products, including information about my eligibility for limited financial assistance and the coordination of my treatment or proposed treatment (collectively, my “Information”). I understand that when disclosed to SERB, my Information may no longer be protected by certain federal privacy rules. I authorize SERB to use or disclose my Information to (i) facilitate my participation in the services provided by SERB, including, but not limited to, helping to verify or coordinate insurance coverage (the “Services”), (ii) send me information or materials related to my treatment or other programs in which I might be interested, (iii) contact me on occasion for feedback to be given SERB about my treatment and/or the information or programs, (iv) operate and improve the quality of the information or programs, and (v) conduct market research, internal analysis, and data analytics for purposes of strategic business decision-making and scientific development. I understand that if I do not sign this authorization, that will not affect my medical treatment or my health insurance coverage, but it will make me ineligible to enroll in the Y-mAbs Connect Patient Support Program, such as the Patient Assistance Program, the Copay Program and any other Ymabs Connect support programs. I may withdraw this authorization by calling 1-833-339-6227 or by writing to ymabsconnect@valeris.com. If I do withdraw the authorization, it cannot be relied upon after the date SERB receives my notice of withdrawal, but my withdrawal will not invalidate uses and disclosures already made in reliance on the authorization. If I do not withdraw the authorization sooner, it will remain valid for 5 years (or such lesser time as applicable law may require). I understand that I am entitled to receive a copy of this authorization.<br /> <br /> By signing this authorization, either as the patient or a legal representative or guardian of the patient, I attest that I am legally able to sign such documents and am properly acting in my capacity to do so. Proof of such guardian’s or representative’s authority to act for the patient may be requested such as power of attorney or legal court order.`
  },
  marketingOptIn: {
    type: 'custom',
    open: false,
    title: 'Marketing/Other Communications Opt-In (Optional)',
    action: [],
    content: ``
  }
};

export const EXIT_CONFIRMATION = `Are you sure you want to exit the patient enrollment process? <br/> All enrollment progress will be lost.`;
export const E_SIGN_CONFIRMATION = `You are about to finalize the enrollment form and <br> proceed to e-sign the enrollment form.<br> You will not be able to edit the information once  <br> you proceed.`;

export const VIEW_DOWNLOAD = {
  title: `You're almost done!`,
  content: `Please download, print, complete, sign and fax the Y-mAbs Connect enrollment form to <br /> 1-877-209-6227. <br />  <br /> If you have any questions, please contact us at 1-833-339-6227.`
};

export const MARKETING_CONTACT_OPTIONS: SelectOptions[] = [
  { option: 'Phone', value: 'phone' },
  { option: 'Voicemail', value: 'voicemail' },
  { option: 'Text', value: 'text' },
  { option: 'Mail', value: 'mail' },
  { option: 'Email', value: 'email' }
];

interface EnrollmentPopups {
  prescriberLegalContent: PopupConfig;
  patientAuthorization: PopupConfig;
  marketingOptIn: PopupConfig;
}
interface PopupConfig {
  type: PopupType;
  open: boolean;
  title: string;
  action: { index: number; label: string; action: string }[];
  content: string;
}
