import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BASE } from '@constants/base';

@Component({
  selector: 'app-footer',
  styleUrl: './footer.component.scss',
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  readonly content = BASE.footer;
}
