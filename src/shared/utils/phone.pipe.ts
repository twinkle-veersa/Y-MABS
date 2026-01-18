import { Pipe, PipeTransform } from '@angular/core';
import { formatPhone } from './utility.functions';

@Pipe({ name: 'formatPhone' })
export class PhonePipe implements PipeTransform {
  transform(value: string): unknown {
    return formatPhone(value);
  }
}
