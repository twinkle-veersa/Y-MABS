import { MESSAGING } from '@constants/messages';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { API } from '@constants/endpoints';
import { environment } from 'environments/environment';
import { ApiService } from './api.service';
import { Facility } from 'app/pages/profile/profile.model';
import {
  MessageDraft,
  MessageListRequest,
  MessageListResponse,
  SecureMessage,
  SendMessageRequest
} from 'app/pages/messages/messages.model';

@Injectable({ providedIn: 'root' })
export class MessagesService {
  private api = inject(ApiService);
  private http = inject(HttpClient);

  private get username(): string {
    const username = this.api.tokenInfo()?.acctname;
    if (!username) throw new Error(MESSAGING.feedback.sessionExpired);
    return username;
  }

  list(request: MessageListRequest) {
    return this.api.call
      .post<
        MessageListRequest,
        MessageListResponse
      >(API.MESSAGE_LIST + encodeURIComponent(this.username), request)
      .pipe(map(res => this.unwrap(res)));
  }

  facilities() {
    return this.api.call
      .get<
        Facility[]
      >(API.USER_FACILITIES, { query: { portalAccountId: this.api.tokenInfo()!.acctid } })
      .pipe(map(res => this.unwrap(res)));
  }

  send(draft: MessageDraft, reply?: { message: SecureMessage; threadId: number }) {
    const original = reply?.message;
    const request: SendMessageRequest = {
      Username: this.username,
      Subject: original?.subject ?? draft.subject.trim(),
      Body: draft.body,
      PortalMessageCategory: { Id: original?.portalMessageCategory.id ?? draft.category },
      MessageThreadId: reply?.threadId ?? null,
      RelatedPatientPkId: original ? original.relatedPatientPkId : draft.patientId,
      RelatedFaciltyPkId: original ? original.relatedFaciltyPkId : draft.facilityId,
      ParentPortalMessageId: original?.portalMessagePkId ?? null,
      PriorityIndicator: original ? null : draft.highPriority,
      ReadIndicator: false,
      FavouriteIndicator: false,
      AttachmentDTO: draft.attachments
    };
    return this.api.call
      .post<
        SendMessageRequest,
        unknown
      >(API.MESSAGE_SAVE + encodeURIComponent(this.username), request)
      .pipe(map(res => this.unwrap(res)));
  }

  markRead(messageId: number, read: boolean) {
    return this.action(read ? API.MESSAGE_MARK_READ : API.MESSAGE_MARK_UNREAD, {
      MessageId: messageId
    });
  }

  favorite(messageId: number, favorite: boolean) {
    return this.action(API.MESSAGE_MARK_FAVORITE, { MessageId: messageId, FavoriteFlag: favorite });
  }

  archive(threadId: number, archived: boolean) {
    return this.action(API.MESSAGE_MARK_ARCHIVE, {
      MessageThreadId: threadId,
      ArchiveFlag: archived
    });
  }

  document(messageId: number, documentId: string) {
    return this.http.get(
      environment.portalv11Url +
        API.MESSAGE_DOCUMENTS +
        `${encodeURIComponent(this.username)}/${messageId}/${encodeURIComponent(documentId)}`,
      { responseType: 'blob' }
    );
  }

  private action(
    endpoint: string,
    payload:
      | { MessageId: number; FavoriteFlag?: boolean }
      | { MessageThreadId: number; ArchiveFlag: boolean }
  ) {
    return this.api.call
      .post<
        typeof payload,
        unknown
      >(API.MESSAGES + encodeURIComponent(this.username) + '/' + endpoint, payload)
      .pipe(map(res => this.unwrap(res)));
  }

  private unwrap<T>(response: { Status: string; Payload: T; Errors?: { Message: string }[] }): T {
    if (response.Status !== 'SUCCESS')
      throw new Error(response.Errors?.[0]?.Message || MESSAGING.feedback.requestFailed);
    return response.Payload;
  }
}
