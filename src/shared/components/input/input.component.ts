import { Component, ChangeDetectionStrategy, computed, input, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldBaseComponent } from '../field-base.component';
import { ErrorMsgComponent } from '../error-msg/error-msg.component';
import { PasswordChecksComponent } from '../password-checks/password-checks.component';
import { InputDirective } from '@shared/utils/input.directive';
import { IconComponent } from '../icon/icon.component';
import { InputLabelComponent } from '../input-label/input-label.component';

@Component({
  selector: 'app-input',
  imports: [
    ReactiveFormsModule,
    PasswordChecksComponent,
    ErrorMsgComponent,
    InputDirective,
    IconComponent,
    InputLabelComponent
  ],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputComponent extends FieldBaseComponent {
  showPassword = signal<boolean>(false);
  /** When true, show validation even if the control is not yet touched (e.g. after submit). */
  readonly forceShowErrors = input(false);

  readonly showErrors = computed(() => this.forceShowErrors() || this.control.touched);
}
