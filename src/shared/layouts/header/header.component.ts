import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BASE } from '@constants/base';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ApiService } from '@shared/services/api.service';
import { HamburgerComponent } from '../hamburger/hamburger.component';
import { HAM_NAVIGATION } from '@constants/navigation';
import { UtilityService } from '@shared/services/utility.service';

@Component({
  selector: 'app-header',
  imports: [IconComponent, RouterLink, HamburgerComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  readonly content = BASE.header;
  readonly api = inject(ApiService);
  readonly util = inject(UtilityService);
  readonly nav = HAM_NAVIGATION;

  /** Logged-out / first-time flows share the auth header chrome */
  readonly isAuthLayout = computed(
    () => !this.api.isLoggedIn() || this.api.isFirstTimeLoginFlow() !== null
  );
}
