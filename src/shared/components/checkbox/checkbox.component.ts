import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FieldBaseComponent } from '../field-base.component';
import { ErrorMsgComponent } from '../error-msg/error-msg.component';
import { InputLabelComponent } from '../input-label/input-label.component';
import { SelectOptions } from '@shared/models';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ErrorMsgComponent, InputLabelComponent]
})
export class CheckboxComponent extends FieldBaseComponent {
  private cdr = inject(ChangeDetectorRef);

  linkedControl(name: string): FormControl {
    return this.group().get(name) as FormControl;
  }

  onCheckboxChange(event: Event, item: SelectOptions): void {
    const checkbox = event.target as HTMLInputElement;
    const control = this.group().get(this.field().name) as FormControl<unknown[]>;
    if (control !== undefined) {
      const checkedItems = control.value ?? [];
      control.setValue(
        checkbox.checked
          ? [...checkedItems, item.value]
          : checkedItems.filter(x => x !== item.value)
      );
    }

    if (item.inputName) {
      const inputCtrl = this.group().get(item.inputName);
      if (inputCtrl) {
        if (checkbox.checked) {
          inputCtrl.setValidators(Validators.required);
        } else {
          inputCtrl.clearValidators();
          inputCtrl.reset('');
        }
        inputCtrl.updateValueAndValidity();
      }
    }

    this.cdr.markForCheck();
  }
}
