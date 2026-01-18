import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from '@shared/services/api.service';

export const authGuard: CanActivateFn = () => {
  if (!inject(ApiService).isLoggedIn()) {
    inject(Router).navigate(['/login']);
    return false;
  }
  return true;
};

export const loginGuard: CanActivateFn = () => {
  if (inject(ApiService).isLoggedIn()) {
    inject(Router).navigate(['/home']);
    return false;
  }
  return true;
};

export const firstTimeLoginGuard: CanActivateFn = () => {
  if (!inject(ApiService).isFirstTimeLoginFlow()) {
    inject(Router).navigate(['/login']);
    return false;
  }
  return true;
};
