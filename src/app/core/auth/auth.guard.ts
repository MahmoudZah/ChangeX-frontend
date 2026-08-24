import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@/core/auth/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.validToken() ? true : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

export const anonymousGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.validToken() ? router.createUrlTree(['/dashboard']) : true;
};
