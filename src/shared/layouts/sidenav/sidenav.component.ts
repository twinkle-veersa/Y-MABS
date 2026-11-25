import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Nav } from '@shared/models';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-sidenav',
  imports: [RouterLink, RouterLinkActive, NgOptimizedImage],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidenavComponent {
  navs = input.required<Nav[]>();
}
