import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-toggle',
  templateUrl: './toggle.component.html',
  styleUrl: './toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleComponent {
  toggleChecked = input<boolean>();
  toggleDisabled = input<boolean>(true);
}
