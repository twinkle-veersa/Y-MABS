import { MESSAGE_FIELDS, MESSAGING } from '@constants/messages';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { SelectComponent } from '@shared/components/select/select.component';
import { DatepickerComponent } from '@shared/components/datepicker/datepicker.component';
import { FieldConfig } from '@shared/models';
import { DatePipe } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';
import {
  DateFilter,
  Mailbox,
  MessageActionEvent,
  MessageGroup,
  MessageGrouping,
  messageText,
  SecureMessage
} from '../messages.model';

@Component({
  selector: 'app-message-list',
  imports: [DatePipe, IconComponent, SelectComponent, DatepickerComponent],
  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.sidebar-closed]': '!panelOpen()' }
})
export class MessageListComponent {
  readonly content = MESSAGING.content;
  groups = input.required<MessageGroup[]>();
  mailbox = input.required<Mailbox>();
  grouping = input.required<MessageGrouping>();
  selectedThreadId = input<number | null>(null);
  groupLabels = input<Record<string, string>>({});
  loading = input(false);
  error = input('');
  endOfData = input(false);
  favoriteOnly = input(false);
  dateFilter = input<DateFilter>('');
  dateStart = input('');
  dateEnd = input('');
  pendingActions = input<number[]>([]);
  mailboxChange = output<Mailbox>();
  groupingChange = output<MessageGrouping>();
  selectThread = output<{ threadId: number; messageId: number }>();
  favoriteChange = output<boolean>();
  dateFilterChange = output<DateFilter>();
  dateStartChange = output<string>();
  dateEndChange = output<string>();
  loadMore = output<void>();
  retry = output<void>();
  messageAction = output<MessageActionEvent>();
  sidebarChange = output<boolean>();
  panelOpen = signal(true);
  collapsedGroups = signal<string[]>([]);
  expandedThreads = signal<number[]>([]);
  readonly mailboxes = MESSAGING.mailboxes;
  readonly mailboxIcons = MESSAGING.mailboxIcons;
  readonly fields = MESSAGE_FIELDS;
  readonly filters = new FormGroup({
    dateFilter: new FormControl<DateFilter>('', { nonNullable: true }),
    grouping: new FormControl<MessageGrouping>('Regarding', { nonNullable: true }),
    dateStart: new FormControl<Date | null>(null),
    dateEnd: new FormControl<Date | null>(null)
  });
  private readonly filterValues = toSignal(this.filters.valueChanges);
  readonly startField = computed<FieldConfig>(() => ({
    ...MESSAGE_FIELDS.dateStart,
    validation: { maxDate: this.parseDate(this.dateEnd()) ?? undefined }
  }));
  readonly endField = computed<FieldConfig>(() => ({
    ...MESSAGE_FIELDS.dateEnd,
    validation: { minDate: this.parseDate(this.dateStart()) ?? undefined }
  }));
  readonly text = messageText;

  constructor() {
    effect(() => {
      // Restore the accepted filters after an edit, including a declined draft-discard prompt.
      this.filterValues();
      this.filters.setValue(
        {
          dateFilter: this.dateFilter(),
          grouping: this.grouping(),
          dateStart: this.parseDate(this.dateStart()),
          dateEnd: this.parseDate(this.dateEnd())
        },
        { emitEvent: false }
      );
    });
    this.filters.controls.dateFilter.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(value => this.dateFilterChange.emit(value));
    this.filters.controls.grouping.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(value => this.groupingChange.emit(value));
    this.filters.controls.dateStart.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(value => this.dateStartChange.emit(this.dateValue(value)));
    this.filters.controls.dateEnd.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(value => this.dateEndChange.emit(this.dateValue(value)));
  }

  private parseDate(value: string): Date | null {
    return value ? new Date(value + 'T00:00:00') : null;
  }
  private dateValue(value: Date | null): string {
    return value
      ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
      : '';
  }

  toggleGroup(key: string) {
    this.collapsedGroups.update(keys =>
      keys.includes(key) ? keys.filter(value => value !== key) : [...keys, key]
    );
  }
  selectMessage(threadId: number, message: SecureMessage) {
    this.selectThread.emit({ threadId, messageId: message.portalMessagePkId });
  }
  action(action: MessageActionEvent['action'], message: SecureMessage, threadId: number) {
    this.messageAction.emit({ action, message, threadId });
  }
  toggleSidebar() {
    this.panelOpen.update(open => !open);
    this.sidebarChange.emit(this.panelOpen());
  }
  toggleThread(id: number) {
    this.expandedThreads.update(ids =>
      ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id]
    );
  }
  onScroll(event: Event) {
    const element = event.target as HTMLElement;
    if (
      element.scrollHeight - element.scrollTop - element.clientHeight < MESSAGING.scrollThreshold &&
      !this.loading() &&
      !this.error()
    )
      this.loadMore.emit();
  }
}
