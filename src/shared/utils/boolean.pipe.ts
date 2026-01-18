import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'booleanVal' })
export class BooleanPipe implements PipeTransform {
  transform(value: string | boolean): 'Yes' | 'No' {
    return value ? 'Yes' : 'No';
  }
}
