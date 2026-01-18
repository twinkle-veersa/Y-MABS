export interface BaseContent {
  header: Header;
  footer: Footer;
  register: TitleContent;
  logout: TitleContent;
}

interface Header {
  logoAlt: string;
  logoHref?: string;
  for?: string;
  phone: string;
}
interface Footer {
  logoAlt: string;
  logoHref: string;
  links: Link[];
  text: Content;
  code: string;
}

interface Content {
  line1: string;
  line2: string;
}

interface Link {
  label: string;
  href: string;
}

interface TitleContent {
  title: string;
  content?: string;
}
