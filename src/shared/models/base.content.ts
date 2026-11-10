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
  email?: string;
  fax?: string;
  poBox?: string;
}
interface Footer {
  text: Content;
}

interface Content {
  line1: string;
  line2: string;
}

interface TitleContent {
  title: string;
  content?: string;
}
