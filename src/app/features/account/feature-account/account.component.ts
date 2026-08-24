import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '@/core/auth/auth.service';
import { apiErrorMessage } from '@/core/http/api-contract';
import { ThemeService } from '@/core/theme/theme.service';
import { User } from '@/features/users/data-access/user.model';
import { UsersService } from '@/features/users/data-access/users.service';

@Component({
  selector: 'app-account',
  standalone: true,
  templateUrl: './account.component.html',
})
export class AccountComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  private users = inject(UsersService);
  readonly profile = signal<User | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly usesTokenProfile = computed(() => this.auth.user()?.role === 'UserAdmin');
  readonly displayName = computed(() => this.profile()?.name || this.auth.user()?.name || '—');
  readonly displayEmail = computed(() => this.profile()?.email || this.auth.user()?.email || '—');
  readonly displayPhone = computed(() => this.profile()?.phoneNumber || this.auth.user()?.phoneNumber || '—');
  readonly displayCompany = computed(() => this.profile()?.company || this.auth.user()?.company || '—');

  ngOnInit(): void {
    void this.loadProfile();
  }

  async loadProfile(): Promise<void> {
    const user = this.auth.user();
    if (!user || user.role === 'UserAdmin') return;
    this.loading.set(true);
    this.error.set('');
    try {
      const profile = await this.users.loadById(user.id);
      this.profile.set(profile);
      if (!profile) this.error.set('The profile no longer exists.');
    } catch (error) {
      this.error.set(apiErrorMessage(error, 'The latest profile details could not be loaded.'));
    } finally {
      this.loading.set(false);
    }
  }
}
