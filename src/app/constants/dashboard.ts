export const DASHBOARD = {
  chart: 'Number of Patients',
  statuses: 'Patient enrollment status',
  actions: 'Actions Needed',
  emptyActions: 'No actions are needed at this time.',
  emptyPatients: 'No active patients to display.',
  error: 'Patient information could not be loaded.',
  retry: 'Retry',
  unavailablePatient: 'Patient name unavailable'
} as const;

export const DASHBOARD_STATUSES = [
  { key: 'intake', label: 'Intake', lines: ['Intake'], filter: 'Intake' },
  {
    key: 'benefitInvestigation',
    label: 'Benefit Investigation In-process',
    lines: ['Benefit', 'Investigation', 'In-process'],
    filter: 'Benefit Investigation'
  },
  {
    key: 'insuranceAuthRequired',
    label: 'Insurance Auth Required',
    lines: ['Insurance', 'Auth', 'Required'],
    filter: 'Insurance Authorization'
  },
  {
    key: 'financialServices',
    label: 'Financial Services In-process',
    lines: ['Financial', 'Services', 'In-process'],
    filter: 'Financial Services'
  },
  {
    key: 'papEvaluation',
    label: 'PAP Evaluation In-process',
    lines: ['PAP', 'Evaluation', 'In-process'],
    filter: 'PAP'
  },
  { key: 'other', label: 'Other', lines: ['Other'], filter: 'Other' }
] as const;

export type DashboardStatusKey = (typeof DASHBOARD_STATUSES)[number]['key'];
