import { Routes } from '@angular/router';
import { roleGuard } from '@/core/auth/role.guard';

export const CR_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@/features/change-requests/feature-cr-list/cr-list.component').then((m) => m.CrListComponent),
  },
  {
    path: 'new',
    canActivate: [roleGuard(['UserAdmin', 'User'])],
    loadComponent: () =>
      import('@/features/change-requests/feature-cr-form/cr-form.component').then((m) => m.CrFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('@/features/change-requests/feature-cr-detail/cr-detail.component').then((m) => m.CrDetailComponent),
  },
];
