import { Routes } from '@angular/router';

export const USERS_ROUTES: Routes = [
  {
    path: 'new',
    loadComponent: () =>
      import('@/features/users/feature-user-form/user-form.component').then((m) => m.UserFormComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('@/features/users/feature-user-form/user-form.component').then((m) => m.UserFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('@/features/users/feature-user-detail/user-detail.component').then((m) => m.UserDetailComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('@/features/users/feature-user-list/user-list.component').then((m) => m.UserListComponent),
  },
];
