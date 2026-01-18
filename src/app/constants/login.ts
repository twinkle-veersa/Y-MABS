import { FieldConfig } from '@shared/models';

export const LOGIN: {
  supportTitle: string;
  loginBoxTitle: string;
  list: string[];
  form: FieldConfig[];
} = {
  loginBoxTitle: 'Login',
  supportTitle: '24/7 Online Support',
  list: [
    'Enroll patients online',
    'Upload documents',
    `Check patient enrollment statuses`,
    'Get Real-time notifications alerts',
    `Check plan coverage and track <br/ > scan status`
  ],
  form: [
    {
      fieldType: 'text',
      label: 'Username',
      name: 'Email',
      placeholder: 'Enter your username'
    },
    {
      fieldType: 'text',
      inputType: 'password',
      label: 'Password',
      name: 'Password',
      placeholder: 'Enter your password'
    }
  ]
};
