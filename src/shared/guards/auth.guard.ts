import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from '@shared/services/api.service';

function createGuard(
  conditionFn: (api: ApiService) => boolean,
  redirectPath: string
): CanActivateFn {
  return () => {
    const api = inject(ApiService);
    const router = inject(Router);
    if (conditionFn(api)) {
      router.navigate([redirectPath]);
      return false;
    }
    return true;
  };
}

export const authGuard = createGuard(api => !api.isLoggedIn(), '/login');

export const loginGuard = createGuard(api => api.isLoggedIn(), '/home');

export const firstTimeLoginGuard = createGuard(api => !api.isFirstTimeLoginFlow(), '/login');
