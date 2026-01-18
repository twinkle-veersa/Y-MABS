import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { FieldBaseComponent } from '../field-base.component';
import { ErrorMsgComponent } from '../error-msg/error-msg.component';
import { InputLabelComponent } from '../input-label/input-label.component';

@Component({
  selector: 'app-radio',
  templateUrl: './radio.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ErrorMsgComponent, InputLabelComponent]
})
export class RadioComponent extends FieldBaseComponent {}
