import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-form-title',
  templateUrl: './form-title.component.html',
  styleUrl: './form-title.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormTitleComponent {
  title = input<string>();
  highlight = input<boolean>(false);
  subtitle = input<string>();
  emphasis = input<'high' | 'low'>('high');
  required = input<boolean>(true);
}
