import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SidenavComponent } from '@shared/layouts/sidenav/sidenav.component';
import { DataService } from '@shared/services/data.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { NAVIGATION } from '@constants/navigation';
import { filter } from 'rxjs';
import { ApiService } from '@shared/services/api.service';

@Component({
  selector: 'app-home',
  styleUrl: `./home.component.scss`,
  templateUrl: './home.component.html',
  providers: [DataService],
  imports: [RouterOutlet, SidenavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  readonly nav = NAVIGATION;
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  routerEvent = toSignal(inject(Router).events.pipe(filter(e => e instanceof NavigationEnd)));
  isSidebarDisabled = computed(
    () => this.routerEvent() && !!(this.route.snapshot.firstChild?.data as RouteData).noSidebar
  );
  ngOnInit(): void {
    this.api.getNewToken();
    const redirectTo = this.api.isFirstTimeLoginFlow();
    if (redirectTo) this.router.navigate([`/${redirectTo}`]);
    if (this.api.token() && !sessionStorage.getItem('token')) {
      this.api.clearLogin();
      this.router.navigateByUrl('/login');
    }
  }
}

interface RouteData {
  noSidebar: boolean;
}
