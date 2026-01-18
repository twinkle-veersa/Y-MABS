import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Checks } from '@shared/utils/password-validations';
import { IconComponent } from '../icon/icon.component';
import { KeyValuePipe } from '@angular/common';

@Component({
  selector: 'app-password-checks',
  imports: [IconComponent, KeyValuePipe],
  templateUrl: './password-checks.component.html',
  styleUrl: './password-checks.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PasswordChecksComponent {
  readonly errors = input<string[]>([]);
  validations: Record<Checks, string> = {
    uppercase: 'At least 1 upper case character',
    lowercase: 'At least 1 lower case character',
    numeric: 'At least 1 numeric digit',
    symbol: '1 non-alphanumeric character between [!@#$%^&*]',
    minLength: 'Password must be more than 12 characters'
  };
}
