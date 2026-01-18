import { FieldConfig } from '@shared/models';
import { checkPassword } from '@shared/utils/password-validations';
import { REGEX } from './regex';
import { stateOptions } from './dropdown-options';

export const ACCOUNT_TYPES = ['prescriber', 'other'] as const;
export const PRESCRIBER_STEPS = ['accountType', 'user', 'facility', 'success'] as const;
export const OTHER_STEP = ['user', 'prescriber', 'facility', 'success'] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];
export type FormStepType = (typeof PRESCRIBER_STEPS)[number] | (typeof OTHER_STEP)[number];

const createLogin: FieldConfig[] = [
  {
    fieldType: 'text',
    placeholder: ' ',
    label: 'Username',
    name: 'username',
    fieldSize: 3,
    validation: { required: true }
  },
  {
    fieldType: 'text',
    placeholder: ' ',
    inputType: 'password',
    label: 'Password',
    name: 'password',
    fieldSize: 3,
    validation: { required: true, custom: [checkPassword()] }
  },
  {
    fieldType: 'text',
    placeholder: ' ',
    fieldSize: 3,
    inputType: 'password',
    label: 'Confirm Password',
    name: 'confirmPassword',
    validation: { required: true }
  }
];
const facility: FieldConfig[] = [
  {
    fieldType: 'text',
    placeholder: ' ',
    label: 'Practice Name',
    name: 'practiceName',
    fieldSize: 3,
    validation: { required: true, pattern: REGEX.character }
  },
  {
    fieldSize: 3,
    fieldType: 'text',
    placeholder: ' ',
    label: 'Phone',
    name: 'phone',
    inputValidation: 'phone',
    validation: { pattern: REGEX.phone }
  },
  {
    fieldSize: 3,
    fieldType: 'text',
    placeholder: ' ',
    label: 'Fax',
    name: 'fax',
    inputValidation: 'phone',
    validation: { pattern: REGEX.phone }
  },
  {
    fieldType: 'text',
    placeholder: ' ',
    label: 'Email',
    name: 'email',
    fieldSize: 3,
    validation: { required: true, email: true }
  },
  {
    fieldType: 'text',
    placeholder: ' ',
    label: 'Address 1',
    name: 'address1',
    fieldSize: 3,
    validation: { required: true }
  },
  {
    fieldType: 'text',
    placeholder: ' ',
    label: 'Address 2',
    name: 'address2',
    fieldSize: 3
    // validation: { required: true }
  },
  {
    fieldType: 'text',
    placeholder: ' ',
    label: 'City',
    name: 'city',
    fieldSize: 2,
    validation: { required: true }
  },
  // change to dropdown and add option from Api
  {
    fieldSize: 0,
    fieldType: 'select',
    placeholder: ' ',
    options: stateOptions,
    label: 'State',
    name: 'state',
    validation: { required: true }
  },
  {
    fieldSize: 0,
    fieldType: 'text',
    placeholder: ' ',
    label: 'ZIP',
    name: 'zip',
    inputValidation: 'numberOnly',
    validation: { required: true, pattern: REGEX.zip, maxLength: 5 }
  }
];

export const REGISTER: Register = {
  content: {
    title: 'Create New Account',
    subtitle: 'Please complete fields below to create your account',
    accountType: {
      title: 'Tell us more about you',
      subtitle: 'Which type of account would you like to create?'
    },
    prescriber: {
      user: {
        step1: {
          title: 'Step 1: Lookup Information',
          subtitle:
            'Please look up your information from our prescriber registry to associate with this new account.'
        },
        step2: { title: 'Step 2: Complete Account Information' },
        step3: {
          title: 'Step 3: Create Username and Password',
          subtitle: 'Create a username and password to access your new online account.'
        }
      },
      facility: {
        title: 'Associated Practice Office(s)',
        subtitle:
          'Please select the Practice/Facility from the list below to be associated with the new account.',
        sectionTitle:
          'Please add or update the Practice/Facility information associated with this new account.'
      }
    },
    other: {
      user: {
        step1: { title: '' },
        step2: { title: 'User Information' },
        step3: {
          title: '',
          subtitle: 'Create a username and password to access your new online account.'
        }
      },
      prescriber: {
        title: 'Associated Prescriber(s)',
        subtitle:
          'Please provide the following information for all prescribers you would like associated with your account.'
      },
      facility: {
        title: 'Associated Practice Office(s)',
        subtitle:
          'Please select all practice/facility locations to be associated with each prescriber from the lists below. If you do not see the desired practice/facility location(s) for your prescriber(s) in the lists below, please proceed to the bottom of this screen.',
        sectionTitle:
          'Please complete the required fields below to add a practice or facility location to your account.'
      }
    },
    success: {
      title: 'Thank You for Registering!',
      subtitle: `Your registration request has been submitted. A confirmation email has been sent to the email address entered during the registration process.<br />
                  You will receive another email notification within 2 business days regarding your account approval.<br /><br />
                  If you have any questions, please contact us at 1-844-339-8514.`
    }
  },
  steps: {
    prescriber: PRESCRIBER_STEPS,
    other: OTHER_STEP
  },
  forms: {
    prescriber: {
      user: {
        step1: [
          {
            fieldSize: 12,
            fieldType: 'text',
            placeholder: ' ',
            label: 'Prescriber NPI',
            name: 'prescriberNPI',
            inputValidation: 'numberOnly',
            validation: { required: true, maxLength: 10 }
          },
          {
            fieldSize: 5,
            fieldType: 'text',
            placeholder: ' ',
            label: 'First Name',
            name: 'first',
            inputValidation: 'charOnly',
            validation: { required: true }
          },
          {
            fieldSize: 5,
            fieldType: 'text',
            placeholder: ' ',
            label: 'Last Name',
            name: 'last',
            inputValidation: 'charOnly',
            validation: { required: true }
          }
        ],
        step2: [
          {
            fieldSize: 6,
            fieldType: 'text',
            placeholder: ' ',
            label: 'First Name',
            name: 'firstName',
            inputValidation: 'charOnly',
            validation: { required: true }
          },
          {
            fieldSize: 6,
            fieldType: 'text',
            placeholder: ' ',
            label: 'Last Name',
            name: 'lastName',
            inputValidation: 'charOnly',
            validation: { required: true }
          },
          {
            fieldSize: 6,
            fieldType: 'text',
            placeholder: ' ',
            label: 'Phone',
            name: 'phone',
            inputValidation: 'phone',
            validation: { required: true, pattern: REGEX.phone }
          },
          {
            fieldSize: 6,
            fieldType: 'text',
            placeholder: ' ',
            label: 'Fax',
            name: 'fax',
            inputValidation: 'phone',
            validation: { required: true, pattern: REGEX.phone }
          },
          {
            fieldType: 'text',
            placeholder: ' ',
            label: 'Email',
            name: 'email',
            fieldSize: 12,
            validation: { required: true, email: true }
          }
        ],
        step3: createLogin
      },
      facility
    },
    other: {
      user: {
        step1: [],
        step2: [
          {
            fieldType: 'text',
            placeholder: ' ',
            label: 'First Name',
            name: 'firstName',
            fieldSize: 3,
            validation: {
              required: true
              // pattern: new RegExp(/^[a-zA-Z]+$/),
              // minLength: 3,
              // maxLength: 10
            }
          },
          {
            fieldType: 'text',
            placeholder: ' ',
            label: 'Last Name',
            name: 'lastName',
            fieldSize: 3,
            validation: {
              required: true
              // pattern: new RegExp(/^[a-zA-Z]+$/),
              // minLength: 3,
              // maxLength: 10
            }
          },

          {
            fieldSize: 3,
            fieldType: 'text',
            placeholder: ' ',
            label: 'Phone',
            name: 'phone',
            inputValidation: 'phone',
            validation: { pattern: REGEX.phone }
          },
          {
            fieldSize: 3,
            fieldType: 'text',
            placeholder: ' ',
            label: 'Fax',
            name: 'fax',
            inputValidation: 'phone',
            validation: { pattern: REGEX.phone }
          },
          {
            fieldType: 'text',
            placeholder: ' ',
            label: 'Email',
            name: 'email',
            fieldSize: 6,
            validation: { required: true, email: true }
          }
        ],
        step3: createLogin
      },
      prescriber: [
        {
          fieldSize: 5,
          fieldType: 'text',
          placeholder: ' ',
          label: 'Prescriber NPI #',
          name: 'prescriberNPI',
          inputValidation: 'numberOnly',
          validation: { required: true, minLength: 10, maxLength: 10 }
        },
        {
          fieldType: 'text',
          placeholder: ' ',
          label: 'Prescriber First Name',
          name: 'first',

          fieldSize: 3,
          validation: { required: true }
        },
        {
          fieldType: 'text',
          placeholder: ' ',
          label: 'Prescriber Last Name',
          name: 'last',
          fieldSize: 3,
          validation: { required: true }
        }
      ],
      facility
    }
  }
};

// TODO extract all type related configs to a different file
export interface UserSteps<T> {
  step1: T;
  step2: T;
  step3: T;
}
interface TitleSubtitle {
  title: string;
  subtitle?: string;
  sectionTitle?: string;
}
export interface TypeBased<T> {
  prescriber: {
    user: UserSteps<T>;
    facility: T;
  };
  other: {
    user: UserSteps<T>;
    prescriber: T;
    facility: T;
  };
}

interface Register {
  content: TitleSubtitle & {
    accountType: TitleSubtitle;
    success: TitleSubtitle;
  } & TypeBased<TitleSubtitle>;
  steps: Record<AccountType, readonly FormStepType[]>;
  forms: TypeBased<FieldConfig[]>;
}
