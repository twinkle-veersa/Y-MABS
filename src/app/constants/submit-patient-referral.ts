import { FieldConfig, SelectOptions, StepDetail } from '@shared/models';
import { stateOptions } from './dropdown-options';
import { groupedIntoOne } from '@shared/utils/utility.functions';
import { REGEX } from './regex';
import { PopupType } from '@shared/components/popup/popup.component';

const requestedServices: SelectOptions[] = [
  {
    option: 'Patient support and insurance navigation',
    value: 1
  },
  { option: 'Patient support only', value: 2 },
  { option: 'Insurance navigation only', value: 3 }
];
const preferredLanguage: SelectOptions[] = [
  { option: 'English', value: 'English' },
  { option: 'Spanish', value: 'Spanish' },
  { option: 'Other', value: 'Other' }
];
const preferredPhone: SelectOptions[] = [
  { option: 'Home', value: 'Home' },
  { option: 'Mobile', value: 'Mobile' }
];
const contactMethod: SelectOptions[] = [
  { option: 'Call', value: 'Phone' },
  { option: 'Email', value: 'Email' },
  { option: 'Text', value: 'SMS' }
];
const prefcontactMethod: SelectOptions[] = [
  { option: 'Call', value: 'Phone' },
  { option: 'Email', value: 'Email' },
  { option: 'Fax', value: 'Fax' }
];
const contactTime: SelectOptions[] = [
  { option: 'Morning', value: 'AM' },
  { option: 'Afternoon', value: 'Day' },
  { option: 'Evening', value: 'PM' }
];
const affirmation: SelectOptions[] = [
  { option: 'Yes', value: 'Voicemail' },
  { option: 'No', value: 'N' }
];
const relationShipToPatient: SelectOptions[] = [
  { option: 'Unknown', value: 'Unknown' },
  { option: 'Dependent', value: 'Dependent' },
  { option: 'Spouse', value: 'Spouse' },
  { option: 'Mother', value: 'Mother' },
  { option: 'Father', value: 'Father' }
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
const hospitalImagingPatient: SelectOptions[] = [
  // { option: 'Inpatient', value: 'inPatient' },
  { option: 'Outpatient', value: 'Outpatient' },
  { option: 'Independent Scan Facility', value: 'IndependentScanFacility' }
];
const HCPCSCode: SelectOptions[] = [{ option: 'A9595', value: 'A9595' }];
const policyHolder: SelectOptions[] = [
  { option: 'Self', value: 'self' },
  { option: 'Other', value: 'other' }
];

export const TABS = [
  'prescriberSelected',
  'servicesRequested',
  'patientInformation',
  'insuranceInformation',
  'prescriberInformation',
  'clinicalInformation'
] as const;
export type Tab = (typeof TABS)[number];

export const STEPS = [
  'requestedServices',
  'patientInfo',
  'insuranceInfo',
  'prescriberInfo',
  'clinicalInfo',
  'attestAndSign'
] as const;
export type EnrollmentStep = (typeof STEPS)[number];
export const ENROLLMENT_STEPS: Record<EnrollmentStep, StepDetail> = {
  requestedServices: { title: 'Services\nRequested', isEnabled: true },
  patientInfo: { title: 'Patient\nInformation', isEnabled: true },
  insuranceInfo: { title: 'Insurance\nInformation', isEnabled: true },
  prescriberInfo: { title: 'Prescriber\nInformation', isEnabled: true },
  clinicalInfo: { title: 'Clinical\nInformation', isEnabled: true },
  attestAndSign: { title: 'Attestation\nand Signatures', isEnabled: true }
};

export const PATIENT_REFERRAL: {
  prescriberSelected: FieldConfig[];
  servicesRequested: FieldConfig[];
  patientInformation: {
    newPatient: FieldConfig[];
    existingPatient: FieldConfig[];
  };
  insuranceInformation: {
    primaryInsurance: FieldConfig[];
    secondaryInsurance: FieldConfig[];
    noInsurance: FieldConfig[];
  };
  prescriberInformation: {
    prescriberInfo: FieldConfig[];
    imagingLocation: FieldConfig[];
  };
  clinicalInformation: FieldConfig[];
  attestation: FieldConfig[];
} = {
  prescriberSelected: [
    {
      fieldType: 'select',
      label: 'Select a Prescriber',
      name: 'prescriberSelected',
      placeholder: '--Select one--',
      options: []
    }
  ],
  servicesRequested: [
    {
      fieldType: 'radio',
      name: 'servicesRequested',
      options: requestedServices,
      validation: {
        required: true
      }
    }
  ],

  patientInformation: {
    newPatient: groupedIntoOne({
      left: [
        {
          fieldType: 'text',
          label: 'First Name',
          name: 'firstName',
          placeholder: 'Enter your first name',
          validation: { required: true, pattern: REGEX.character }
        },
        {
          fieldType: 'text',
          label: 'Last Name',
          name: 'lastName',
          placeholder: 'Enter your last name',
          validation: { required: true, pattern: REGEX.character }
        },
        //Date of Birth
        {
          fieldType: 'date',
          label: 'Date of birth',
          name: 'dateOfBirth',
          validation: { required: true, maxDate: new Date() }
        },

        {
          fieldType: 'text',
          label: 'Email',
          name: 'email',
          placeholder: 'Enter your email',
          validation: { pattern: REGEX.email }
        },
        {
          fieldType: 'text',
          label: 'Address',
          name: 'address',
          placeholder: 'Enter your address',
          validation: { required: true }
        },
        {
          fieldType: 'text',
          label: 'City',
          name: 'city',
          placeholder: 'Enter your city',
          validation: { required: true, pattern: REGEX.character }
        },
        {
          fieldType: 'select',
          label: 'State',
          name: 'state',
          placeholder: 'Select your State',
          options: stateOptions,
          validation: { required: true }
        }
      ],
      right: [
        {
          fieldType: 'text',
          label: 'ZIP Code',
          name: 'zip',
          placeholder: 'Enter your ZIP code',
          inputValidation: 'numberOnly',
          validation: { required: true, pattern: REGEX.zip, maxLength: 5 }
        },
        // Preferred Phone
        {
          fieldType: 'radio',
          label: 'Preferred Phone',
          name: 'prefPhone',
          options: preferredPhone,
          validation: { required: true }
        },
        {
          fieldType: 'text',
          placeholder: 'Enter your Preferred Phone Number',
          name: 'prefPhoneNumber',
          options: preferredPhone,
          inputValidation: 'phone',
          validation: { required: true, pattern: REGEX.phone }
        },
        //Alternate Phone
        {
          fieldType: 'radio',
          label: 'Alternate Phone Number',
          name: 'altPhone',
          options: preferredPhone
        },
        {
          fieldType: 'text',
          placeholder: 'Enter your Alternate Phone Number',
          name: 'altPhoneNumber',
          options: preferredPhone,
          inputValidation: 'phone',
          validation: { pattern: REGEX.phone }
        },

        {
          fieldType: 'radio',
          label: 'Preferred language',
          name: 'language',
          options: preferredLanguage
        },
        {
          fieldType: 'text',
          label: '',
          dependsOn: 'language',
          condition: 'Other',
          name: 'otherLanguage',
          placeholder: 'Enter other preferred language',
          validation: { required: true }
        },
        {
          fieldType: 'radio',
          label: 'Preferred Contact Method',
          name: 'contactMethod',
          options: contactMethod,
          validation: { required: true }
        },
        {
          fieldType: 'radio',
          label: 'Best Time to Contact',
          name: 'contactTime',
          options: contactTime
        },
        {
          fieldType: 'radio',
          label: 'Okay to Leave Voicemail',
          name: 'affirmation',
          options: affirmation
        }
      ]
    }),

    existingPatient: groupedIntoOne({
      left: [
        //Select Name
        {
          fieldType: 'select',
          label: 'Select Name',
          name: 'selectName',
          placeholder: 'Select Name',
          validation: { required: true },
          options: []
        },
        //DOB
        {
          fieldType: 'date',
          label: 'Date of birth',
          name: 'dateOfBirth',
          placeholder: ' ',
          disabled: true,
          validation: { required: true, maxDate: new Date() }
        },
        {
          fieldType: 'text',
          label: 'Email',
          name: 'email',
          placeholder: 'Enter your email',
          validation: { pattern: REGEX.email }
        },
        {
          fieldType: 'text',
          label: 'Address',
          name: 'address',
          placeholder: 'Enter your address',
          validation: { required: true }
        },
        {
          fieldType: 'text',
          label: 'City',
          name: 'city',
          placeholder: 'Enter your city',
          validation: { required: true, pattern: REGEX.character }
        },
        {
          fieldType: 'select',
          label: 'State',
          name: 'state',
          placeholder: 'Select your State',
          options: stateOptions,
          validation: { required: true }
        }
      ],
      right: [
        // Preferred Phone
        {
          fieldType: 'text',
          label: 'ZIP Code',
          name: 'zip',
          placeholder: 'Enter your ZIP code',
          inputValidation: 'numberOnly',
          validation: { required: true, pattern: REGEX.zip, maxLength: 5 }
        },
        {
          fieldType: 'radio',
          label: 'Preferred Phone',
          name: 'prefPhone',
          options: preferredPhone,
          validation: { required: true }
        },
        {
          fieldType: 'text',
          placeholder: 'Enter your Preferred Phone',
          name: 'prefPhoneNumber',
          options: preferredPhone,
          inputValidation: 'phone',
          validation: { pattern: REGEX.phone }
        },
        {
          fieldType: 'radio',
          label: 'Alternate Phone Number',
          name: 'altPhone',
          options: preferredPhone
        },
        {
          fieldType: 'text',
          placeholder: 'Enter your alternate phone number',
          name: 'altPhoneNumber',
          options: preferredPhone,
          inputValidation: 'phone',
          validation: { pattern: REGEX.phone }
        },
        {
          fieldType: 'radio',
          label: 'Preferred language ',
          name: 'language',
          options: preferredLanguage
        },
        {
          fieldType: 'text',
          label: '',
          dependsOn: 'language',
          condition: 'Other',
          name: 'otherLanguage',
          placeholder: 'Enter other preferred language',
          validation: { required: true }
        },
        {
          fieldType: 'radio',
          label: 'Preferred Contact Method',
          name: 'contactMethod',
          options: contactMethod,
          validation: { required: true }
        },
        {
          fieldType: 'radio',
          label: 'Best Time to Contact',
          name: 'contactTime',
          options: contactTime
        },
        {
          fieldType: 'radio',
          label: 'Okay to Leave Voicemail',
          name: 'affirmation',
          options: affirmation
        }
      ]
    })
  },

  insuranceInformation: {
    primaryInsurance: groupedIntoOne({
      left: [
        {
          fieldType: 'text',
          label: 'Primary Medical Insurance',
          name: 'planName',
          placeholder: 'Enter the primary medical insurance',
          validation: { required: true }
        },
        {
          fieldType: 'text',
          label: 'Primary Insurance Phone Number',
          name: 'phone',
          placeholder: 'Enter primary insurance phone number',
          inputValidation: 'phone',
          validation: {
            required: true,
            pattern: REGEX.phone
          }
        },
        {
          fieldType: 'text',
          label: 'Plan Type',
          name: 'planType',
          placeholder: 'Enter the plan type',
          validation: { required: true }
        },
        {
          fieldType: 'text',
          label: 'Group number',
          name: 'groupNumber',
          placeholder: 'Enter the group number',
          validation: { required: true }
        }
      ],
      right: [
        {
          fieldType: 'text',
          label: 'Policy ID/MBI Number',
          name: 'policyNumber',
          placeholder: 'Enter the policy ID',
          inputValidation: 'numberOnly',
          validation: { required: true, pattern: REGEX.numeric }
        },
        {
          fieldType: 'radio',
          label: 'Policyholder',
          name: 'primaryPolicyholder',
          options: policyHolder,
          value: 'self'
        },
        {
          fieldType: 'text',
          label: 'Subscriber’s Name',
          name: 'subscriberName',
          dependsOn: 'primaryPolicyholder',
          condition: 'other',
          placeholder: 'Enter the subscriber’s name',
          validation: { required: true }
        },
        {
          fieldType: 'select',
          label: 'Relationship to Patient',
          name: 'patientRelation',
          dependsOn: 'primaryPolicyholder',
          condition: 'other',
          options: relationShipToPatient,
          placeholder: 'Select Relationship',
          validation: { required: true }
        },
        {
          fieldType: 'text',
          label: 'Subscriber’s Employer',
          hint: '(if applicable)',
          name: 'subscriberEmployer',
          dependsOn: 'primaryPolicyholder',
          condition: 'other',
          placeholder: 'Enter the subscriber’s employer',
          validation: { required: true }
        }
      ]
    }),

    secondaryInsurance: groupedIntoOne({
      left: [
        {
          fieldType: 'text',
          label: 'Secondary Medical Insurance',
          name: 'planName',
          placeholder: 'Enter the secondary medical insurance',
          validation: { required: true }
        },
        {
          fieldType: 'text',
          label: 'Secondary Insurance Phone Number',
          name: 'phone',
          placeholder: 'Enter secondary insurance phone number',
          inputValidation: 'phone',
          validation: { required: true, pattern: REGEX.phone }
        },
        {
          fieldType: 'text',
          label: 'Plan Type',
          name: 'planType',
          placeholder: 'Enter the plan type',
          validation: { required: true }
        },
        {
          fieldType: 'text',
          label: 'Group number',
          name: 'groupNumber',
          placeholder: 'Enter the group number',
          validation: { required: true }
        }
      ],
      right: [
        {
          fieldType: 'text',
          label: 'Policy ID/MBI Number',
          name: 'policyNumber',
          placeholder: 'Enter the policy ID',
          inputValidation: 'numberOnly',
          validation: { required: true, pattern: REGEX.numeric }
        },
        {
          fieldType: 'radio',
          label: 'Policyholder',
          name: 'secondaryPolicyholder',
          options: policyHolder,
          value: 'self'
        },
        {
          fieldType: 'text',
          label: 'Subscriber’s Name',
          name: 'subscriberName',
          dependsOn: 'secondaryPolicyholder',
          condition: 'other',
          placeholder: 'Enter the subscriber’s name',
          validation: { required: true }
        },
        {
          fieldType: 'select',
          label: 'Relationship to Patient',
          name: 'patientRelation',
          dependsOn: 'secondaryPolicyholder',
          condition: 'other',
          options: relationShipToPatient,
          placeholder: 'Select Relationship',
          validation: { required: true }
        },
        {
          fieldType: 'text',
          label: 'Subscriber’s Employer',
          hint: '(if applicable)',
          name: 'subscriberEmployer',
          dependsOn: 'secondaryPolicyholder',
          condition: 'other',
          placeholder: 'Enter the subscriber’s employer',
          validation: { required: true }
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

  prescriberInformation: {
    prescriberInfo: groupedIntoOne({
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
          placeholder: 'Select your State',
          options: stateOptions,
          validation: { required: true }
        },
        {
          fieldType: 'text',
          label: 'ZIP Code',
          name: 'zip',
          placeholder: 'Enter your ZIP code',
          inputValidation: 'numberOnly',
          validation: { required: true, pattern: REGEX.zip, maxLength: 5 }
        },
        // Tax Id Number
        {
          fieldType: 'text',
          label: 'Tax ID Number',
          name: 'taxId',
          placeholder: 'Enter tax ID number',
          inputValidation: 'numberOnly',
          validation: {
            required: true,
            pattern: REGEX.taxId,
            maxLength: 9
          }
        },
        // Provider NPI Number
        {
          fieldType: 'text',
          label: 'Provider NPI Number',
          name: 'npiNumber',
          inputValidation: 'numberOnly',
          validation: {
            required: true,
            pattern: REGEX.numeric,
            minLength: 10,
            maxLength: 10
          }
        }
      ],
      right: [
        {
          fieldType: 'text',
          label: 'Practice Name',
          name: 'practiceName',
          placeholder: 'Enter practice name',
          validation: { pattern: REGEX.character }
        },
        {
          fieldType: 'text',
          label: 'Practice Phone Number',
          name: 'phoneNumber',
          placeholder: 'Enter practice phone number',
          inputValidation: 'phone',
          validation: { pattern: REGEX.phone }
        },
        {
          fieldType: 'text',
          label: 'Office Contact Name',
          name: 'officeName',
          placeholder: 'Enter office contact name',
          validation: { pattern: REGEX.character }
        },
        {
          fieldType: 'text',
          label: 'Office Contact Phone Number',
          name: 'officePhoneNumber',
          placeholder: 'Enter office contact phone number ',
          inputValidation: 'phone',
          validation: { pattern: REGEX.phone }
        },
        {
          fieldType: 'text',
          label: 'Office Fax Number',
          name: 'officeNumber',
          placeholder: 'Enter office fax number',
          inputValidation: 'phone',
          validation: { pattern: REGEX.phone }
        },
        {
          fieldType: 'text',
          label: 'State License Number',
          name: 'licenseNumber',
          placeholder: 'Enter state license number'
        },
        {
          fieldType: 'text',
          label: 'Medicare PTAN',
          name: 'prescriberMedicarePtan',
          placeholder: 'Enter medicare PTAN',
          hint: '(Provider transaction access number)'
        },
        {
          fieldType: 'text',
          label: 'Office Email',
          name: 'officeMail',
          placeholder: 'Enter office email',
          validation: { pattern: REGEX.email }
        },
        {
          fieldType: 'radio',
          label: 'Preferred Contact Method',
          name: 'contactMethod',
          options: prefcontactMethod
        }
      ]
    }),

    imagingLocation: groupedIntoOne({
      left: [
        //Hospital Centre
        {
          fieldType: 'text',
          label: 'Hospital/Imaging Center Name',
          name: 'hospitalCenterName',
          placeholder: 'Enter hospital/imaging center name '
        },
        {
          fieldType: 'radio',

          name: 'hospitalservice',
          options: hospitalImagingPatient
        },
        {
          fieldType: 'checkbox',

          name: 'orderSentInImaging',
          options: [
            {
              option: 'Please check here if an order has been sent to the imaging location.',
              value: 'orderSent'
            }
          ]
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
          placeholder: 'Select your State',
          options: stateOptions
        },
        {
          fieldType: 'text',
          label: 'ZIP Code',
          name: 'zip',
          placeholder: 'Enter zip code',
          inputValidation: 'numberOnly',
          validation: { pattern: REGEX.zip, maxLength: 5 }
        },
        {
          fieldType: 'text',
          label: 'Office Contact',
          name: 'officeContact',
          placeholder: 'Enter office contact'
        },
        {
          fieldType: 'text',
          label: 'Billing Contact',
          name: 'billingContact',
          placeholder: 'Enter billing contact',
          validation: { pattern: REGEX.character }
        }
      ],
      right: [
        {
          fieldType: 'text',
          label: 'Office Contact Phone Number',
          name: 'officeContactNumber',
          placeholder: 'Enter office contact phone number',
          inputValidation: 'phone',
          validation: { pattern: REGEX.phone }
        },
        {
          fieldType: 'text',
          label: 'Billing Contact Phone Number',
          name: 'billingContactNumber',
          placeholder: 'Enter billing contact phone number',
          inputValidation: 'phone',
          validation: { pattern: REGEX.phone }
        },
        {
          fieldType: 'text',
          label: 'Office Contact Email',
          name: 'officeContactEmail',
          placeholder: 'Enter office contact email',
          validation: { pattern: REGEX.email }
        },
        {
          fieldType: 'text',
          label: 'Fax Number',
          name: 'faxNumber',
          placeholder: 'Enter fax number',
          inputValidation: 'phone',
          validation: { pattern: REGEX.phone }
        },
        //Anticipated Scan Date
        {
          fieldType: 'date',
          label: 'Anticipated Scan Date',
          name: 'anticipatedScanDate'
        },
        //Tax ID Number
        {
          fieldType: 'text',
          label: 'Tax ID Number',
          name: 'taxNumber',
          placeholder: 'Enter tax ID number',
          inputValidation: 'numberOnly',
          validation: { pattern: REGEX.taxId, maxLength: 9 }
        },
        {
          fieldType: 'text',
          label: 'Imaging Center NPI Number',
          name: 'centerNpiNumber',
          placeholder: 'Enter imaging center NPI number',
          inputValidation: 'numberOnly',
          validation: { pattern: REGEX.numeric, minLength: 10, maxLength: 10 }
        },
        {
          fieldType: 'text',
          label: 'Medicare PTAN',
          name: 'otherMedicarePtan',
          placeholder: 'Enter medicare PTAN',
          hint: '(Provider transaction access number)'
        },
        {
          fieldType: 'radio',
          label: 'Preferred Contact Method',
          name: 'otherContactMethod',
          options: prefcontactMethod
        }
      ]
    })
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
  }),

  attestation: []
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
export const INSURANCE_CONFIRMATION = `Are you sure attachment includes required info? <br /> <ul class="m-0 mt-3 left-list"> <li>Medical Insurance Company</li> <li>Phone Number</li> <li>Plan Type</li> <li>Group Number</li> <li>Policy ID/MBI Number</li></ul>`;

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
