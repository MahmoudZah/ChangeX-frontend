import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { apiErrorMessage } from '@/core/http/api-contract';
import { UsersService } from '@/features/users/data-access/users.service';

@Component({ selector: 'app-user-list', standalone: true, imports: [RouterLink], templateUrl: './user-list.component.html' })
export class UserListComponent implements OnInit {
  private usersService = inject(UsersService);
  readonly users = this.usersService.users;
  readonly loading = this.usersService.loading;
  readonly apiError = this.usersService.error;
  readonly search = signal('');
  readonly roleFilter = signal('all');
  readonly deletingId = signal('');
  readonly actionError = signal('');
  readonly notice = signal((window.history.state as { notice?: string }).notice ?? '');

  readonly filtered = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.users().filter((user) => {
      if (query && !`${user.name} ${user.email} ${user.phoneNumber} ${user.company}`.toLowerCase().includes(query)) return false;
      return this.roleFilter() === 'all' || String(user.systemRole) === this.roleFilter();
    });
  });

  async ngOnInit(): Promise<void> { await this.retry(); }
  async retry(): Promise<void> { await this.usersService.loadAll(); }
  updateSearch(event: Event): void { this.search.set((event.target as HTMLInputElement).value); }
  updateRole(event: Event): void { this.roleFilter.set((event.target as HTMLSelectElement).value); }

  async deleteUser(id: string, name: string): Promise<void> {
    if (this.deletingId() || !window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    this.deletingId.set(id); this.actionError.set('');
    try { this.notice.set(await this.usersService.delete(id)); }
    catch (error) { this.actionError.set(apiErrorMessage(error, 'The user could not be deleted.')); }
    finally { this.deletingId.set(''); }
  }
}
