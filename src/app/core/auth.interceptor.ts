import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService, API } from './api';
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService); const t = auth.token;
  const r = t && req.url.startsWith(API) && !req.url.includes('/api/auth/') ? req.clone({ setHeaders: { Authorization: `Bearer ${t}` } }) : req;
  return next(r).pipe(catchError((e: HttpErrorResponse) => { if (e.status === 401 && t) auth.logout(); return throwError(() => e); }));
};
