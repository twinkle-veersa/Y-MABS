import { MESSAGING } from '@constants/messages';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { PdfViewerComponent } from '@shared/components/pdf-viewer.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { MessagesService } from '@shared/services/messages.service';
import {
  Mailbox,
  MessageActionEvent,
  MessageDocument,
  MessageThread,
  SecureMessage
} from '../messages.model';

@Component({
  selector: 'app-message-reader',
  imports: [DatePipe, PdfViewerComponent, IconComponent],
  templateUrl: './message-reader.component.html',
  styleUrl: './message-reader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageReaderComponent {
  readonly content = MESSAGING.content;
  thread = input<MessageThread | null>(null);
  mailbox = input<Mailbox>('Inbox');
  selectedMessageId = input<number | null>(null);
  regardingLabels = input<Record<number, string>>({});
  pendingActions = input<number[]>([]);
  reply = output<SecureMessage>();
  messageAction = output<MessageActionEvent>();
  private service = inject(MessagesService);
  private pdf = inject(NgxExtendedPdfViewerService);
  private destroyRef = inject(DestroyRef);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private attachmentDialog = viewChild<ElementRef<HTMLDialogElement>>('attachmentDialog');
  private documentRequest?: Subscription;
  readonly preview = signal<{
    blob: Blob;
    message: SecureMessage;
    document: MessageDocument;
  } | null>(null);
  readonly documentLoading = signal(false);
  readonly documentError = signal('');
  readonly expanded = signal(false);
  readonly threadId = computed(() => this.thread()?.ThreadId);

  constructor() {
    effect(() => {
      this.threadId();
      untracked(() => this.closePreview());
    });
    afterRenderEffect(() => {
      const id = this.selectedMessageId();
      if (id !== null)
        this.host.nativeElement
          .querySelector(`#message-${id}`)
          ?.scrollIntoView({ block: 'nearest' });
    });
  }

  action(action: MessageActionEvent['action'], message: SecureMessage) {
    const thread = this.thread();
    if (thread) this.messageAction.emit({ action, message, threadId: thread.ThreadId });
  }

  openDocument(message: SecureMessage, document: MessageDocument, download = false) {
    if (!this.thread()) return;
    this.documentRequest?.unsubscribe();
    this.documentLoading.set(true);
    this.documentError.set('');
    this.documentRequest = this.service
      .document(message.portalMessagePkId, document.document.DocID)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: blob => {
          this.documentLoading.set(false);
          if (download) this.save(blob, document.document.documentType.documentType);
          else this.preview.set({ blob, message, document });
        },
        error: () => {
          this.documentLoading.set(false);
          this.documentError.set(MESSAGING.feedback.attachmentFailed);
        }
      });
  }

  expandPreview() {
    this.expanded.set(true);
    this.attachmentDialog()?.nativeElement.showModal();
  }
  collapsePreview() {
    this.expanded.set(false);
    this.attachmentDialog()?.nativeElement.close();
  }
  closePreview() {
    this.documentRequest?.unsubscribe();
    this.documentLoading.set(false);
    this.collapsePreview();
    this.preview.set(null);
    this.documentError.set('');
  }
  downloadPreview() {
    const preview = this.preview();
    if (preview) this.save(preview.blob, preview.document.document.documentType.documentType);
  }
  printPreview() {
    this.pdf.print();
  }
  replyFromPreview() {
    const message = this.preview()?.message;
    this.closePreview();
    if (message) this.reply.emit(message);
  }
  archiveFromPreview() {
    const message = this.preview()?.message;
    this.closePreview();
    if (message) this.action('archive', message);
  }
  downloadAll(message: SecureMessage) {
    // Keep each request independent; cancelling a preview must not cancel a download.
    for (const document of message.messageDocs) {
      this.service
        .document(message.portalMessagePkId, document.document.DocID)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: blob => this.save(blob, document.document.documentType.documentType),
          error: () => this.documentError.set(MESSAGING.feedback.downloadFailed)
        });
    }
  }
  private save(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = /\.pdf$/i.test(name) ? name : name + '.pdf';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
