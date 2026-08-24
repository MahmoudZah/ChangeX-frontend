import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { apiErrorMessage } from '@/core/http/api-contract';
import { User } from '@/features/users/data-access/user.model';
import { UsersService } from '@/features/users/data-access/users.service';

@Component({ selector: 'app-user-detail', standalone: true, imports: [RouterLink], templateUrl: './user-detail.component.html' })
export class UserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute); private router = inject(Router); private users = inject(UsersService);
  readonly user = signal<User | null>(null); readonly loading = signal(true); readonly deleting = signal(false); readonly error = signal('');
  async ngOnInit(): Promise<void> { await this.load(); }
  async load(): Promise<void> { this.loading.set(true); this.error.set(''); try { this.user.set(await this.users.loadById(this.route.snapshot.paramMap.get('id') ?? '')); } catch (error) { this.error.set(apiErrorMessage(error, 'The user could not be loaded.')); } finally { this.loading.set(false); } }
  async deleteUser(item: User): Promise<void> { if (this.deleting() || !window.confirm(`Delete ${item.name}? This cannot be undone.`)) return; this.deleting.set(true); try { const notice = await this.users.delete(item.id); await this.router.navigate(['/users'], { state: { notice } }); } catch (error) { this.error.set(apiErrorMessage(error, 'The user could not be deleted.')); } finally { this.deleting.set(false); } }
}
