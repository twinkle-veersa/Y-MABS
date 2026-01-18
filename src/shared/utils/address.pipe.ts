import { Pipe, PipeTransform } from '@angular/core';
import { Address } from '@shared/components/accordion/accordion.component';

@Pipe({ name: 'formatAddress' })
export class AddressPipe implements PipeTransform {
  transform(addressObj: Address): string {
    const array = [
      addressObj?.Line1,
      addressObj?.Line2,
      addressObj?.City,
      addressObj?.State,
      addressObj?.Zipcode
    ];
    return array.filter(Boolean).join(', ');
  }
}
