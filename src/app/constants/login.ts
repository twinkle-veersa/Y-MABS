import { FieldConfig } from '@shared/models';

export const LOGIN: {
  loginBoxTitle: string;
  form: FieldConfig[];
} = {
  loginBoxTitle: 'Welcome!',
  form: [
    {
      fieldType: 'text',
      label: 'Username',
      // API still expects `Email` as the field name
      name: 'Email',
      placeholder: ' ',
      validation: {
        required: true
      }
    },
    {
      fieldType: 'text',
      inputType: 'password',
      label: 'Password',
      name: 'Password',
      placeholder: ' ',
      validation: {
        required: true
      }
    }
  ]
};
