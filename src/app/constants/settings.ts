import { FieldConfig } from '@shared/models';
import { REGEX } from './regex';
import { stateOptions } from './dropdown-options';
import { environment } from 'environments/environment';

export const SETTING_TABS = [
  { id: 'practice', label: 'Practice' },
  { id: 'e-sign', label: 'E-Sign' }
] as const;
export type SettingTab = (typeof SETTING_TABS)[number]['id'];

export const E_SIGN_STORAGE_KEY = 'esign-verified';

export const SETTING: {
  practice: {
    title: string;
    subtitle: string;
    existingLabel: string;
    dialogTitle: string;
    dialogText: string;
  };
  eSign: {
    title: string;
    paragraphs: string[];
    requirementsIntro: string;
    requirements: string[];
    verifyUrl: string;
    verifyLabel: string;
    about: string;
    contact: string;
    active: { title: string; content: string };
  };
  forms: { practice: FieldConfig[] };
  exitConfirmation: string;
} = {
  practice: {
    title: `Manage Practice Office(s)`,
    subtitle: `Please add or update the Practice/Facility information associated with this account.`,
    existingLabel: `Existing Practice Office(s)`,
    dialogTitle: `Associated Practice Office(s)`,
    dialogText: `Please verify the practice offices that you and the healthcare prescriber are both associated with.`
  },
  eSign: {
    title: `Create Your New E-Signature Account`,
    paragraphs: [
      `If you have an existing Adobe Sign username, please create a new ID.me account as soon as possible. We're bringing you an improved e-prescribing experience.`,
      `If you're a new user, please create an account with ID.me. You can also sign in with an existing ID.me account.`
    ],
    requirementsIntro: `Follow the link below to log-in or create an ID.me account. Once you have secured your ID.me account, you will need to verify your identity using your mobile device.  You will need the following items for this process.`,
    requirements: [
      `Photo ID (Driver’s License, Passport, Passport Card, or State ID card)`,
      `A “live” selfie using your mobile device`,
      `Your Social Security Number`,
      `Prescribing information such as DEA and NPI numbers`
    ],
    verifyUrl: `https://www.id.me/`,
    verifyLabel: `Verify With ID.me`,
    about: `ID.me is our trusted technology provider in helping to keep your personal information safe. They specialize in digital identity protection and help us make sure you're you—and not someone pretending to be you—before we give you the ability to e-prescribe. We have partnered with ID.me to elevate our verification security level to the highest identity verification standards set by the National Institute of Standards and Technology (NIST).`,
    contact: `Please call the Y-mAbs Connect with any questions at 1-833-339-6227.`,
    active: {
      title: `Your E-Signature Account is Active`,
      content: `You have verified your identity with ID.me and can use the e-prescribing capabilities of the ViiVConnect enrollment process. To change any ID.me account details or multi-factor authentication methods, please visit ID.me.`
    }
  },
  forms: {
    practice: [
      {
        fieldType: 'text',
        label: 'Practice Name',
        name: 'PracticeGroup',
        fieldSize: 3,
        validation: { required: true }
      },
      {
        fieldType: 'text',
        label: 'Phone',
        name: 'Phone',
        fieldSize: 3,
        inputValidation: 'phone',
        validation: { required: true, pattern: REGEX.phone }
      },
      {
        fieldType: 'text',
        label: 'Fax',
        name: 'Fax',
        fieldSize: 3,
        inputValidation: 'phone',
        validation: { required: true, pattern: REGEX.phone }
      },
      {
        fieldType: 'text',
        label: 'Address 1',
        name: 'Line1',
        fieldSize: 3,
        validation: { required: true }
      },
      {
        fieldType: 'text',
        label: 'Address 2',
        name: 'Line2',
        fieldSize: 3
      },
      {
        fieldType: 'text',
        label: 'City',
        name: 'City',
        fieldSize: 3,
        validation: { required: true }
      },
      {
        fieldType: 'select',
        label: 'State',
        name: 'State',
        fieldSize: 3,
        options: stateOptions,
        validation: { required: true }
      },
      {
        fieldSize: 3,
        fieldType: 'text',
        label: 'Zip',
        name: 'Zipcode',
        validation: { required: true, pattern: REGEX.zip, maxLength: 5 }
      },
      {
        fieldType: 'text',
        label: 'Email',
        name: 'Email',
        fieldSize: 3,
        validation: { required: true, pattern: REGEX.email }
      }
    ]
  },
  exitConfirmation: `Are you sure you want to exit the account settings? <br /> You have not saved your changes.`
};
export const ENDPOINTS = {
  idMeVerify: 'portal/idme/verify'
};

export const ID_ME_MOCK = {
  enabled: !environment.production,
  delayMs: 1000,
  response: {
    Status: 'SUCCESS',
    Payload: {
      IsVerified: true,
      VerifiedOn: '2026-11-20T00:00:00Z',
      IdMeUserId: 'dummy-idme-user'
    },
    Errors: []
  }
} as const;
