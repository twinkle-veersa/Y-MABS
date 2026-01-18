import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-error-msg',
  templateUrl: './error-msg.component.html',
  styleUrl: './error-msg.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorMsgComponent {
  readonly label = input<string>();
  readonly control = input.required<FormControl>();
  readonly errMsg = input<string>(); // For custom error msg
}
