import { BaseContent } from '@shared/models/base.content';

const portal = 'Lantheus Link';
const logoHref = 'https://www.lantheuslink.com/';
const phone = '1-844-339-8514';
const code = 'PM-US-PY-1004 03/25';
const links = [
  { label: 'Privacy Policy', href: 'https://www.lantheus.com/legal/privacy-policy/' },
  { label: 'Terms of Use', href: 'https://www.lantheus.com/legal/' },
  { label: 'Contact Us', href: 'https://www.lantheuslink.com/' }
];

export const BASE: BaseContent = {
  header: {
    logoAlt: `${portal} Logo`,
    logoHref,
    for: `For U.S. Healthcare<br /> Professionals Only`,
    phone
  },
  footer: {
    logoAlt: `${portal} Logo`,
    logoHref,
    links,
    text: {
      line1: `This site is intended only for residents of the United States and U.S.
      healthcare professionals only. <br /> Trademarks are the property of their
      respective owners.`,
      line2: `Portal powered by © 2025 PharmaCord LLC<br />
      Copyright © 2025 Lantheus Link or its affiliates. All trademarks are the property of their respective owners.`
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
