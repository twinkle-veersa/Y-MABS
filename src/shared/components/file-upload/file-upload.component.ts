import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RequiredComponent } from '../required.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-file-upload',

  imports: [FormsModule, RequiredComponent],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadComponent {
  multiple = input<boolean>(false);
  isRequired = input<boolean>(false);
  label = input<string>('Attach files');
  buttonText = input<string>('Browse');
  fileTypes = input<string>('');
  disabled = input<boolean>(false);
  emitFiles = output<File[]>();

  existingFiles = input<File[]>([]);
  files = signal<File[]>([]);

  private toast = inject(ToastrService);

  constructor() {
    effect(() => {
      const existing = this.existingFiles();
      if (existing && existing.length > 0) {
        this.files.set([...existing]);
      }
    });
  }

  handleFileInput(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;

    const selectedFiles = Array.from(target.files);
    const validFiles = selectedFiles.filter(file => {
      const isPDF = this.fileTypes() === 'application/pdf' && file.type === this.fileTypes();
      const isWithinSizeLimit = file.size <= 10 * 1024 * 1024;

      if (!isPDF) {
        this.toast.error(`File "${file.name}" is not a PDF.`);
        return false;
      }
      if (!isWithinSizeLimit) {
        this.toast.error(`File "${file.name}" exceeds the 10 MB size limit.`);
        return false;
      }
      return true;
    });

    if (!this.multiple() && this.files().length > 0) {
      this.toast.error(
        'Multiple files are not allowed. Please remove the existing file before uploading a new one.'
      );
      return;
    }

    const updatedFiles = this.multiple() ? [...this.files(), ...validFiles] : validFiles;

    this.files.set(updatedFiles);
    this.emitFiles.emit(validFiles);

    target.value = '';
  }

  removeFile(index: number) {
    const updated = this.files().filter((_, i) => i !== index);
    this.files.set(updated);
    this.emitFiles.emit(updated);
  }
}
