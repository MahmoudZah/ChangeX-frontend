import { Routes } from '@angular/router';
import { roleGuard } from '@/core/auth/role.guard';

export const PROJECTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@/features/projects/feature-project-list/project-list.component').then((m) => m.ProjectListComponent),
  },
  {
    path: 'new',
    canActivate: [roleGuard(['Admin'])],
    loadComponent: () =>
      import('@/features/projects/feature-project-form/project-form.component').then((m) => m.ProjectFormComponent),
  },
  {
    path: ':id/edit',
    canActivate: [roleGuard(['Admin'])],
    loadComponent: () =>
      import('@/features/projects/feature-project-form/project-form.component').then((m) => m.ProjectFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('@/features/projects/feature-project-detail/project-detail.component').then((m) => m.ProjectDetailComponent),
  },
];
