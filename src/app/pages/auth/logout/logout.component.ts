import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BASE } from '@constants/base';
import { FullpageAlertsComponent } from '@shared/layouts/fullpage-alerts/fullpage-alerts.component';

@Component({
  selector: 'app-logout',
  imports: [FullpageAlertsComponent, RouterLink],
  template: `
    <app-fullpage-alerts [title]="content.title">
      <button [routerLink]="['/login']">Re-Login</button>
    </app-fullpage-alerts>
  `,
  styleUrl: './logout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoutComponent {
  readonly content = BASE.logout;
}
