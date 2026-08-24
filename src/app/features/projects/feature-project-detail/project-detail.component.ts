import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '@/core/auth/auth.service';
import { apiErrorMessage } from '@/core/http/api-contract';
import { Project } from '@/features/projects/data-access/project.model';
import { ProjectsService } from '@/features/projects/data-access/projects.service';
import { StatusBadgeComponent } from '@/shared/ui/status-badge/status-badge.component';

@Component({ selector: 'app-project-detail', standalone: true, imports: [RouterLink, StatusBadgeComponent], templateUrl: './project-detail.component.html' })
export class ProjectDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly projectsService = inject(ProjectsService);
  readonly auth = inject(AuthService);
  readonly project = signal<Project | null>(null);
  readonly loading = signal(true);
  readonly forbidden = signal(false);
  readonly deleting = signal(false);
  readonly error = signal('');
  readonly writesAvailable = this.projectsService.writesAvailable;

  async ngOnInit(): Promise<void> { await this.load(); }
  async load(): Promise<void> {
    this.loading.set(true); this.error.set(''); this.forbidden.set(false);
    try {
      const project = await this.projectsService.loadById(this.route.snapshot.paramMap.get('id') ?? '');
      if (project && !this.auth.isAdmin() && project.clientId !== this.auth.user()?.clientId) this.forbidden.set(true);
      else this.project.set(project);
    } catch (error) { this.error.set(apiErrorMessage(error, 'The project could not be loaded.')); }
    finally { this.loading.set(false); }
  }

  async deleteProject(item: Project): Promise<void> {
    if (this.deleting() || !window.confirm(`Delete ${item.name}? This cannot be undone.`)) return;
    this.deleting.set(true); this.error.set('');
    try { const notice = await this.projectsService.delete(item.id); await this.router.navigate(['/projects'], { state: { notice } }); }
    catch (error) { this.error.set(apiErrorMessage(error, 'The project could not be deleted.')); }
    finally { this.deleting.set(false); }
  }
}
