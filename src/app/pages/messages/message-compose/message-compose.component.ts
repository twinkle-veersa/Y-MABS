import {
  MESSAGE_CATEGORIES,
  MESSAGE_EDITOR_FIELDS,
  MESSAGE_EDITOR_TOOLS,
  MESSAGE_FIELDS,
  MESSAGING
} from '@constants/messages';
import type Quill from 'quill';
import { FileUploadComponent } from '@shared/components/file-upload/file-upload.component';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  ElementRef,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { ToastrService } from 'ngx-toastr';
import { SelectComponent } from '@shared/components/select/select.component';
import { InputComponent } from '@shared/components/input/input.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { FieldConfig } from '@shared/models';
import { convertToBase64 } from '@shared/utils/utility.functions';
import {
  MessageAttachment,
  MessageDraft,
  messageText,
  RegardingOption,
  SecureMessage
} from '../messages.model';

function requiredText(control: AbstractControl) {
  return messageText(String(control.value ?? '')).length ? null : { required: true };
}

@Component({
  selector: 'app-message-compose',
  imports: [
    ReactiveFormsModule,
    EditorModule,
    SelectComponent,
    InputComponent,
    IconComponent,
    FileUploadComponent
  ],
  templateUrl: './message-compose.component.html',
  styleUrl: './message-compose.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageComposeComponent {
  readonly content = MESSAGING.content;
  reply = input<SecureMessage | null>(null);
  patients = input<RegardingOption[]>([]);
  facilities = input<RegardingOption[]>([]);
  patientsLoading = input(false);
  facilitiesLoading = input(false);
  optionsError = input('');
  sending = input(false);
  dirtyChange = output<boolean>();
  retryOptions = output<void>();
  cancelCompose = output<void>();
  sendMessage = output<MessageDraft>();
  private toast = inject(ToastrService);
  readonly files = signal<{ file: File; attachment: MessageAttachment }[]>([]);
  readonly converting = signal(false);
  readonly busy = computed(() => this.sending() || this.converting());
  readonly attempted = signal(false);
  readonly dragging = signal(false);
  readonly attachmentError = signal('');
  readonly form = new FormGroup({
    regarding: new FormControl('', { nonNullable: true, validators: Validators.required }),
    association: new FormControl<number | null>(null, Validators.required),
    category: new FormControl<number | null>(null, Validators.required),
    subject: new FormControl('', { nonNullable: true, validators: requiredText }),
    body: new FormControl('', { nonNullable: true, validators: requiredText }),
    highPriority: new FormControl(0, { nonNullable: true })
  });
  readonly value = toSignal(this.form.valueChanges, { initialValue: this.form.value });
  readonly status = toSignal(this.form.statusChanges, { initialValue: this.form.status });
  readonly fields = MESSAGE_FIELDS;
  readonly attachmentMimeType = MESSAGING.attachmentMimeType;
  readonly editorFields = MESSAGE_EDITOR_FIELDS;
  readonly editorTools = MESSAGE_EDITOR_TOOLS;
  readonly selectionLength = signal(0);
  private readonly fileUpload = viewChild<FileUploadComponent, ElementRef<HTMLElement>>(
    FileUploadComponent,
    {
      read: ElementRef
    }
  );
  readonly editorForm = new FormGroup({
    font: new FormControl('', { nonNullable: true }),
    size: new FormControl('', { nonNullable: true }),
    color: new FormControl('', { nonNullable: true }),
    background: new FormControl('', { nonNullable: true }),
    align: new FormControl('', { nonNullable: true })
  });
  private editor?: Quill;
  private editorSelection: { index: number; length: number } | null = null;
  readonly associationOptions = computed(() =>
    this.value().regarding === 'Patient' ? this.patients() : this.facilities()
  );
  readonly associationField = computed<FieldConfig>(() => ({
    ...(this.value().regarding === 'Patient' ? MESSAGE_FIELDS.patient : MESSAGE_FIELDS.facility),
    options: this.associationOptions().map(option => ({ value: option.id, option: option.label }))
  }));
  readonly optionsLoading = computed(() =>
    this.value().regarding === 'Patient' ? this.patientsLoading() : this.facilitiesLoading()
  );
  readonly invalidAssociation = computed(
    () =>
      !this.reply() &&
      !this.associationOptions().some(option => option.id === this.value().association)
  );
  readonly hasChanges = computed(() => {
    const value = this.value();
    return !!(
      value.body ||
      this.files().length ||
      this.converting() ||
      (!this.reply() &&
        (value.regarding ||
          value.association ||
          value.category ||
          value.subject ||
          value.highPriority))
    );
  });
  readonly formats = MESSAGING.editorFormats;

  initializeEditor(event: { editor: unknown }) {
    this.editor = event.editor as Quill;
  }

  rememberSelection(event: { range?: unknown }) {
    const range = event.range as { index: number; length: number } | null;
    if (!range || !this.editor) return;
    this.editorSelection = range;
    this.selectionLength.set(range.length);
    const formats = this.editor.getFormat(range);
    for (const [format, control] of Object.entries(this.editorForm.controls)) {
      const value: unknown = formats[format];
      control.setValue(typeof value === 'string' ? value : '', { emitEvent: false });
    }
  }

  togglePriority() {
    if (!this.sending())
      this.form.controls.highPriority.setValue(this.form.controls.highPriority.value === 1 ? 0 : 1);
  }

  openAttachments() {
    if (!this.busy())
      this.fileUpload()
        ?.nativeElement.querySelector<HTMLInputElement>('input[type="file"]')
        ?.click();
  }

  async copySelection() {
    if (!this.editor || !this.editorSelection?.length) return;
    try {
      await navigator.clipboard.writeText(
        this.editor.getText(this.editorSelection.index, this.editorSelection.length)
      );
    } catch {
      this.toast.error(MESSAGING.feedback.copyFailed);
    }
  }

  clearFormatting() {
    if (!this.editor || !this.editorSelection || this.sending()) return;
    this.editor.removeFormat(this.editorSelection.index, this.editorSelection.length, 'user');
  }

  constructor() {
    for (const [format, control] of Object.entries(this.editorForm.controls)) {
      control.valueChanges.pipe(takeUntilDestroyed()).subscribe(value => {
        if (!this.editor || this.sending()) return;
        if (this.editorSelection)
          this.editor.setSelection(
            this.editorSelection.index,
            this.editorSelection.length,
            'silent'
          );
        this.editor.format(format, value || false, 'user');
      });
    }
    effect(() => {
      const reply = this.reply();
      for (const name of [
        'regarding',
        'association',
        'category',
        'subject',
        'highPriority'
      ] as const) {
        if (reply) this.form.controls[name].disable();
        else this.form.controls[name].enable();
      }
    });
    effect(() => this.dirtyChange.emit(this.hasChanges()));
    this.form.controls.regarding.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.form.controls.association.reset(null));
  }

  async drop(event: DragEvent) {
    event.preventDefault();
    this.dragging.set(false);
    await this.addFiles(Array.from(event.dataTransfer?.files ?? []));
  }

  dragOver(event: DragEvent) {
    event.preventDefault();
    if (!this.sending()) this.dragging.set(true);
  }

  async addFiles(files: File[]) {
    if (this.busy()) return;
    this.attachmentError.set('');
    const valid = files.filter(file => {
      if (file.type !== MESSAGING.attachmentMimeType && !/\.pdf$/i.test(file.name)) {
        this.attachmentError.set(MESSAGING.feedback.pdfOnly);
        return false;
      }
      if (file.size > MESSAGING.attachmentMaxBytes) {
        this.attachmentError.set(MESSAGING.feedback.fileTooLarge);
        return false;
      }
      return !this.files().some(
        existing =>
          existing.file.name === file.name &&
          existing.file.size === file.size &&
          existing.file.lastModified === file.lastModified
      );
    });
    if (!valid.length) return;
    this.converting.set(true);
    try {
      const converted = await Promise.all(
        valid.map(async file => ({
          file,
          attachment: {
            DocumentName: file.name.replace(/\.pdf$/i, ''),
            DocumentData: (await convertToBase64(file)).split(',')[1]
          }
        }))
      );
      this.files.update(current => [...current, ...converted]);
    } catch {
      this.attachmentError.set(MESSAGING.feedback.fileReadFailed);
    } finally {
      this.converting.set(false);
    }
  }

  removeFile(index: number) {
    if (!this.sending())
      this.files.update(files => files.filter((_, current) => current !== index));
  }

  submit() {
    this.attempted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid || this.busy() || this.invalidAssociation()) return;
    const value = this.form.getRawValue();
    if (!this.reply() && !MESSAGE_CATEGORIES.some(category => category.id === value.category)) {
      this.toast.error(MESSAGING.feedback.invalidCategory);
      return;
    }
    this.sendMessage.emit({
      subject: value.subject,
      body: value.body,
      category: value.category ?? 0,
      patientId: value.regarding === 'Patient' ? value.association : null,
      facilityId: value.regarding === 'Facility' ? value.association : null,
      highPriority: value.highPriority === 1,
      attachments: this.files().map(file => file.attachment)
    });
  }
}
