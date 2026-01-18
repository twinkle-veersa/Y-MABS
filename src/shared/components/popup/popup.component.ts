import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PdfViewerComponent } from '../pdf-viewer.component';
import { IconComponent } from '../icon/icon.component';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-popup',
  imports: [FormsModule, PdfViewerComponent, IconComponent, NgTemplateOutlet],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopupComponent {
  type = input<PopupType>('default');
  noContentPadding = input<boolean>(false);
  heading = input<string>('');
  content = input<string>('');
  pdfSrc = input<string>('');
  showIcon = input<boolean>(true);
  alertIcon = input<string>('error');
  buttons = input<{ index: number; label: string; action: string }[]>([]);
  isVisible = input<boolean>(false);
  closePopup = output<void>();
  buttonClick = output<string>();

  onClose() {
    this.closePopup.emit();
  }
  onButtonClick(action: string) {
    this.buttonClick.emit(action);
  }
}

export type PopupType = 'alert' | 'pdf' | 'custom' | 'default';
