import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-icon',

  template: `
    <svg
      [attr.height]="height()"
      [attr.width]="width()"
      [style.color]="color()"
      [style.fill]="fill()">
      <use attr.xlink:href="sprite.svg#{{ icon() }}"></use>
    </svg>
  `,
  styleUrl: './icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconComponent {
  readonly icon = input.required<string>();
  readonly height = input<string>('1em');
  readonly width = input<string>('1em');
  readonly color = input<string>('currentColor');
  readonly fill = input<string>('currentColor');
}
