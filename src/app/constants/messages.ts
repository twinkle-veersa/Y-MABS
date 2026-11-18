import { FieldConfig } from '@shared/models';
import { DateFilter, Mailbox, MessageGrouping } from '../pages/messages/messages.model';

export const MESSAGE_CATEGORIES = [
  { id: 1, label: 'Account Questions' },
  { id: 2, label: 'Adverse Events or Product Complaints' },
  { id: 3, label: 'Benefit Re-Verification Request' },
  { id: 4, label: 'Enrollment Questions' },
  { id: 5, label: 'General Program Questions' },
  { id: 6, label: 'Insurance Authorization Support' },
  { id: 7, label: 'Portal How-To' },
  { id: 8, label: 'Status Update' },
  { id: 9, label: 'Update Account Information' },
  { id: 10, label: 'Update Patient Information' },
  { id: 11, label: 'Other' }
] as const;

export const MESSAGING = {
  pageSize: 100,
  attachmentMaxBytes: 10000000,
  attachmentMimeType: 'application/pdf',
  scrollThreshold: 80,
  mailboxIcons: {
    Inbox: 'messaging-inbox',
    Sent: 'messaging-sent',
    Archive: 'messaging-archive'
  } as Record<Mailbox, string>,
  mailboxes: ['Inbox', 'Sent', 'Archive'] as Mailbox[],
  groupings: ['Regarding', 'Date', 'Subject', 'Category'] as MessageGrouping[],
  dateFilters: ['Yesterday', 'Custom', 'Last Week', 'Last Month'] as DateFilter[],
  editorFormats: [
    'bold',
    'italic',
    'underline',
    'strike',
    'font',
    'size',
    'color',
    'background',
    'list',
    'indent',
    'align',
    'link'
  ],
  content: {
    title: 'Secure Messaging',
    regarding: 'Regarding:',
    backDashboard: 'Back to dashboard',
    newMail: 'New mail',
    search: 'Search messages',
    backMessages: 'Back to messages',
    toggleNavigation: 'Toggle mailbox navigation',
    favorite: 'Favorite',
    mailboxes: 'Mailboxes',
    read: 'Read ',
    sender: 'Y-mAbs Connect',
    senderInitials: 'YM',
    importance: 'High importance',
    priority: 'Priority',
    copy: 'Copy selected text',
    clearFormatting: 'Clear formatting',
    formatting: 'Message formatting',
    highImportance: 'This message was sent with High importance',
    removeFavorite: 'Remove favorite',
    markFavorite: 'Mark favorite',
    markUnread: 'Mark unread',
    markRead: 'Mark read',
    messages: 'messages',
    noMatches: 'No messages match this view.',
    retry: 'Retry',
    loading: 'Loading messages…',
    loadMore: 'Load more messages',
    newMessage: 'New Secure Message',
    replyPrefix: 'Reply: ',
    patients: 'patients',
    facilities: 'facilities',
    loadingOptions: 'Loading available',
    noOptions: 'No',
    availableOptions: 'are available for your account.',
    messageBody: 'Message body',
    messagePlaceholder: 'Type message',
    requiredMessage: 'Please enter a message.',
    remove: 'Remove ',
    preparing: 'Preparing attachments…',
    cancel: 'Cancel',
    dropFiles: 'drop files or',
    attachFiles: 'Attach PDF files',
    upload: 'Upload Files',
    send: 'Send',
    sending: 'Sending…',
    bold: 'Bold',
    italic: 'Italic',
    underline: 'Underline',
    link: 'Insert link',
    bullets: 'Bulleted list',
    numbers: 'Numbered list',
    decreaseIndent: 'Decrease indent',
    increaseIndent: 'Increase indent',
    attachmentLoading: 'Loading attachment…',
    reply: 'Reply',
    archive: 'Archive',
    restore: 'Restore',
    restoreConversation: 'Restore conversation',
    archiveConversation: 'Archive conversation',
    downloadAll: 'Download all attachments',
    preview: 'Preview',
    download: 'Download',
    attachmentPreview: 'Attachment preview',
    expandPreview: 'Expand preview',
    closePreview: 'Close attachment preview',
    emptyReader: 'Select an item to read',
    noSelection: 'Nothing is selected',
    print: 'Print',
    closeExpandedPreview: 'Close expanded preview',
    attachments: 'attachment(s)',
    facility: 'Facility',
    unavailableAssociation: 'Unavailable association',
    confirmation: 'Confirmation',
    proceed: 'Proceed'
  },
  feedback: {
    copyFailed: 'The selected text could not be copied. Please use your keyboard copy shortcut.',
    patientsFailed: 'Patient information could not be loaded.',
    listFailed: 'Messages could not be loaded. Please try again.',
    facilitiesFailed: 'Facilities could not be loaded.',
    sent: 'Your secure message has been sent.',
    sendFailed: 'Your message could not be sent. Your entered information has been retained.',
    archived: 'Conversation archived.',
    restored: 'Conversation restored.',
    actionFailed: 'The message could not be updated. Please try again.',
    exitConfirmation:
      'Are you sure you want to exit the secure messaging? Any information filled in will be lost.',
    pdfOnly: 'Only PDF files are supported.',
    fileTooLarge: 'Each PDF must be 10 MB (10,000,000 bytes) or smaller.',
    fileReadFailed: 'The selected files could not be read. Please choose them again.',
    invalidCategory: 'Please select a valid category.',
    attachmentFailed: 'The attachment could not be loaded. Please try again.',
    downloadFailed: 'One or more attachments could not be downloaded. Please try again.',
    sessionExpired: 'Your session has expired. Please sign in again.',
    requestFailed: 'The messaging request could not be completed.'
  }
};

export const MESSAGE_EDITOR_TOOLS = {
  text: [
    { className: 'ql-bold', label: MESSAGING.content.bold },
    { className: 'ql-italic', label: MESSAGING.content.italic },
    { className: 'ql-underline', label: MESSAGING.content.underline }
  ],
  paragraph: [
    { className: 'ql-list', value: 'bullet', label: MESSAGING.content.bullets },
    { className: 'ql-list', value: 'ordered', label: MESSAGING.content.numbers },
    { className: 'ql-indent', value: '-1', label: MESSAGING.content.decreaseIndent },
    { className: 'ql-indent', value: '+1', label: MESSAGING.content.increaseIndent }
  ]
} as const;

export const MESSAGE_FIELDS = {
  search: { fieldType: 'text', name: 'search', label: 'Search messages', placeholder: 'Search' },
  dateFilter: {
    fieldType: 'select',
    name: 'dateFilter',
    label: 'Date',
    options: [
      { value: '', option: 'Date' },
      ...MESSAGING.dateFilters.map(date => ({ value: date, option: date }))
    ]
  },
  grouping: {
    fieldType: 'select',
    name: 'grouping',
    label: 'Group messages by',
    options: MESSAGING.groupings.map(group => ({ value: group, option: group }))
  },
  dateStart: { fieldType: 'date', name: 'dateStart', label: 'From' },
  dateEnd: { fieldType: 'date', name: 'dateEnd', label: 'To' },
  regarding: {
    fieldType: 'select',
    name: 'regarding',
    label: 'Regarding',
    placeholder: 'Select patient or facility message',
    options: [
      { value: 'Patient', option: 'Patient' },
      { value: 'Facility', option: 'Facility' }
    ]
  },
  patient: { fieldType: 'select', name: 'association', label: 'Patient' },
  facility: { fieldType: 'select', name: 'association', label: 'Facility' },
  category: {
    fieldType: 'select',
    name: 'category',
    label: 'Category',
    options: MESSAGE_CATEGORIES.map(category => ({ value: category.id, option: category.label }))
  },
  subject: { fieldType: 'text', name: 'subject', label: 'Subject', placeholder: 'Add a subject' }
} satisfies Record<string, FieldConfig>;

const colors = [
  { value: '', option: 'Default' },
  { value: '#000000', option: 'Black' },
  { value: '#e60000', option: 'Red' },
  { value: '#ff9900', option: 'Orange' },
  { value: '#ffff00', option: 'Yellow' },
  { value: '#008a00', option: 'Green' },
  { value: '#0066cc', option: 'Blue' },
  { value: '#9933ff', option: 'Purple' }
];
export const MESSAGE_EDITOR_FIELDS = {
  font: {
    fieldType: 'select',
    name: 'font',
    label: 'Font',
    options: [
      { value: '', option: 'Segoe UI' },
      { value: 'serif', option: 'Serif' },
      { value: 'monospace', option: 'Monospace' }
    ]
  },
  size: {
    fieldType: 'select',
    name: 'size',
    label: 'Font size',
    options: [
      { value: 'small', option: '10' },
      { value: '', option: '12' },
      { value: 'large', option: '18' },
      { value: 'huge', option: '24' }
    ]
  },
  color: { fieldType: 'select', name: 'color', label: 'Text color', options: colors },
  background: {
    fieldType: 'select',
    name: 'background',
    label: 'Highlight color',
    options: colors
  },
  align: {
    fieldType: 'select',
    name: 'align',
    label: 'Alignment',
    options: [
      { value: '', option: 'Left' },
      { value: 'center', option: 'Center' },
      { value: 'right', option: 'Right' },
      { value: 'justify', option: 'Justify' }
    ]
  }
} satisfies Record<string, FieldConfig>;
