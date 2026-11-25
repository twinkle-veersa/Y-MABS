import { ChangeDetectionStrategy, Component, input, computed, output } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'app-file-upload-table',
  imports: [IconComponent],
  templateUrl: './file-upload-table.component.html',
  styleUrl: './file-upload-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadTableComponent {
  selectedFiles = input<AttachFile[]>();
  deleteFile = output<number>();
  files = computed(() => this.selectedFiles() ?? []);

  removeFile(i: number) {
    this.deleteFile.emit(i);
  }
}

export interface AttachFile {
  name: string;
  base64: Base64URLString;
}
