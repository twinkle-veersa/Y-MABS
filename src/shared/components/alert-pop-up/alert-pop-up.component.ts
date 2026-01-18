import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-alert-pop-up',
  imports: [IconComponent],
  templateUrl: './alert-pop-up.component.html',
  styleUrl: './alert-pop-up.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertPopUpComponent {
  message = input<string>('Are you sure you want to proceed?');
  config = input<AlertConfig>(DEFAULT);
  confirmation = output<boolean>();

  close() {
    this.confirmation.emit(false);
  }
}

const DEFAULT: AlertConfig = {
  heading: 'Confirmation',
  showIcon: true,
  alertIcon: 'error',
  firstButton: 'No',
  secondButton: 'Yes'
};
export interface AlertConfig {
  heading: string;
  showIcon: boolean;
  alertIcon: string;
  firstButton: string;
  secondButton: string;
}
