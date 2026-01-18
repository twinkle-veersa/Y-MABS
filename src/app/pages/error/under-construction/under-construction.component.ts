import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FullpageAlertsComponent } from '@shared/layouts/fullpage-alerts/fullpage-alerts.component';

@Component({
  selector: 'app-under-construction',
  imports: [FullpageAlertsComponent],
  templateUrl: './under-construction.component.html',
  styleUrl: './under-construction.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnderConstructionComponent {}
