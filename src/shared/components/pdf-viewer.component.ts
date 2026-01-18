import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

@Component({
  standalone: true,
  selector: 'app-pdf-viewer',
  imports: [NgxExtendedPdfViewerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ngx-extended-pdf-viewer
    height="auto"
    [src]="pdfSrc()"
    [theme]="theme()"
    [backgroundColor]="theme() === 'dark' ? '#333' : '#ddd'"
    [sidebarVisible]="false" />`,
  styles: `
    :host {
      display: flex;
    }
    ngx-extended-pdf-viewer {
      flex: auto;
    }
  `
})
export class PdfViewerComponent {
  sidebarVisible = input<boolean>(false);
  theme = input<'light' | 'dark'>('light');
  readonly pdfSrc = input.required<string | ArrayBuffer | Blob | Uint8Array | URL>();
}
