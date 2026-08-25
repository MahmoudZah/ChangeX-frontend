import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { apiErrorMessage } from '@/core/http/api-contract';
import { ClientsService } from '@/features/clients/data-access/clients.service';
import { ProjectsService } from '@/features/projects/data-access/projects.service';

@Component({ selector: 'app-project-form', standalone: true, imports: [FormsModule, RouterLink], templateUrl: './project-form.component.html' })
export class ProjectFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private projects = inject(ProjectsService);
  readonly clients = inject(ClientsService);
  private router = inject(Router);
  projectId = '';
  name = '';
  clientId = '';
  description = '';
  scope = '';
  state = 0;
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly attempted = signal(false);
  readonly submitting = signal(false);
  readonly error = signal('');
  readonly writesAvailable = this.projects.writesAvailable;
  readonly unavailableMessage = this.projects.unavailableMessage;

  async ngOnInit(): Promise<void> {
    this.projectId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.writesAvailable) {
      this.loading.set(false);
      return;
    }
    await this.clients.loadAll();
    const adminClient = this.clients.clients().find(c => c.name.toLowerCase() === 'admin' || c.name.toLowerCase().includes('admin'));
    this.clientId = this.route.snapshot.queryParamMap.get('clientId') ?? adminClient?.id ?? this.clients.clients()[0]?.id ?? '';
    if (this.projectId) {
      try {
        const project = await this.projects.loadById(this.projectId);
        if (!project) this.notFound.set(true);
        else { this.name = project.name; this.clientId = project.clientId; this.description = project.description; this.scope = project.scope; this.state = project.state === 'Active' ? 0 : project.state === 'Completed' ? 1 : 2; }
      } catch (error) { this.error.set(apiErrorMessage(error, 'The project could not be loaded.')); }
    }
    this.loading.set(false);
  }

  async submit(): Promise<void> {
    if (this.submitting()) return;
    this.attempted.set(true);
    this.error.set('');
    if (!this.name.trim() || !this.description.trim() || !this.scope.trim() || !this.clientId) return;
    this.submitting.set(true);
    try {
      const dto = { name: this.name.trim(), description: this.description.trim(), scope: this.scope.trim(), clientID: this.clientId, state: this.state };
      if (this.projectId) await this.projects.update(this.projectId, dto); else await this.projects.create(dto);
      await this.router.navigate(['/projects'], { state: { notice: this.projects.lastMessage() || 'Project saved successfully.' } });
    } catch (error) { this.error.set(apiErrorMessage(error, 'Unable to save the project.')); }
    finally { this.submitting.set(false); }
  }
}
