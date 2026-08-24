import { Routes } from '@angular/router';

export const CLIENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@/features/clients/feature-client-list/client-list.component').then((m) => m.ClientListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('@/features/clients/feature-client-form/client-form.component').then((m) => m.ClientFormComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('@/features/clients/feature-client-form/client-form.component').then((m) => m.ClientFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('@/features/clients/feature-client-detail/client-detail.component').then((m) => m.ClientDetailComponent),
  },
];
