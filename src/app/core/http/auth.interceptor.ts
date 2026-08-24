import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '@/core/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.validToken();
  const request = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthenticationChallenge = Boolean(error.headers.get('www-authenticate'));
      if (
        error.status === 401 &&
        isAuthenticationChallenge &&
        !req.url.endsWith('/Auth/Login') &&
        auth.isAuthenticated()
      ) {
        const returnUrl = router.url.startsWith('/login') ? '/dashboard' : router.url;
        auth.logout();
        void router.navigate(['/login'], { queryParams: { returnUrl, expired: '1' } });
      }
      return throwError(() => error);
    }),
  );
};
