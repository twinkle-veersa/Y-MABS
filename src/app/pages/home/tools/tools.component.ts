import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HomeHeaderComponent } from '@shared/layouts/home-header/home-header.component';
import { HeaderWrapComponent } from '@shared/layouts/header-wrap/header-wrap.component';
import { Link, TOOLS } from '@constants/tools';
import { PopupComponent } from '@shared/components/popup/popup.component';
import { AlertService } from '@shared/services/alert.service';

@Component({
  selector: 'app-tools',
  imports: [HeaderWrapComponent, HomeHeaderComponent, PopupComponent],
  templateUrl: './tools.component.html',
  styleUrl: './tools.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolsComponent {
  readonly content = TOOLS;
  private alert = inject(AlertService);
  handlePopupButtonClick(link: Link) {
    if (link.pdfSrc) {
      const anchor = document.createElement('a');
      anchor.href = link.pdfSrc!;
      anchor.download = link.pdfSrc.split('/').pop() || 'download';
      anchor.click();
      link.popupOpen = false;
    }
  }
  navigateWithAlert(url: string) {
    this.alert.confirm(TOOLS.exitConfirmation).then(confirm => {
      if (confirm) window.open(url, '_blank');
    });
  }
}
