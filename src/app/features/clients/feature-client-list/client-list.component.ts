import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { apiErrorMessage } from '@/core/http/api-contract';
import { ClientsService } from '@/features/clients/data-access/clients.service';
import { ProjectsService } from '@/features/projects/data-access/projects.service';
import { ConfirmDialogService } from '@/shared/ui/alert-dialog/confirm-dialog.service';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './client-list.component.html',
})
export class ClientListComponent implements OnInit {
  private clientsService = inject(ClientsService);
  private projectsService = inject(ProjectsService);
  private confirmDialog = inject(ConfirmDialogService);
  readonly clients = this.clientsService.clients;
  readonly loading = this.clientsService.loading;
  readonly apiError = this.clientsService.error;
  readonly projectError = this.projectsService.error;
  readonly updatesAvailable = this.clientsService.updatesAvailable;
  readonly search = signal('');
  readonly deletingId = signal('');
  readonly actionError = signal('');
  readonly notice = signal(this.navigationNotice());

  readonly filtered = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.clients().filter((client) =>
      !query || `${client.name} ${client.email} ${client.contactInfo} ${client.address}`.toLowerCase().includes(query),
    );
  });

  async ngOnInit(): Promise<void> {
    await this.clientsService.loadAll();
    await this.projectsService.loadAll();
  }

  projectCount(clientId: string): number | null {
    if (this.projectError()) return null;
    return this.projectsService.projects().filter((project) => project.clientId === clientId).length;
  }

  updateSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  async retry(): Promise<void> {
    await this.clientsService.loadAll();
    await this.projectsService.loadAll();
  }

  async deleteClient(id: string, name: string): Promise<void> {
    if (this.deletingId()) return;
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete Client',
      message: `Delete "${name}"? This action cannot be undone and will permanently remove this client account.`,
      confirmText: 'Delete Client',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;

    this.deletingId.set(id);
    this.actionError.set('');
    try {
      this.notice.set(await this.clientsService.delete(id));
    } catch (error) {
      this.actionError.set(apiErrorMessage(error, 'The client could not be deleted. It may still have related records.'));
    } finally {
      this.deletingId.set('');
    }
  }

  private navigationNotice(): string {
    return (window.history.state as { notice?: string }).notice ?? '';
  }
}
