import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '@/core/auth/auth.service';
import { apiErrorMessage } from '@/core/http/api-contract';
import { CrsService } from '@/features/change-requests/data-access/crs.service';
import { DetailsService } from '@/features/change-requests/data-access/details.service';
import { ProjectsService } from '@/features/projects/data-access/projects.service';
import { FormFieldComponent } from '@/shared/ui/form-field/form-field.component';
import { PRIORITIES, Priority } from '@/shared/util/constants';

const ALLOWED_FILE_TYPES: Record<string, string[]> = {
  pdf: ['application/pdf'], doc: ['application/msword'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  xls: ['application/vnd.ms-excel'], xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  jpg: ['image/jpeg', 'image/pjpeg'], jpeg: ['image/jpeg', 'image/pjpeg'], png: ['image/png'],
};

@Component({ selector: 'app-cr-form', standalone: true, imports: [FormsModule, FormFieldComponent, RouterLink], templateUrl: './cr-form.component.html' })
export class CrFormComponent implements OnInit {
  private auth = inject(AuthService);
  private crs = inject(CrsService);
  private projects = inject(ProjectsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private details = inject(DetailsService);
  readonly priorities = PRIORITIES;
  readonly loading = this.projects.loading;
  readonly projectsError = this.projects.error;
  readonly projectList = computed(() => this.auth.isAdmin()
    ? this.projects.projects()
    : this.projects.projects().filter((project) => project.clientId === this.auth.user()?.clientId));
  title = '';
  projectId = '';
  priority: Priority = 'Medium';
  description = '';
  scope = '';
  ticketComment = '';
  selectedFile: File | null = null;
  readonly submitting = signal(false);
  readonly attempted = signal(false);
  readonly attachmentName = signal('');
  readonly error = signal('');

  async ngOnInit(): Promise<void> {
    await this.projects.loadAll();
    const requestedProject = this.route.snapshot.queryParamMap.get('projectId');
    this.projectId = this.projectList().some((project) => project.id === requestedProject)
      ? requestedProject ?? ''
      : this.projectList()[0]?.id ?? '';
  }

  async retryProjects(): Promise<void> { await this.projects.loadAll(); }

  async submit(): Promise<void> {
    if (this.submitting()) return;
    this.attempted.set(true); this.error.set('');
    if (!this.valid()) return;
    this.submitting.set(true);
    try {
      const created = await this.crs.create({
        name: this.title.trim(), priority: this.priority, scope: this.scope.trim(), description: this.description.trim(),
        projectID: this.projectId,
      });
      let notice = this.crs.lastMessage() || 'Change request created successfully.';
      if (this.selectedFile) {
        try { await this.details.create(created.id, this.ticketComment.trim(), this.selectedFile); }
        catch (error) { notice += ` The attachment was not saved: ${apiErrorMessage(error, 'upload failed')}`; }
      }
      await this.router.navigate(['/change-requests', created.id], { state: { notice } });
    } catch (error) { this.error.set(apiErrorMessage(error, 'We could not submit this change request.')); }
    finally { this.submitting.set(false); }
  }

  selectAttachment(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.error.set(''); this.selectedFile = null; this.attachmentName.set('');
    if (!file) return;
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ALLOWED_FILE_TYPES[extension]?.includes(file.type) || file.size > 10 * 1024 * 1024) {
      input.value = '';
      this.error.set('Use a PDF, Word, Excel, JPG, or PNG file up to 10 MB with a matching file type.');
      return;
    }
    this.selectedFile = file; this.attachmentName.set(file.name);
  }

  private valid(): boolean {
    return !!(this.title.trim() && this.projectId && this.description.trim() && this.scope.trim());
  }
}
