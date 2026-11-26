import { Directive, inject, input } from '@angular/core';
import { NgControl } from '@angular/forms';

export const VAL_TYPES = ['charOnly', 'numberOnly', 'alphaNum', 'phone', 'taxId'] as const;
export type ValType = (typeof VAL_TYPES)[number];

@Directive({
  selector: '[appFormatValue]',
  host: { '(input)': 'onInput($event)' }
})
export class InputDirective {
  private el = inject(NgControl);

  readonly valType = input<ValType | null>();

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target?.value ?? '';
    const valType = this.valType();
    if (!valType) return;

    let formattedValue = value;
    if (valType === 'charOnly') {
      formattedValue = value.replace(/[^A-Za-z ]/g, '');
    } else if (valType === 'numberOnly') {
      formattedValue = value.replace(/[^0-9]/g, '');
    } else if (valType === 'alphaNum') {
      formattedValue = value.replace(/[^a-zA-Z0-9 ,\-/.&()]/g, '');
    } else if (valType === 'phone') {
      formattedValue = this.formatPhone(value);
    } else if (valType === 'taxId') {
      formattedValue = this.formatTaxId(value);
    }

    if (formattedValue !== value) {
      this.el.control?.patchValue(formattedValue, { emitEvent: false });
      target.value = formattedValue;
    }
  }

  private formatPhone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (!digits.length) return '';
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  private formatTaxId(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 9);
    if (!digits.length) return '';
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  }
}
