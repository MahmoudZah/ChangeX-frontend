import { Routes } from '@angular/router';

/**
 * CRMS root routes — lazy-load each feature boundary.
 * Wire guards and loadChildren/loadComponent when implementing.
 *
 * Planned structure:
 * - /login → features/auth/feature-login
 * - / (ShellComponent + authGuard)
 *   - /clients → CLIENTS_ROUTES (Admin only)
 *   - /projects → PROJECTS_ROUTES
 *   - /change-requests → CR_ROUTES (default redirect)
 *   - /users → USERS_ROUTES (Admin only)
 */
export const routes: Routes = [];
