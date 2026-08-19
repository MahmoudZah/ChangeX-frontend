import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CrsService } from '@/features/change-requests/data-access/crs.service';
import { ProjectsService } from '@/features/projects/data-access/projects.service';
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
  private router = inject(Router);

  readonly priorities = PRIORITIES;
  readonly projectList = this.projects.projects;

  title = '';
  projectId = 'p1';
  priority: Priority = 'High';
  description = '';
  scope = '';
  ticketComment = '';
  attachmentName = signal('checkout-wireframe.pdf');

  ngOnInit(): void {
    void this.projects.loadAll();
  }

  submit(): void {
    const project = this.projects.getById(this.projectId);
    const created = this.crs.create({
      title: this.title,
      projectId: this.projectId,
      projectName: project?.name,
      priority: this.priority,
      description: this.description,
      scope: this.scope.split('\n').map((s) => s.trim()).filter(Boolean),
      businessRationale: this.ticketComment || undefined,
    });
    void this.router.navigate(['/change-requests', created.id]);
  }

  cancel(): void {
    void this.router.navigate(['/change-requests']);
  }
}
