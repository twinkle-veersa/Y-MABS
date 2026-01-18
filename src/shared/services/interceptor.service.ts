import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ApiService, LOADER_DISABLED } from './api.service';
import { catchError, finalize, map, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastrService);
  const api = inject(ApiService);
  api.isLoading.set(!req.context.get(LOADER_DISABLED));
  const headers = {
    clientid: environment.clientId,
    programId: environment.programId
  };
  if (api.token() != null) Object.assign(headers, { authorization: `Bearer ${api.token()}` });
  req = req.clone({ url: req.url, setHeaders: { ...headers } });
  const handleError = (error: HttpErrorResponse) => {
    if (api.token() && (error.status === 401 || error.status === 403)) {
      api.handleLogout();
      if (toast.currentlyActive < 1) toast.error('Session Expired..!');
    }
    return throwError(() => new Error('Unknown Error', { cause: error }));
  };
  return next(req).pipe(
    map(event => event),
    catchError(handleError),
    finalize(() => api.isLoading.set(false))
  );
};
