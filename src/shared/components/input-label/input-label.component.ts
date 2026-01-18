import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldConfig } from '@shared/models';
import { RequiredComponent } from '../required.component';

@Component({
  selector: 'app-input-label',
  imports: [RequiredComponent],
  templateUrl: './input-label.component.html',
  styleUrl: './input-label.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputLabelComponent {
  field = input.required<FieldConfig>();
  isRequired = input<boolean>(false);
}
