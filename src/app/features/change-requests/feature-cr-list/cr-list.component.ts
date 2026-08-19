import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CrsService } from '@/features/change-requests/data-access/crs.service';
import { ProjectsService } from '@/features/projects/data-access/projects.service';
import { DataTableComponent } from '@/shared/ui/data-table/data-table.component';
import { PriorityBadgeComponent } from '@/shared/ui/priority-badge/priority-badge.component';
import { StatusBadgeComponent } from '@/shared/ui/status-badge/status-badge.component';
import { PAGE_SIZE, PRIORITIES } from '@/shared/util/constants';
import { formatCurrency, formatRelative } from '@/shared/util/formatters';

@Component({
  selector: 'app-cr-list',
  standalone: true,
  imports: [RouterLink, DataTableComponent, StatusBadgeComponent, PriorityBadgeComponent],
  templateUrl: './cr-list.component.html',
})
export class CrListComponent implements OnInit {
  private crsService = inject(CrsService);
  private projectsService = inject(ProjectsService);

  readonly crs = this.crsService.crs;
  readonly projects = this.projectsService.projects;
  readonly priorities = PRIORITIES;
  readonly formatCurrency = formatCurrency;
  readonly formatRelative = formatRelative;
  readonly Math = Math;
  readonly pageSize = PAGE_SIZE;

  search = signal('');
  projectFilter = signal('all');
  statusFilter = signal('all');
  priorityFilter = signal('all');
  page = signal(1);

  readonly statuses = computed(() => [...new Set(this.crs().map((cr) => cr.status))].sort());

  readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.crs().filter((cr) => {
      if (q && !`${cr.code} ${cr.title}`.toLowerCase().includes(q)) return false;
      if (this.projectFilter() !== 'all' && cr.projectId !== this.projectFilter()) return false;
      if (this.statusFilter() !== 'all' && cr.status !== this.statusFilter()) return false;
      if (this.priorityFilter() !== 'all' && cr.priority !== this.priorityFilter()) return false;
      return true;
    });
  });

  readonly paged = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filtered().length / PAGE_SIZE)));

  ngOnInit(): void {
    void this.crsService.loadAll();
    void this.projectsService.loadAll();
  }

  setPage(next: number): void {
    this.page.set(Math.min(Math.max(1, next), this.pageCount()));
  }
}
