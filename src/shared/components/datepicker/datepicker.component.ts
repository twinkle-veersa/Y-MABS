import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FieldBaseComponent } from '../field-base.component';
import { DatePickerModule } from 'primeng/datepicker';
import { ReactiveFormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { ErrorMsgComponent } from '../error-msg/error-msg.component';
import { InputLabelComponent } from '../input-label/input-label.component';

@Component({
  selector: 'app-datepicker',
  imports: [
    ReactiveFormsModule,
    DatePickerModule,
    ErrorMsgComponent,
    IconComponent,
    InputLabelComponent
  ],
  templateUrl: './datepicker.component.html',
  styleUrl: './datepicker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatepickerComponent extends FieldBaseComponent {
  defaultMinDate = new Date(1900, 0, 1); // 1 Jan 1900
}
