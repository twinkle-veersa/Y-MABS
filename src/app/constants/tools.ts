export const TOOLS: Tools = {
  title: 'Tools and Forms',
  header: 'LANTHEUS',
  icon: 'tools',
  columns: [
    {
      head: 'ENROLLMENT FORM AND SUPPORT',
      links: [
        {
          label: 'Enrollment Form',
          pdfSrc: 'pdf/Lantheus_PSS_Enrollment_Form_2Pg_DIGITAL_17DEC2024.pdf'
        },
        {
          label: 'Spanish Enrollment Form',
          pdfSrc: 'pdf/Lantheus Link Patient Enrollment Form - Digital, SPANISH (1).pdf'
        },
        {
          label: 'Lantheus Link Enrollment Form Overview Guide',
          pdfSrc:
            'pdf/PM-US-PY-0964 Lantheus Link Patient Support Enrollment Form Overview Guide (1).PDF'
        },
        {
          label: 'Lantheus Link HCP Brochure',
          pdfSrc: 'pdf/HCP Brochure - Lantheus Link - Digital.pdf'
        },
        {
          label: 'Provider Portal User Guide',
          pdfSrc: 'pdf/Lantheus Link HCP Portal Guide.pdf'
        }
      ]
    },
    {
      head: 'PAYER AND BILLING RESOURCES',
      links: [
        {
          label: 'PYLARIFY Coverage and Access Best Practices Guide',
          href: 'https://www.pylarify.com/support/order-reimbursement',
          newTab: true
        },
        {
          label: 'PYLARIFY Coding and Billing Guide',
          href: 'https://www.pylarify.com/support/order-reimbursement',
          newTab: true
        },
        {
          label: 'Template for Prior Auth/Pre-Determinations (Initial Staging)',
          pdfSrc: 'pdf/PyLARIFY - INITIAL PA-PD (3).pdf'
        },
        {
          label: 'Template for Prior Auth/Pre-Determinations (Biochemical Recurrence)',
          pdfSrc: 'pdf/PyLARIFY - RECURRENT  PA-PD (3).pdf'
        },
        {
          label: 'Template for Appeal (Initial Staging)',
          pdfSrc: 'pdf/PyLARIFY - INITIAL APPEAL (4).pdf'
        },
        {
          label: 'Template for Appeal (Biochemical Recurrence)',
          pdfSrc: 'pdf/PyLARIFY - RECURRENT  APPEAL (3).pdf'
        }
      ]
    },
    {
      head: 'PRODUCT INFORMATION',
      links: [
        {
          label: 'Prescribing Information',
          href: `https://www.pylarify.com/sites/default/files/resources/prescribing-information.pdf`,
          newTab: true
        },
        {
          label: 'PYLARIFY imaging site locator',
          href: `https://www.pylarify.com/support/imaging-site-locator`,
          newTab: true
        },
        {
          label: 'www.Pylarify.com',
          href: `http://www.Pylarify.com `,
          newTab: true
        }
      ]
    },
    {
      head: 'PATIENT SUPPORT',
      links: [
        {
          label: 'PYLARIFY Patient Brochure',
          pdfSrc: `pdf/Patient Brochure - Lantheus Link - Digital.pdf`
        },
        {
          label: 'Lantheus Link Patient Brochure',
          href: `https://www.pylarify.com/support/practice-patient-support`,
          newTab: true
        },
        {
          label: 'www.Lantheuslink.com',
          href: `http://www.Lantheuslink.com `,
          newTab: true
        }
      ]
    }
  ],
  exitConfirmation: `You are leaving Lantheus Link Portal. <br /> Would you like to continue?`
};

interface Tools {
  title: string;
  header: string;
  icon: string;
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
  newTab?: boolean;
}
