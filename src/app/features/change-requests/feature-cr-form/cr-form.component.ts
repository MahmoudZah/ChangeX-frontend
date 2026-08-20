import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CrsService } from '@/features/change-requests/data-access/crs.service';
import { ProjectsService } from '@/features/projects/data-access/projects.service';
import { StatusesService } from '@/features/change-requests/data-access/statuses.service';
import { FormFieldComponent } from '@/shared/ui/form-field/form-field.component';
import { PRIORITIES, Priority } from '@/shared/util/constants';

@Component({
  selector: 'app-cr-form',
  standalone: true,
  imports: [FormsModule, FormFieldComponent],
  templateUrl: './cr-form.component.html',
})
export class CrFormComponent implements OnInit {
  private crs = inject(CrsService);
  private projects = inject(ProjectsService);
  private statuses = inject(StatusesService);
  private router = inject(Router);

  readonly priorities = PRIORITIES;
  readonly projectList = this.projects.projects;

  title = '';
  projectId = '';
  priority: Priority = 'High';
  description = '';
  scope = '';
  ticketComment = '';
  submitting = signal(false);
  attachmentName = signal('');

  ngOnInit(): void {
    void this.projects.loadAll();
  }

  async submit(): Promise<void> {
    if (this.submitting()) return;
    this.submitting.set(true);
    try {
      const defaultStatus = this.statuses.getDefaultInitialStatus();
      const created = await this.crs.create({
        name: this.title,
        priority: this.priority,
        scope: this.scope,
        description: this.description,
        estimatedManHour: 0,
        manHourRate: 150,
        startDate: new Date().toISOString(),
        finishDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        currentStatusID: defaultStatus.id,
        projectID: this.projectId,
      });
      void this.router.navigate(['/change-requests', created.id]);
    } finally {
      this.submitting.set(false);
    }
  }

  cancel(): void {
    void this.router.navigate(['/change-requests']);
  }
}
