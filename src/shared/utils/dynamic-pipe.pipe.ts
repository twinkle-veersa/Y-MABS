import { inject, Injector, Pipe, PipeTransform, ProviderToken } from '@angular/core';
import { DecimalPipe, TitleCasePipe, DatePipe } from '@angular/common';
import { AdressPipe } from './address.pipe';
import { PhonePipe } from './phone.pipe';
import { BooleanPipe } from './boolean.pipe';

export const pipeNames = ['titlecase', 'number', 'date', 'address', 'phone', 'boolean'] as const;
export type PipeName = (typeof pipeNames)[number];
const pipesMap = {
  titlecase: TitleCasePipe,
  number: DecimalPipe,
  date: DatePipe,
  address: AdressPipe,
  boolean: BooleanPipe,
  phone: PhonePipe
} as const;

@Pipe({ name: 'dynamicPipe' })
export class DynamicPipe implements PipeTransform {
  private injector = inject(Injector);

  transform(value: unknown, pipeToken: PipeName, pipeArgs?: string[]): unknown {
    if (pipeToken) {
      const pipeClass = pipesMap[pipeToken];
      const pipe = this.injector.get(pipeClass as ProviderToken<unknown>) as PipeTransform;
      return Array.isArray(pipeArgs)
        ? pipe.transform(value, ...pipeArgs)
        : pipe.transform(value, pipeArgs);
    } else {
      return value;
    }
  }
}
