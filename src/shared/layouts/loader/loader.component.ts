import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-loader',
  styleUrl: './loader.component.scss',
  templateUrl: './loader.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderComponent {
  loading = input<boolean>(true);
  overlay = input<boolean>(false);
}
