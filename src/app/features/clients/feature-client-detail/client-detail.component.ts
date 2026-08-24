import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { apiErrorMessage } from '@/core/http/api-contract';
import { Client } from '@/features/clients/data-access/client.model';
import { ClientsService } from '@/features/clients/data-access/clients.service';
import { ProjectsService } from '@/features/projects/data-access/projects.service';
import { UsersService } from '@/features/users/data-access/users.service';
import { StatusBadgeComponent } from '@/shared/ui/status-badge/status-badge.component';

@Component({ selector: 'app-client-detail', standalone: true, imports: [RouterLink, StatusBadgeComponent], templateUrl: './client-detail.component.html' })
export class ClientDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientsService = inject(ClientsService);
  private projectsService = inject(ProjectsService);
  private usersService = inject(UsersService);
  readonly client = signal<Client | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly deleting = signal(false);
  readonly projects = computed(() => this.projectsService.projects().filter((project) => project.clientId === this.client()?.id));
  readonly users = computed(() => this.usersService.usersForClient(this.client()?.id ?? ''));

  async ngOnInit(): Promise<void> { await this.load(); }

  async load(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.loading.set(true);
    this.error.set('');
    try {
      const client = await this.clientsService.loadById(id);
      this.client.set(client);
      if (client) await Promise.all([this.projectsService.loadAll(client.id), this.usersService.loadForClient(client.id)]);
    } catch (error) {
      this.error.set(apiErrorMessage(error, 'The client could not be loaded.'));
    } finally { this.loading.set(false); }
  }

  async deleteClient(item: Client): Promise<void> {
    if (this.deleting() || !window.confirm(`Delete ${item.name}? This cannot be undone.`)) return;
    this.deleting.set(true);
    this.error.set('');
    try {
      const notice = await this.clientsService.delete(item.id);
      await this.router.navigate(['/clients'], { state: { notice } });
    } catch (error) {
      this.error.set(apiErrorMessage(error, 'The client could not be deleted. It may still have related records.'));
    } finally { this.deleting.set(false); }
  }
}
