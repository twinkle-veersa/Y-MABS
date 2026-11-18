import { MESSAGE_FIELDS, MESSAGING } from '@constants/messages';
import { FormControl, FormGroup } from '@angular/forms';
import { InputComponent } from '@shared/components/input/input.component';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from '@shared/services/data.service';
import { MessagesService } from '@shared/services/messages.service';
import { AlertService } from '@shared/services/alert.service';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ToastrService } from 'ngx-toastr';
import { MessageListComponent } from './message-list/message-list.component';
import { MessageReaderComponent } from './message-reader/message-reader.component';
import { MessageComposeComponent } from './message-compose/message-compose.component';
import {
  DateFilter,
  Mailbox,
  MessageActionEvent,
  MessageDraft,
  MessageGroup,
  MessageGrouping,
  mergeMessageGroups,
  messageText,
  RegardingOption,
  SecureMessage
} from './messages.model';

@Component({
  selector: 'app-messages',
  imports: [
    InputComponent,
    IconComponent,
    MessageListComponent,
    MessageReaderComponent,
    MessageComposeComponent
  ],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:beforeunload)': 'beforeUnload($event)' }
})
export class MessagesComponent {
  readonly content = MESSAGING.content;
  private service = inject(MessagesService);
  private data = inject(DataService);
  private alert = inject(AlertService);
  private toast = inject(ToastrService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private listRequest?: Subscription;
  private page = 0;
  readonly groups = signal<MessageGroup[]>([]);
  readonly mailbox = signal<Mailbox>('Inbox');
  readonly grouping = signal<MessageGrouping>('Regarding');
  readonly searchField = MESSAGE_FIELDS.search;
  readonly searchForm = new FormGroup({ search: new FormControl('', { nonNullable: true }) });
  readonly search = toSignal(this.searchForm.controls.search.valueChanges, { initialValue: '' });
  readonly favoriteOnly = signal(false);
  readonly dateFilter = signal<DateFilter>('');
  readonly dateStart = signal('');
  readonly dateEnd = signal('');
  readonly loading = signal(false);
  readonly error = signal('');
  readonly endOfData = signal(false);
  readonly selectedThreadId = signal<number | null>(null);
  readonly selectedMessageId = signal<number | null>(null);
  readonly mobileReader = signal(false);
  readonly sidebarOpen = signal(true);
  readonly composing = signal(false);
  readonly replyTo = signal<SecureMessage | null>(null);
  readonly draftDirty = signal(false);
  readonly sending = signal(false);
  readonly pendingActions = signal<number[]>([]);
  readonly facilities = signal<RegardingOption[]>([]);
  readonly facilitiesLoading = signal(true);
  readonly facilitiesError = signal('');
  readonly patientsLoading = computed(() => this.data.caseDataRs.isLoading());
  readonly patientsError = computed(() =>
    this.data.caseDataRs.error() ? MESSAGING.feedback.patientsFailed : ''
  );
  readonly patients = computed<RegardingOption[]>(() => {
    const patients = new Map<number, RegardingOption>();
    for (const item of this.data.sortedPatients()) {
      if (item.PatientId && item.PatientName)
        patients.set(Number(item.PatientId), {
          id: Number(item.PatientId),
          label: `${item.PatientName}${item.DateOfBirth ? ` (${item.DateOfBirth.slice(0, 10)})` : ''}`
        });
    }
    return [...patients.values()];
  });
  readonly selectedThread = computed(
    () =>
      this.groups()
        .flatMap(group => group.Threads)
        .find(thread => thread.ThreadId === this.selectedThreadId()) ?? null
  );
  readonly groupLabels = computed(() =>
    Object.fromEntries(
      this.groups().map(group => [group.GroupByKey, this.groupLabel(group.GroupByKey)])
    )
  );
  readonly regardingLabels = computed(() =>
    Object.fromEntries(
      (this.selectedThread()?.Mails ?? []).map(message => [
        message.portalMessagePkId,
        this.regarding(message)
      ])
    )
  );
  readonly visibleGroups = computed(() => {
    const search = this.search().trim().toLowerCase();
    const range = this.dateRange();
    return this.groups()
      .map(group => ({
        ...group,
        Threads: group.Threads.map(thread => ({
          ...thread,
          Mails: thread.Mails.filter(mail => {
            const date = new Date(mail.createDate).getTime();
            return (
              (!this.favoriteOnly() || mail.favouriteIndicator) &&
              (!range || (date >= range[0] && date <= range[1])) &&
              (!search ||
                [
                  mail.subject,
                  messageText(mail.body),
                  this.regarding(mail),
                  mail.senderPortalAccount?.userAccountName ?? '',
                  this.groupLabel(group.GroupByKey)
                ].some(value => value.toLowerCase().includes(search)))
            );
          })
        })).filter(thread => thread.Mails.length)
      }))
      .filter(group => group.Threads.length);
  });

  constructor() {
    this.load();
    this.loadFacilities();
  }

  load(reset = true) {
    if (!reset && (this.loading() || this.endOfData())) return;
    this.listRequest?.unsubscribe();
    const page = reset ? 1 : this.page + 1;
    if (reset) {
      this.groups.set([]);
      this.selectedThreadId.set(null);
      this.selectedMessageId.set(null);
      this.endOfData.set(false);
      this.page = 0;
    }
    this.loading.set(true);
    this.error.set('');
    this.listRequest = this.service
      .list({
        Page: page,
        Limit: MESSAGING.pageSize,
        GroupBy: this.grouping(),
        MessageCategoryId: null,
        Indicator: this.mailbox()
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          const incoming = response.Result ?? [];
          this.groups.update(current => mergeMessageGroups(current, incoming));
          this.endOfData.set(incoming.length === 0);
          this.page = page;
          this.loading.set(false);
        },
        error: () => {
          this.error.set(MESSAGING.feedback.listFailed);
          this.loading.set(false);
        }
      });
  }

  loadFacilities() {
    this.facilitiesLoading.set(true);
    this.facilitiesError.set('');
    this.service
      .facilities()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: facilities => {
          this.facilities.set(
            (facilities ?? []).flatMap(facility =>
              facility.Id
                ? [
                    {
                      id: Number(facility.Id),
                      label: `${facility.OfficeName || facility.PracticeGroup || MESSAGING.content.facility} (${facility.Id})`
                    }
                  ]
                : []
            )
          );
          this.facilitiesLoading.set(false);
        },
        error: () => {
          this.facilitiesError.set(MESSAGING.feedback.facilitiesFailed);
          this.facilitiesLoading.set(false);
        }
      });
  }

  retryOptions() {
    this.data.caseDataRs.reload();
    this.loadFacilities();
  }

  async changeMailbox(mailbox: Mailbox) {
    if (mailbox === this.mailbox() || !(await this.discardDraft())) return;
    this.mailbox.set(mailbox);
    this.searchForm.controls.search.setValue('');
    this.favoriteOnly.set(false);
    this.dateFilter.set('');
    this.mobileReader.set(false);
    this.load();
  }

  async changeGrouping(grouping: MessageGrouping) {
    if (grouping === this.grouping() || !(await this.discardDraft())) return;
    this.grouping.set(grouping);
    this.load();
  }

  async selectThread(selection: { threadId: number; messageId: number }) {
    if (!(await this.discardDraft())) return;
    this.selectedThreadId.set(selection.threadId);
    this.selectedMessageId.set(selection.messageId);
    this.mobileReader.set(true);
    for (const message of this.selectedThread()?.Mails ?? []) {
      if (!message.readIndicator)
        this.onAction({ action: 'read', message, threadId: selection.threadId });
    }
  }

  async compose(message: SecureMessage | null = null) {
    if (!(await this.discardDraft())) return;
    this.replyTo.set(message);
    this.composing.set(true);
    this.mobileReader.set(true);
  }

  async closeMobileReader() {
    if (await this.discardDraft()) this.mobileReader.set(false);
  }

  send(draft: MessageDraft) {
    if (this.sending()) return;
    const message = this.replyTo();
    const threadId = this.selectedThreadId();
    if (message && threadId === null) return;
    this.sending.set(true);
    this.service
      .send(draft, message && threadId !== null ? { message, threadId } : undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.sending.set(false);
          this.draftDirty.set(false);
          this.composing.set(false);
          this.replyTo.set(null);
          this.mobileReader.set(false);
          this.toast.success(MESSAGING.feedback.sent);
          this.load();
        },
        error: () => {
          this.sending.set(false);
          this.toast.error(MESSAGING.feedback.sendFailed);
        }
      });
  }

  onAction({ action, message, threadId }: MessageActionEvent) {
    const id = message.portalMessagePkId;
    if (this.pendingActions().includes(id)) return;
    const mailbox = this.mailbox();
    const archived = mailbox !== 'Archive';
    const request =
      action === 'archive'
        ? this.service.archive(threadId, archived)
        : action === 'favorite'
          ? this.service.favorite(id, !message.favouriteIndicator)
          : this.service.markRead(id, action === 'read');
    this.pendingActions.update(ids => [...ids, id]);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.pendingActions.update(ids => ids.filter(value => value !== id));
        if (this.mailbox() !== mailbox) return;
        this.groups.update(groups =>
          groups
            .map(group => ({
              ...group,
              Threads: group.Threads.filter(
                thread => action !== 'archive' || thread.ThreadId !== threadId
              ).map(thread => ({
                ...thread,
                Mails: thread.Mails.map(mail =>
                  mail.portalMessagePkId !== id
                    ? mail
                    : {
                        ...mail,
                        readIndicator:
                          action === 'read' || action === 'unread'
                            ? action === 'read'
                            : mail.readIndicator,
                        favouriteIndicator:
                          action === 'favorite' ? !mail.favouriteIndicator : mail.favouriteIndicator
                      }
                )
              }))
            }))
            .filter(group => group.Threads.length)
        );
        if (action === 'archive') {
          this.selectedThreadId.set(null);
          this.mobileReader.set(false);
          this.toast.success(archived ? MESSAGING.feedback.archived : MESSAGING.feedback.restored);
        }
      },
      error: () => {
        this.pendingActions.update(ids => ids.filter(value => value !== id));
        this.toast.error(MESSAGING.feedback.actionFailed);
      }
    });
  }

  regarding(message: SecureMessage): string {
    return (
      (message.relatedPatientPkId
        ? this.patients().find(option => option.id === message.relatedPatientPkId)?.label
        : this.facilities().find(option => option.id === message.relatedFaciltyPkId)?.label) ??
      MESSAGING.content.unavailableAssociation
    );
  }

  groupLabel(key: string): string {
    if (this.grouping() !== 'Regarding') return key;
    const [id, type] = key.split('_');
    return (
      (type === 'Patient' ? this.patients() : this.facilities()).find(
        option => option.id === Number(id)
      )?.label ?? key
    );
  }

  private dateRange(): [number, number] | null {
    const filter = this.dateFilter();
    if (!filter) return null;
    const start = new Date();
    const end = new Date();
    if (filter === 'Custom') {
      if (!this.dateStart() || !this.dateEnd()) return null;
      return [
        new Date(this.dateStart() + 'T00:00:00').getTime(),
        new Date(this.dateEnd() + 'T23:59:59.999').getTime()
      ];
    }
    if (filter === 'Yesterday') {
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
    } else if (filter === 'Last Week') {
      start.setDate(start.getDate() - start.getDay() - 7);
      end.setTime(start.getTime());
      end.setDate(end.getDate() + 6);
    } else {
      start.setMonth(start.getMonth() - 1, 1);
      end.setDate(0);
    }
    return [start.setHours(0, 0, 0, 0), end.setHours(23, 59, 59, 999)];
  }

  async back() {
    await this.router.navigate(['/home/dashboard']);
  }
  async canNavigateOut(): Promise<boolean> {
    if (this.sending()) return false;
    return (
      !this.draftDirty() ||
      this.alert.confirm(MESSAGING.feedback.exitConfirmation, {
        heading: MESSAGING.content.confirmation,
        showIcon: true,
        alertIcon: 'error',
        firstButton: MESSAGING.content.cancel,
        secondButton: MESSAGING.content.proceed
      })
    );
  }
  beforeUnload(event: BeforeUnloadEvent) {
    if (this.draftDirty() || this.sending()) event.preventDefault();
  }
  async discardDraft(): Promise<boolean> {
    if (!(await this.canNavigateOut())) return false;
    this.composing.set(false);
    this.draftDirty.set(false);
    this.replyTo.set(null);
    return true;
  }
}
