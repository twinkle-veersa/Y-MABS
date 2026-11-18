export type Mailbox = 'Inbox' | 'Sent' | 'Archive';
export type MessageGrouping = 'Regarding' | 'Date' | 'Subject' | 'Category';
export type MessageAction = 'read' | 'unread' | 'favorite' | 'archive';
export type DateFilter = '' | 'Yesterday' | 'Custom' | 'Last Week' | 'Last Month';

export interface MessageDocument {
  document: { DocID: string; documentType: { documentType: string } };
}

export interface SecureMessage {
  portalMessagePkId: number;
  subject: string;
  body: string;
  createDate: string;
  relatedPatientPkId: number | null;
  relatedFaciltyPkId: number | null;
  portalMessageCategory: { id: number; value: string };
  senderPortalAccount: { userAccountName: string; emailAddress: string } | null;
  readIndicator: boolean;
  favouriteIndicator: boolean;
  priorityIndicator: boolean | null;
  messageDocs: MessageDocument[];
}

export interface MessageThread {
  ThreadId: number;
  Mails: SecureMessage[];
}

export interface MessageGroup {
  GroupByKey: string;
  Threads: MessageThread[];
}

export interface MessageListResponse {
  GroupBy: MessageGrouping;
  Result: MessageGroup[];
}

export interface MessageListRequest {
  Page: number;
  Limit: number;
  GroupBy: MessageGrouping;
  MessageCategoryId: null;
  Indicator: Mailbox;
}

export interface MessageAttachment {
  DocumentData: string;
  DocumentName: string;
}

export interface MessageDraft {
  subject: string;
  body: string;
  category: number;
  patientId: number | null;
  facilityId: number | null;
  highPriority: boolean;
  attachments: MessageAttachment[];
}

export interface SendMessageRequest {
  Username: string;
  Subject: string;
  Body: string;
  PortalMessageCategory: { Id: number };
  MessageThreadId: number | null;
  RelatedPatientPkId: number | null;
  RelatedFaciltyPkId: number | null;
  ParentPortalMessageId: number | null;
  PriorityIndicator: boolean | null;
  ReadIndicator: false;
  FavouriteIndicator: false;
  AttachmentDTO: MessageAttachment[];
}

export interface RegardingOption {
  id: number;
  label: string;
}

export interface MessageActionEvent {
  action: MessageAction;
  message: SecureMessage;
  threadId: number;
}

export function messageText(html: string): string {
  const document = new DOMParser().parseFromString(html, 'text/html');
  return (document.body.textContent ?? '').replace(/\u00a0/g, ' ').trim();
}

export function mergeMessageGroups(
  current: MessageGroup[],
  incoming: MessageGroup[]
): MessageGroup[] {
  const groups = new Map(current.map(group => [group.GroupByKey, group]));
  for (const group of incoming) {
    const threads = new Map(
      groups.get(group.GroupByKey)?.Threads.map(thread => [thread.ThreadId, thread]) ?? []
    );
    for (const thread of group.Threads) {
      const mails = new Map(
        threads.get(thread.ThreadId)?.Mails.map(mail => [mail.portalMessagePkId, mail]) ?? []
      );
      for (const mail of thread.Mails) mails.set(mail.portalMessagePkId, mail);
      threads.set(thread.ThreadId, {
        ...thread,
        Mails: [...mails.values()].sort(
          (a, b) => Date.parse(b.createDate) - Date.parse(a.createDate)
        )
      });
    }
    groups.set(group.GroupByKey, { ...group, Threads: [...threads.values()] });
  }
  return [...groups.values()];
}
