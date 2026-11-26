export const TOOLS: Tools = {
  title: 'Tools and Forms',
  header: 'Y-mabs Connect',
  columns: [
    {
      head: 'ENROLLMENT FORM AND SUPPORT',
      links: [
        { label: 'Document 1', pdfSrc: '' },
        { label: 'Document 2', pdfSrc: '' }
      ]
    }
  ],
  exitConfirmation: `You are leaving Y-mAbs Connect Portal. <br /> Would you like to continue?`
};

interface Tools {
  title: string;
  header: string;
  columns: Column[];
  exitConfirmation: string;
}

interface Column {
  head: string;
  links: Link[];
}

export interface Link {
  label: string;
  content?: string;
  pdfSrc?: string;
  href?: string;
  popupOpen?: boolean;
}
