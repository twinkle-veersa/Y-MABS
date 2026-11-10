import { Routes } from '@angular/router';
import { authGuard, loginGuard, firstTimeLoginGuard } from '@shared/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () => import('./pages/auth/login/login.component').then(c => c.LoginComponent)
  },
  {
    path: 'auth',
    canActivateChild: [loginGuard],
    loadComponent: () => import('./pages/auth/auth.component').then(c => c.AuthComponent),
    children: [
      { path: '', redirectTo: '/login', pathMatch: 'full' },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/auth/register/register.component').then(c => c.RegisterComponent)
      },
      {
        path: 'forgot-username',
        loadComponent: () =>
          import('./pages/auth/forgot-username/forgot-username.component').then(
            c => c.ForgotUsernameComponent
          )
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./pages/auth/forgot-password/forgot-password.component').then(
            c => c.ForgotPasswordComponent
          )
      },
      {
        path: 'logout',
        loadComponent: () =>
          import('./pages/auth/logout/logout.component').then(c => c.LogoutComponent)
      }
    ]
  },
  {
    path: 'first-time-login',
    canActivate: [firstTimeLoginGuard],
    loadComponent: () =>
      import('./pages/auth/first-time-login/first-time-login.component').then(
        c => c.FirstTimeLoginComponent
      )
  },
  {
    path: 'reset-password',
    canActivate: [firstTimeLoginGuard],
    loadComponent: () =>
      import('./pages/auth/forgot-password/forgot-password.component').then(
        c => c.ForgotPasswordComponent
      )
  },
  {
    path: 'registration/create-password/:uuid',
    loadComponent: () =>
      import('./pages/auth/forgot-password/forgot-password.component').then(
        c => c.ForgotPasswordComponent
      )
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(c => c.HomeComponent),
    canActivateChild: [authGuard],
    data: { test: 'data' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/home/dashboard/dashboard.component').then(c => c.DashboardComponent)
      },
      {
        path: 'enrollment',
        canDeactivate: [(component: ComponentCanDeactivate) => component?.canNavigateOut()],
        loadComponent: () =>
          import('./pages/home/enrollment/enrollment.component').then(c => c.EnrollmentComponent)
      },
      {
        path: 'my-patients',
        loadComponent: () =>
          import('./pages/home/my-patients/my-patients.component').then(c => c.MyPatientsComponent)
      },
      {
        path: 'my-patients/:id',
        loadComponent: () =>
          import('./pages/home/patients-detail/patients-detail.component').then(
            c => c.PatientsDetailComponent
          )
      },
      {
        path: 'tools',
        loadComponent: () =>
          import('./pages/home/tools/tools.component').then(c => c.ToolsComponent)
      },
      {
        path: 'settings',
        canDeactivate: [(component: ComponentCanDeactivate) => component?.canNavigateOut()],
        loadComponent: () =>
          import('./pages/home/settings/settings.component').then(c => c.SettingsComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile.component').then(c => c.ProfileComponent),
        data: { noSidebar: true }
      }
    ]
  },
  {
    path: 'onredirectionfromdocusign',
    loadComponent: () =>
      import('./pages/redirect-docusign/redirect-docusign.component').then(
        c => c.RedirectDocusignComponent
      ),
    data: { noSidebar: true }
  },
  {
    path: 'splash',
    loadComponent: () => import('./pages/splash/splash.component').then(c => c.SplashComponent)
  },
  {
    path: 'under-construction',
    loadComponent: () =>
      import('./pages/error/under-construction/under-construction.component').then(
        c => c.UnderConstructionComponent
      )
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./pages/error/not-found/not-found.component').then(c => c.NotFoundComponent)
  },
  { path: '**', redirectTo: 'not-found' }
];

interface ComponentCanDeactivate {
  canNavigateOut: () => boolean;
}
