import { HttpErrorResponse } from '@angular/common/http';

export const isNetworkError = (error: unknown): boolean =>
  error instanceof HttpErrorResponse && error.status === 0;
