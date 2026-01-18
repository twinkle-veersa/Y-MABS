import { AfterViewInit, Directive, inject, input, DestroyRef } from '@angular/core';
import { NgControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export const VAL_TYPES = ['charOnly', 'numberOnly', 'alphaNum', 'phone'] as const;
export type ValType = (typeof VAL_TYPES)[number];

@Directive({
  selector: '[appFormatValue]',
  host: { '(input)': 'onInput($event)' }
})
export class InputDirective implements AfterViewInit {
  private el = inject(NgControl);
  private destroyRef = inject(DestroyRef);

  readonly valType = input<ValType | null>();

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target?.value ?? '';
    if (value.length && this.valType() !== null) {
      const valType = this.valType();
      let formattedValue = value;
      if (valType === 'charOnly') {
        formattedValue = value.replace(/[^A-Za-z ]/g, '');
      } else if (valType === 'numberOnly') {
        formattedValue = value.replace(/[^0-9]/g, '');
      } else if (valType === 'alphaNum') {
        formattedValue = value.replace(/[^a-zA-Z0-9 ,\-/.&()]/g, '');
      } else if (valType === 'phone') {
        formattedValue = value
          .replace(/\D/g, '')
          .replace(/^(\d{3})(\d{1,3})(\d{0,4})$/, '($1) $2-$3');
      }
      if (formattedValue !== value) {
        this.el.control?.patchValue(formattedValue, { emitEvent: false });
        target.value = formattedValue;
      }
    }
  }
  ngAfterViewInit(): void {
    if (this.valType() === 'phone') {
      this.el.control?.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((v: string) =>
          v && v.slice(-1) === '-' ? this.el.control?.setValue(v.slice(0, -1)) : null
        );
    }
  }
}
