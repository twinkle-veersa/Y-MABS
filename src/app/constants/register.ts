import { FieldConfig } from '@shared/models';
import { checkPassword } from '@shared/utils/password-validations';
import { REGEX } from './regex';
import { stateOptions } from './dropdown-options';

export const NPI_ERROR_MSG = `One or more pieces of information entered do not match our records. Please try again or contact us for additional assistance.`;
export const ROLE_PK_ID = 3;
export const REGISTER_STEPS = ['user', 'facility', 'success'] as const;

export type FormStepType = (typeof REGISTER_STEPS)[number];

const createLogin: FieldConfig[] = [
  {
    fieldType: 'text',
    placeholder: 'Enter your username',
    label: 'Username',
    name: 'username',
    autocomplete: 'off',
    fieldSize: 3,
    validation: { required: true }
  },
  {
    fieldType: 'text',
    placeholder: 'Enter your password',
    inputType: 'password',
    label: 'Password',
    name: 'password',
    autocomplete: 'new-password',
    fieldSize: 3,
    validation: { required: true, custom: [checkPassword()] }
  },
  {
    fieldType: 'text',
    placeholder: 'Confirm your password',
    fieldSize: 3,
    inputType: 'password',
    label: 'Confirm Password',
    name: 'confirmPassword',
    autocomplete: 'new-password',
    validation: { required: true }
  }
];

const facility: FieldConfig[] = [
  {
    fieldType: 'text',
    placeholder: 'Enter your practice name',
    label: 'Practice Name',
    name: 'practiceName',
    fieldSize: 3,
    validation: { required: true, pattern: REGEX.character }
  },
  {
    fieldSize: 3,
    fieldType: 'text',
    placeholder: 'Enter your phone',
    label: 'Phone',
    name: 'phone',
    inputValidation: 'phone',
    validation: { required: true, pattern: REGEX.phone }
  },
  {
    fieldSize: 3,
    fieldType: 'text',
    placeholder: 'Enter your fax',
    label: 'Fax',
    name: 'fax',
    inputValidation: 'phone',
    validation: { required: true, pattern: REGEX.phone }
  },
  {
    fieldType: 'text',
    placeholder: 'Enter your email',
    label: 'Email',
    name: 'email',
    fieldSize: 3,
    validation: { required: true, email: true }
  },
  {
    fieldType: 'text',
    placeholder: 'Enter your address 1',
    label: 'Address 1 ',
    name: 'address1',
    fieldSize: 3,
    validation: { required: true }
  },
  {
    fieldType: 'text',
    placeholder: 'Enter your address 2',
    label: 'Address 2 ',
    name: 'address2',
    fieldSize: 3
  },
  {
    fieldType: 'text',
    placeholder: 'Enter your city',
    label: 'City',
    name: 'city',
    fieldSize: 2,
    validation: { required: true }
  },
  {
    fieldSize: 0,
    fieldType: 'select',
    placeholder: 'Select your State',
    options: stateOptions,
    label: 'State',
    name: 'state',
    validation: { required: true }
  },
  {
    fieldSize: 0,
    fieldType: 'text',
    placeholder: 'Enter your zip',
    label: 'Zip',
    name: 'zip',
    inputValidation: 'numberOnly',
    validation: { required: true, pattern: REGEX.zip, maxLength: 5 }
  }
];

export const REGISTER: Register = {
  content: {
    title: 'Create New Account',
    subtitle:
      'Please complete fields below to create your account.<br />For assistance, please reference the <a href="javascript:void(0)">User Registration Guide</a>.',
    user: {
      step1: {
        title: 'Step 1 : Lookup Information',
        subtitle:
          'Please look  up your information from our prescriber registry to associate with this new account.'
      },
      step2: { title: 'Step 2 : Complete Account Information' },
      step3: {
        title: 'Step 3 : Create Username And Password ',
        subtitle: 'Create a username and password to access your new online account.'
      }
    },
    facility: {
      title: 'Associated Practice Office(s)',
      subtitle:
        'Please select the Practice/Facility from the list below to be associated with the new account.',
      sectionTitle:
        'Please add or update the Practice/Facility information associated with the new account.'
    },
    success: {
      title: 'Thank You for Registering!',
      subtitle: `Your registration request has been submitted. A confirmation email has been sent to the email address entered during the registration process.<br /><br />
                  You will receive another email notification within 1 business day regarding your account approval.<br /><br />
                  We will verify your account by calling the phone number listed for each of your associated practice offices.<br /><br />
                  If you have any questions, please contact us at 1-833-339-6227.`
    }
  },
  steps: REGISTER_STEPS,
  forms: {
    user: {
      step1: [
        {
          fieldSize: 12,
          fieldType: 'text',
          placeholder: 'Enter your NPI',
          label: 'Prescriber NPI',
          name: 'prescriberNPI',
          inputValidation: 'numberOnly',
          validation: { required: true, minLength: 10, maxLength: 10 }
        }
      ],
      step2: [
        {
          fieldSize: 6,
          fieldType: 'text',
          placeholder: 'Enter your first name',
          label: 'First Name',
          name: 'firstName',
          inputValidation: 'charOnly',
          validation: { required: true }
        },
        {
          fieldSize: 6,
          fieldType: 'text',
          placeholder: 'Enter your last name',
          label: 'Last Name',
          name: 'lastName',
          inputValidation: 'charOnly',
          validation: { required: true }
        },
        {
          fieldSize: 6,
          fieldType: 'text',
          placeholder: 'Enter your phone',
          label: 'Phone',
          name: 'phone',
          inputValidation: 'phone',
          validation: { required: true, pattern: REGEX.phone }
        },
        {
          fieldSize: 6,
          fieldType: 'text',
          placeholder: 'Enter your fax',
          label: 'Fax',
          name: 'fax',
          inputValidation: 'phone',
          validation: { required: true, pattern: REGEX.phone }
        },
        {
          fieldType: 'text',
          placeholder: 'Enter your email',
          label: 'Email',
          name: 'email',
          fieldSize: 12,
          validation: { required: true, email: true }
        }
      ],
      step3: createLogin
    },
    facility
  }
};

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

interface Register {
  content: TitleSubtitle & {
    user: UserSteps<TitleSubtitle>;
    facility: TitleSubtitle;
    success: TitleSubtitle;
  };
  steps: readonly FormStepType[];
  forms: {
    user: UserSteps<FieldConfig[]>;
    facility: FieldConfig[];
  };
}
