import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FieldBaseComponent } from '../field-base.component';

@Component({
  selector: 'app-line',
  templateUrl: './line.component.html',
  styleUrl: './line.component.scss',
  host: {
    class: 'line-field',
    '[style.margin-top]': 'field().marginTop || "0.75rem"',
    '[style.margin-bottom]': 'field().marginBottom || "0.75rem"'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineComponent extends FieldBaseComponent {}
