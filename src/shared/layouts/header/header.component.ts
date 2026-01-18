import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BASE } from '@constants/base';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ApiService } from '@shared/services/api.service';
import { HamburgerComponent } from '../hamburger/hamburger.component';
import { HAM_NAVIGATION } from '@constants/navigation';
import { UtilityService } from '@shared/services/utility.service';
@Component({
  selector: 'app-header',
  imports: [IconComponent, RouterLink, NgOptimizedImage, HamburgerComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  readonly content = BASE.header;
  api = inject(ApiService);
  nav = HAM_NAVIGATION;
  util = inject(UtilityService);
  readonly route = inject(ActivatedRoute);
  isFirstTimeLoginRoute(): boolean {
    const currentUrl = window.location.hash || this.route.snapshot.url.join('/');
    return currentUrl.includes('first-time-login') || currentUrl.includes('reset-password');
  }
}
