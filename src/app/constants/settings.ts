import { FieldConfig } from '@shared/models';
import { REGEX } from './regex';
import { stateOptions } from './dropdown-options';

export const SETTING_TABS = ['practice', 'prescriber'] as const;
export type SettingTab = (typeof SETTING_TABS)[number];
export const SETTING: {
  content: Record<SettingTab, { title: string; subtitle: string }>;
  forms: Record<SettingTab, FieldConfig[]>;
  exitConfirmation: string;
} = {
  content: {
    practice: {
      title: `Manage Office Location(s)`,
      subtitle: `Please complete the required fields below to add or update a practice or facility location associated with your account. New facility or practice locations must be associated with a  prescriber using the 'Prescriber' tab above.`
    },
    prescriber: {
      title: `Manage Prescriber(s)`,
      subtitle: `Please add or update the prescribers and offices associated with this account.`
    }
  },
  forms: {
    practice: [
      {
        fieldType: 'text',
        label: 'Practice Name',
        name: 'PracticeGroup',
        fieldSize: 3,
        validation: {
          required: true
          // pattern: REGEX.character,
          // minLength: 3,
          // maxLength: 20
        }
      },
      {
        fieldType: 'text',
        label: 'Phone',
        name: 'Phone',
        fieldSize: 3,
        inputValidation: 'phone',
        validation: { pattern: REGEX.phone }
      },
      {
        fieldType: 'text',
        label: 'Fax',
        name: 'Fax',
        fieldSize: 3,
        inputValidation: 'phone',
        validation: { pattern: REGEX.phone }
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
      }
    ],
    prescriber: [
      {
        fieldType: 'text',
        label: 'HCP NPI #',
        name: 'prescriberNPI',
        fieldSize: 5,
        placeholder: ' ',
        validation: { required: true, pattern: REGEX.numeric, maxLength: 10, minLength: 10 }
      },
      {
        fieldType: 'text',
        label: 'HCP First Name',
        name: 'firstName',
        placeholder: ' ',
        fieldSize: 3,
        validation: { required: true }
      },
      {
        fieldType: 'text',
        label: 'HCP Last Name',
        placeholder: ' ',
        name: 'lastName',
        fieldSize: 3,
        validation: { required: true }
      }
    ]
    // officeContact: [
    //   {
    //     fieldType: 'text',
    //     label: 'Office Contact First Name',
    //     name: 'firstName',
    //     fieldSize: 3
    //   },
    //   {
    //     fieldType: 'text',
    //     label: 'Office Contact Last Name',
    //     name: 'lastName',
    //     fieldSize: 3
    //   },
    //   {
    //     fieldType: 'text',
    //     label: 'Office Contact Phone',
    //     name: 'phone',
    //     fieldSize: 3,
    //     inputValidation: 'phone',
    //     validation: { pattern: REGEX.phone }
    //   },
    //   {
    //     fieldType: 'text',
    //     label: 'Office Contact Alternate Phone',
    //     name: 'altPhone',
    //     fieldSize: 3,
    //     inputValidation: 'phone',
    //     validation: { pattern: REGEX.phone }
    //   },
    //   {
    //     fieldType: 'text',
    //     label: 'Office Contact Fax',
    //     name: 'fax',
    //     fieldSize: 3,
    //     inputValidation: 'phone',
    //     validation: { pattern: REGEX.phone }
    //   },
    //   {
    //     fieldType: 'text',
    //     label: 'Office Contact Email',
    //     name: 'email',
    //     fieldSize: 3,
    //     validation: { pattern: REGEX.email }
    //   }
    // ]
  },
  exitConfirmation: `Are you sure you want to exit the account settings? <br /> You have not saved your changes.`
};
export const ENDPOINTS = {};
