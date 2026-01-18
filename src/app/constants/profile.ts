import { FieldConfig } from '@shared/models';
import { checkPassword } from '@shared/utils/password-validations';
import { REGEX } from './regex';

export const TABS = ['password', 'security', 'info'] as const;
export type Tab = (typeof TABS)[number];
export const PROFILE: {
  content: Record<Tab, { title: string; head: string }>;
  forms: Record<Tab, FieldConfig[]>;
  exitConfirmation: string;
} = {
  content: {
    password: {
      title: 'Change Password',
      head: 'Enter your current password and a new password.'
    },
    security: {
      title: 'Change Security Question',
      head: 'Update your security questions in the event you forget your password.'
    },
    info: {
      title: 'Profile Information',
      head: 'Manage your profile and contact information.'
    }
  },
  forms: {
    password: [
      {
        fieldType: 'text',
        inputType: 'password',
        label: 'Current Password',
        name: 'CurrentPassword',
        validation: { required: true }
      },
      {
        fieldType: 'text',
        inputType: 'password',
        label: 'New Password',
        name: 'Password',
        validation: { required: true, custom: [checkPassword()] }
      },
      {
        fieldType: 'text',
        inputType: 'password',
        label: 'Confirm New Password',
        placeholder: 'Confirm New Password',
        name: 'PasswordConfirmation',
        validation: { required: true }
      }
    ],
    security: [
      {
        fieldType: 'text',
        position: 'left',
        inputType: 'password',
        label: 'Current Password',
        name: 'CurrentPassword',
        validation: { required: true }
      },
      {
        position: 'left',
        fieldType: 'select',
        label: 'Select a Question',
        placeholder: 'Select',
        name: 'Id_1',
        options: [],
        validation: { required: true }
      },
      {
        position: 'left',
        fieldType: 'text',
        label: 'Your Answer',
        name: 'Answer_1',
        validation: { required: true }
      },
      {
        position: 'right',
        fieldType: 'select',
        label: 'Select a Question',
        placeholder: 'Select',
        name: 'Id_2',
        options: [],
        validation: { required: true }
      },
      {
        position: 'right',
        fieldType: 'text',
        label: 'Your Answer',
        name: 'Answer_2',
        validation: { required: true }
      },
      {
        position: 'right',
        fieldType: 'select',
        label: 'Select a Question',
        placeholder: 'Select',
        name: 'Id_3',
        options: [],
        validation: { required: true }
      },
      {
        position: 'right',
        fieldType: 'text',
        label: 'Your Answer',
        name: 'Answer_3',
        validation: { required: true }
      }
    ],
    info: [
      {
        fieldType: 'text',
        label: 'First Name',
        name: 'FirstName',
        fieldSize: 3,
        validation: {
          required: true
          // pattern: REGEX.character,
          // minLength: 3,
          // maxLength: 10
        }
      },
      {
        fieldType: 'text',
        label: 'Last Name',
        name: 'LastName',
        fieldSize: 3,
        validation: {
          required: true
          // pattern: REGEX.character,
          // minLength: 3,
          // maxLength: 10
        }
      },

      // need to work on this
      {
        fieldSize: 3,
        fieldType: 'text',
        label: 'Phone',
        name: 'Phone',
        inputValidation: 'phone',
        validation: { pattern: REGEX.phone }
      },
      {
        fieldSize: 3,
        fieldType: 'text',
        label: 'Fax',
        name: 'Fax',
        inputValidation: 'phone',
        validation: { pattern: REGEX.phone }
      },
      {
        fieldType: 'text',
        label: 'Email',
        name: 'Email',
        fieldSize: 6,
        validation: { required: true, email: true }
      }
    ]
  },
  exitConfirmation: `Are you sure you want to exit profile? <br /> You have not saved your changes.`
};
export const ENDPOINTS = {
  securityOptions: 'portal/securityQuestion',
  accountInfo: 'account/',
  securityAnswers: 'portal/account/securityQuestion',
  updatePassword: 'portal/account/person/updatePassword',
  updateSecurity: 'portal/account/answerSecurityQuestionUpdate',
  updateInfo: 'portal/account/person/update'
};
