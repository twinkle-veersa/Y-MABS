import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BASE } from '@constants/base';
import { ApiService } from '@shared/services/api.service';

@Component({
  selector: 'app-footer',
  styleUrl: './footer.component.scss',
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  readonly content = BASE.footer;
  readonly api = inject(ApiService);
}
