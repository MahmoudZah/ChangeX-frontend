import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@/core/auth/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './topbar.component.html',
})
export class TopbarComponent {
  private router = inject(Router);
  readonly auth = inject(AuthService);
  readonly open = signal(false);

  readonly clientLinks = [
    { path: '/dashboard', label: 'Dashboard' }, { path: '/projects', label: 'Projects' },
    { path: '/change-requests', label: 'Change Requests' }, { path: '/approvals', label: 'Approvals' },
    { path: '/account', label: 'Account/Profile' },
  ];
  readonly adminLinks = [
    { path: '/dashboard', label: 'Dashboard' }, { path: '/clients', label: 'Clients' },
    { path: '/projects', label: 'Projects' }, { path: '/change-requests', label: 'Change Requests' },
    { path: '/estimates', label: 'Estimates' },
    { path: '/users', label: 'Users/Team' }, { path: '/account', label: 'Settings' },
  ];

  links() { return this.auth.isAdmin() ? this.adminLinks : this.clientLinks; }
  toggle(): void { this.open.update((value) => !value); }
  close(): void { this.open.set(false); }
  logout(): void { this.auth.logout(); this.open.set(false); void this.router.navigate(['/login']); }
}
