import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';

import { NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BASE } from '@constants/base';
import { Nav } from '@shared/models';
import { IconComponent } from '../../components/icon/icon.component';
import { ApiService } from '@shared/services/api.service';

@Component({
  selector: 'app-hamburger',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent, NgOptimizedImage],
  templateUrl: './hamburger.component.html',
  styleUrl: './hamburger.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HamburgerComponent {
  api = inject(ApiService);
  readonly content = BASE.header;
  navs = input<Nav[]>();
  sidebarOpen = signal(false);

  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }
  logout() {
    this.api.logout();
    this.toggleSidebar();
  }
}
