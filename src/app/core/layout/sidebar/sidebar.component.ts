import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@/core/auth/auth.service';
import { ThemeService } from '@/core/theme/theme.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private router = inject(Router);
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);

  readonly clientLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: 'grid' },
    { path: '/projects', label: 'Projects', icon: 'folder' },
    { path: '/change-requests', label: 'Change Requests', icon: 'file' },
    { path: '/approvals', label: 'Approvals', icon: 'check' },
    { path: '/invoices', label: 'Invoices', icon: 'card' },
    { path: '/account', label: 'Account/Profile', icon: 'user' },
  ];

  readonly adminLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: 'grid' },
    { path: '/clients', label: 'Clients', icon: 'users' },
    { path: '/projects', label: 'Projects', icon: 'folder' },
    { path: '/change-requests', label: 'Change Requests', icon: 'file' },
    { path: '/users', label: 'Users', icon: 'user' },
    { path: '/invoices', label: 'Invoices', icon: 'card' },
    { path: '/account', label: 'Account/Profile', icon: 'user' },
  ];

  links() {
    return this.auth.isAdmin() ? this.adminLinks : this.clientLinks;
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
