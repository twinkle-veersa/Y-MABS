import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-icon',

  template: `
    <svg>
      // SVG elements don't have properties, therefore attribute binding is needed //
      https://stackoverflow.com/a/35082700
      <use attr.xlink:href="sprite.svg#{{ icon() }}"></use>
    </svg>
  `,
  styleUrl: './icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconComponent {
  readonly icon = input.required<string>();
}
