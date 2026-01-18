import { Component, input, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig } from '@shared/models';
import { UtilityService } from '@shared/services/utility.service';

@Component({
  template: ``,
  host: { class: 'field-wrap' },
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export abstract class FieldBaseComponent implements OnInit {
  private util = inject(UtilityService);
  readonly field = input.required<FieldConfig>();
  readonly group = input.required<FormGroup>();

  get control(): FormControl {
    return this.group().get(this.field().name) as FormControl;
  }

  get isRequired(): boolean {
    return this.util.isRequired(this.control);
  }

  ngOnInit(): void {
    if (this.field().value) this.control.setValue(this.field().value);
  }
}
