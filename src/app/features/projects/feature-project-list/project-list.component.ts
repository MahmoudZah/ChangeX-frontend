import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProjectsService } from '@/features/projects/data-access/projects.service';
import { StatusBadgeComponent } from '@/shared/ui/status-badge/status-badge.component';
import { formatRelative } from '@/shared/util/formatters';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent],
  templateUrl: './project-list.component.html',
})
export class ProjectListComponent implements OnInit {
  private projectsService = inject(ProjectsService);
  readonly projects = this.projectsService.projects;
  readonly formatRelative = formatRelative;
  search = signal('');

  readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const list = this.projects();
    if (!q) return list;
    return list.filter((p) => p.name.toLowerCase().includes(q));
  });

  ngOnInit(): void {
    void this.projectsService.loadAll();
  }
}
