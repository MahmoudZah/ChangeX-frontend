import { Routes } from '@angular/router';
import { anonymousGuard, authGuard } from '@/core/auth/auth.guard';
import { roleGuard } from '@/core/auth/role.guard';
import { ShellComponent } from '@/core/layout/shell/shell.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [anonymousGuard],
    loadChildren: () => import('@/features/auth/feature-login/login.routes').then((m) => m.LOGIN_ROUTES),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('@/features/dashboard/feature-dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'clients',
        canActivate: [roleGuard(['Admin'])],
        loadChildren: () => import('@/features/clients/clients.routes').then((m) => m.CLIENTS_ROUTES),
      },
      {
        path: 'projects',
        loadChildren: () => import('@/features/projects/projects.routes').then((m) => m.PROJECTS_ROUTES),
      },
      {
        path: 'change-requests',
        loadChildren: () =>
          import('@/features/change-requests/change-requests.routes').then((m) => m.CR_ROUTES),
      },
      {
        path: 'estimates',
        canActivate: [roleGuard(['Admin'])],
        loadComponent: () =>
          import('@/features/change-requests/feature-estimates-list/estimates-list.component').then((m) => m.EstimatesListComponent),
      },
      {
        path: 'approvals',
        canActivate: [roleGuard(['UserAdmin', 'User'])],
        loadComponent: () =>
          import('@/features/change-requests/feature-approvals-list/approvals-list.component').then(
            (m) => m.ApprovalsListComponent,
          ),
      },
      {
        path: 'invoices/:id',
        loadComponent: () =>
          import('@/features/invoices/feature-invoice-detail/invoice-detail.component').then((m) => m.InvoiceDetailComponent),
      },
      {
        path: 'invoices',
        loadComponent: () =>
          import('@/features/invoices/feature-invoice-list/invoice-list.component').then((m) => m.InvoiceListComponent),
      },
      {
        path: 'account',
        loadComponent: () =>
          import('@/features/account/feature-account/account.component').then((m) => m.AccountComponent),
      },
      {
        path: 'users',
        canActivate: [roleGuard(['Admin'])],
        loadChildren: () => import('@/features/users/users.routes').then((m) => m.USERS_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
