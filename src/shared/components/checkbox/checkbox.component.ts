import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FieldBaseComponent } from '../field-base.component';
import { ErrorMsgComponent } from '../error-msg/error-msg.component';
import { InputLabelComponent } from '../input-label/input-label.component';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ErrorMsgComponent, InputLabelComponent]
})
export class CheckboxComponent extends FieldBaseComponent {
  onCheckboxChange(event: Event, value: string | number): void {
    const checkbox = event.target as HTMLInputElement;
    const control = this.group().get(this.field().name) as FormControl<unknown[]>;
    if (control !== undefined) {
      const checkedItems = control.value ?? [];
      control.setValue(
        checkbox.checked ? [...checkedItems, value] : checkedItems.filter(x => x !== value)
      );
    }
  }
}
