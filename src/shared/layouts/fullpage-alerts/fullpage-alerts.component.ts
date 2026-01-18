import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-fullpage-alerts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './fullpage-alerts.component.scss',
  template: ` <div class="container">
    <div class="content">
      <h2 [innerHTML]="title()"></h2>
      <p [innerHTML]="content()"></p>
      <ng-content></ng-content>
    </div>
  </div>`
})
export class FullpageAlertsComponent {
  title = input<string>();
  content = input<string>();
}
