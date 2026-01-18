import { FieldConfig } from '@shared/models';
import { checkPassword } from '@shared/utils/password-validations';
export const STEPS = ['email', 'security', 'password', 'success'] as const;
export type FormStep = (typeof STEPS)[number];
export const FORGOT_PASSWORD: {
  content: Record<FormStep, { title: string; head?: string; subhead: string; action?: string }>;
  forms: Form<FieldConfig[]>;
} = {
  content: {
    email: {
      title: 'Forgot Password',
      head: 'Confirm Username & Email Address',
      subhead: 'Please provide the username and email address for your account.'
    },
    security: {
      title: 'Answer Security Questions',
      subhead: 'Please answer the following security questions to reset your password.'
    },
    password: {
      title: 'Confirm New Password',
      head: 'Confirm Your New Password',
      subhead: 'Please choose a new password.'
    },
    success: {
      title: 'Password Reset',
      subhead: 'Your password has been reset successfully',
      action: 'Continue to Login Screen'
    }
  },
  forms: {
    email: [
      {
        fieldType: 'text',
        label: 'Username',
        name: 'userName',
        validation: { required: true }
      },
      {
        fieldType: 'text',
        label: 'Email Address',
        name: 'email',
        validation: { required: true, email: true }
      }
    ],
    security: [],
    password: [
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
        placeholder: 'Confirm your new Password',
        name: 'PasswordConfirmation',
        validation: { required: true }
      }
    ],
    success: []
  }
};
export type Form<T> = Record<FormStep, T>;
