import { FieldConfig } from '@shared/models';

export const FORGOT_USERNAME: {
  content: { title: string; head: string; subhead: string };
  form: FieldConfig[];
  message: {
    success: string;
    error: { error: string; subError: string; flow: string };
  };
} = {
  content: {
    title: 'Forgot Username',
    head: 'Provide Your User Information',
    subhead: `Please provide the information you used to create your account below so that we can match you to our records.`
  },
  form: [
    {
      fieldType: 'text',
      label: 'First Name',
      name: 'FirstName',
      placeholder: 'Enter your first name',
      validation: { required: true }
    },
    {
      fieldType: 'text',
      label: 'Last Name',
      name: 'LastName',
      placeholder: 'Enter your last name',
      validation: { required: true }
    },
    {
      fieldType: 'text',
      label: 'Email Address',
      name: 'Email',
      placeholder: 'Enter your email address',
      validation: { required: true, email: true }
    }
  ],
  message: {
    success: 'Your username has been sent to the email provided.',
    error: {
      error: 'One or more pieces of information entered do not match our records.',
      subError: 'Please try again or contact us at 1-800-000-0000 for additional assistance.',
      flow: 'Alternatively, click on the Register button below if you do not have a current account.'
    }
  }
};
