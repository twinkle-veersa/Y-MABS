import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';

import { FieldBaseComponent } from '../field-base.component';
import { ErrorMsgComponent } from '../error-msg/error-msg.component';
import { InputLabelComponent } from '../input-label/input-label.component';

@Component({
  selector: 'app-select',
  imports: [SelectModule, ReactiveFormsModule, ErrorMsgComponent, InputLabelComponent],
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectComponent extends FieldBaseComponent {}
