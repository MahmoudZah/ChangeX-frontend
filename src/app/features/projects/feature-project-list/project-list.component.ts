import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@/core/auth/auth.service';
import { apiErrorMessage } from '@/core/http/api-contract';
import { ClientsService } from '@/features/clients/data-access/clients.service';
import { ProjectsService } from '@/features/projects/data-access/projects.service';
import { ConfirmDialogService } from '@/shared/ui/alert-dialog/confirm-dialog.service';
import { StatusBadgeComponent } from '@/shared/ui/status-badge/status-badge.component';

@Component({ selector: 'app-project-list', standalone: true, imports: [RouterLink, StatusBadgeComponent], templateUrl: './project-list.component.html' })
export class ProjectListComponent implements OnInit {
  readonly projectsService = inject(ProjectsService);
  readonly auth = inject(AuthService);
  readonly clientsService = inject(ClientsService);
  private confirmDialog = inject(ConfirmDialogService);
  readonly projects = this.projectsService.projects;
  readonly loading = this.projectsService.loading;
  readonly apiError = this.projectsService.error;
  readonly writesAvailable = this.projectsService.writesAvailable;
  readonly unavailableMessage = this.projectsService.unavailableMessage;
  readonly search = signal('');
  readonly clientFilter = signal('all');
  readonly stateFilter = signal('all');
  readonly deletingId = signal('');
  readonly actionError = signal('');
  readonly notice = signal((window.history.state as { notice?: string }).notice ?? '');

  readonly filtered = computed(() => {
    const query = this.search().trim().toLowerCase();
    const clientId = this.auth.user()?.clientId;
    return this.projects().filter((project) => {
      if (!this.auth.isAdmin() && project.clientId !== clientId) return false;
      if (query && !`${project.name} ${project.clientName} ${project.scope}`.toLowerCase().includes(query)) return false;
      if (this.clientFilter() !== 'all' && project.clientId !== this.clientFilter()) return false;
      return this.stateFilter() === 'all' || project.state === this.stateFilter();
    });
  });

  async ngOnInit(): Promise<void> { await this.retry(); }
  async retry(): Promise<void> { await this.projectsService.loadAll(); }
  updateSearch(event: Event): void { this.search.set((event.target as HTMLInputElement).value); }
  updateClient(event: Event): void { this.clientFilter.set((event.target as HTMLSelectElement).value); }
  updateState(event: Event): void { this.stateFilter.set((event.target as HTMLSelectElement).value); }

  async deleteProject(id: string, name: string): Promise<void> {
    if (this.deletingId()) return;
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete Project',
      message: `Delete "${name}"? This action cannot be undone and will permanently remove this project.`,
      confirmText: 'Delete Project',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;

    this.deletingId.set(id);
    this.actionError.set('');
    try { this.notice.set(await this.projectsService.delete(id)); }
    catch (error) { this.actionError.set(apiErrorMessage(error, 'The project could not be deleted.')); }
    finally { this.deletingId.set(''); }
  }
}

