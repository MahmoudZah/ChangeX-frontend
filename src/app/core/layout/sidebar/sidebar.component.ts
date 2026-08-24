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
    { path: '/dashboard', label: 'Dashboard', icon: 'layout-dashboard.svg' },
    { path: '/projects', label: 'Projects', icon: 'briefcase.svg' },
    { path: '/change-requests', label: 'Change Requests', icon: 'refresh-cw.svg' },
    { path: '/approvals', label: 'Approvals', icon: 'check-circle.svg' },
    { path: '/account', label: 'Account/Profile', icon: 'user.svg' },
  ];

  readonly adminLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: 'layout-dashboard.svg' },
    { path: '/clients', label: 'Clients', icon: 'users-2.svg' },
    { path: '/projects', label: 'Projects', icon: 'briefcase.svg' },
    { path: '/change-requests', label: 'Change Requests', icon: 'refresh-cw.svg' },
    { path: '/estimates', label: 'Estimates', icon: 'calculator.svg' },
    { path: '/users', label: 'Users/Team', icon: 'users.svg' },
    { path: '/account', label: 'Settings', icon: 'settings.svg' },
  ];

  iconPath(icon: string): string {
    return `/assets/icons/${icon}`;
  }

  avatarPath(): string {
    return this.auth.isAdmin() ? '/assets/icons/avatar-admin.png' : '/assets/icons/avatar-client.png';
  }

  links() {
    return this.auth.isAdmin() ? this.adminLinks : this.clientLinks;
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
