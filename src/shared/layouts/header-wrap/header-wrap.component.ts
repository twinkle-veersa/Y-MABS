import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-header-wrap',
  templateUrl: './header-wrap.component.html',
  styleUrl: './header-wrap.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderWrapComponent {
  heading = input<string>();
  subheading = input<string>();
  noContentPadding = input<boolean>(false);
  bordered = input<boolean>(false);
  steps = input<{ complete: number; steps: number[] }>({
    complete: 0,
    steps: []
  });
}
