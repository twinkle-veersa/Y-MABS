import { FieldConfig } from '@shared/models';

export const FIRST_TIME_LOGIN: {
  content: {
    title: string;
    head: string;
    subhead: string;
  };
  forms: FieldConfig[];
} = {
  content: {
    title: 'Account Security Questions',
    head: 'Select New Account Security Questions',
    subhead:
      'Select 3 security questions below. These questions will help us verify your identity in the event you forget your password.'
  },
  forms: [
    {
      position: 'left',
      fieldType: 'text',
      inputType: 'password',
      label: 'Current Password',
      name: 'currentPassword',
      validation: { required: true }
    },
    {
      position: 'left',
      fieldType: 'select',
      label: 'Select a Question',
      placeholder: 'Select',
      name: 'question1',
      options: [],
      validation: { required: true }
    },
    {
      position: 'left',
      fieldType: 'text',
      label: 'Your Answer',
      name: 'answer1',
      validation: { required: true }
    },
    {
      position: 'right',
      fieldType: 'select',
      label: 'Select a Question',
      placeholder: 'Select',
      name: 'question2',
      options: [],
      validation: { required: true }
    },
    {
      position: 'right',
      fieldType: 'text',
      label: 'Your Answer',
      name: 'answer2',
      validation: { required: true }
    },
    {
      position: 'right',
      fieldType: 'select',
      label: 'Select a Question',
      placeholder: 'Select',
      name: 'question3',
      options: [],
      validation: { required: true }
    },
    {
      position: 'right',
      fieldType: 'text',
      label: 'Your Answer',
      name: 'answer3',
      validation: { required: true }
    }
  ]
};
