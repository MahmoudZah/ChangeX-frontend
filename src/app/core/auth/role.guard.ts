import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@/core/auth/auth.service';
import { Role } from '@/shared/util/constants';

export const roleGuard = (roles: Role[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const role = auth.user()?.role;
    return role && roles.includes(role) ? true : router.createUrlTree(['/dashboard']);
  };
};
