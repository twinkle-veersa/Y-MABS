import { BaseContent } from '@shared/models/base.content';

const portal = 'Y-mAbs Connect';
const logoHref = 'https://www.ymabs.com/';
const phone = '1-833-339-6227';
const email = 'ymabsconnect@valeris.com';
const fax = '1-877-209-6227';
const poBox = '5490 Louisville, KY 40255';
const code = '';
const links = [
  { label: 'Privacy Policy', href: 'https://www.ymabs.com/' },
  { label: 'Terms of Use', href: 'https://www.ymabs.com/' },
  { label: 'Contact Us', href: 'mailto:ymabsconnect@valeris.com' }
];

export const BASE: BaseContent = {
  header: {
    logoAlt: `${portal} Logo`,
    logoHref,
    for: `For U.S. Healthcare<br /> Professionals Only`,
    phone,
    email,
    fax,
    poBox
  },
  footer: {
    logoAlt: `${portal} Logo`,
    logoHref,
    links,
    text: {
      line1: `This site is intended only for residents of the United States and U.S.
      healthcare professionals only.`,
      line2: `All Rights Reserved.`
    },
    code
  },
  register: {
    title: 'Thank You for Registering!',
    content: `Your registration request has been submitted. A confirmation email has been sent to the email address entered during the registration process.
     <br /> You will receive another email notification within 2 business days regarding your account approval. <br /> <br />
    If you have any questions, please contact us at ${phone}.`
  },
  logout: {
    title: 'Log out Successful!'
  }
};
