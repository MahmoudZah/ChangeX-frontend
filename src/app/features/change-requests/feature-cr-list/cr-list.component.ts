import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '@/core/auth/auth.service';
import { CrsService } from '@/features/change-requests/data-access/crs.service';
import { ProjectsService } from '@/features/projects/data-access/projects.service';
import { DataTableComponent } from '@/shared/ui/data-table/data-table.component';
import { PriorityBadgeComponent } from '@/shared/ui/priority-badge/priority-badge.component';
import { StatusBadgeComponent } from '@/shared/ui/status-badge/status-badge.component';
import { PAGE_SIZE, PRIORITIES, STORAGE_KEYS } from '@/shared/util/constants';
import { CR_BOARD_COLUMNS, crBoardColumn, crStatusLabel, crStatusOrder, normalizeStatusId } from '@/shared/util/cr-status-workflow';
import { formatCurrency, formatDate } from '@/shared/util/formatters';

export type CrListView = 'board' | 'list';

export const CR_TABLE_COLUMNS = [
  { key: 'change-request', label: 'Change Request', headerClass: 'px-4 py-3' },
  { key: 'project', label: 'Project', headerClass: 'px-4 py-3' },
  { key: 'priority', label: 'Priority', headerClass: 'px-4 py-3' },
  { key: 'status', label: 'Status', headerClass: 'px-4 py-3' },
  { key: 'estimate', label: 'Estimate', headerClass: 'px-4 py-3' },
  { key: 'finish-date', label: 'Finish Date', headerClass: 'px-4 py-3' },
  { key: 'actions', label: 'Actions', headerClass: 'px-4 py-3 text-right' },
] as const;

@Component({ selector: 'app-cr-list', standalone: true, imports: [RouterLink, DataTableComponent, StatusBadgeComponent, PriorityBadgeComponent], templateUrl: './cr-list.component.html' })
export class CrListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private crsService = inject(CrsService);
  private projectsService = inject(ProjectsService);
  readonly crs = this.crsService.crs;
  readonly loading = this.crsService.loading;
  readonly apiError = this.crsService.error;
  readonly priorities = PRIORITIES;
  readonly formatCurrency = formatCurrency;
  readonly formatDate = formatDate;
  readonly Math = Math;
  readonly pageSize = PAGE_SIZE;
  readonly tableColumns = CR_TABLE_COLUMNS;
  readonly isAdmin = this.auth.isAdmin;
  readonly search = signal('');
  readonly projectFilter = signal('all');
  readonly statusFilter = signal('all');
  readonly priorityFilter = signal('all');
  readonly page = signal(1);
  readonly view = signal<CrListView>(this.savedView());
  readonly projects = computed(() => this.isAdmin()
    ? this.projectsService.projects()
    : this.projectsService.projects().filter((project) => project.clientId === this.auth.user()?.clientId));
  readonly statuses = computed(() => {
    const byId = new Map<string, { id: string; label: string }>();
    this.crs().forEach((cr) => byId.set(normalizeStatusId(cr.currentStatusID), {
      id: cr.currentStatusID,
      label: crStatusLabel(cr.currentStatusID, cr.status),
    }));
    return [...byId.values()].sort((left, right) =>
      crStatusOrder(left.id) - crStatusOrder(right.id) || left.label.localeCompare(right.label));
  });
  readonly filtered = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.crs().filter((cr) => {
      if (query && !`${cr.code} ${cr.title} ${cr.projectName}`.toLowerCase().includes(query)) return false;
      if (this.projectFilter() !== 'all' && cr.projectId !== this.projectFilter()) return false;
      if (this.statusFilter() !== 'all' && normalizeStatusId(cr.currentStatusID) !== normalizeStatusId(this.statusFilter())) return false;
      return this.priorityFilter() === 'all' || cr.priority === this.priorityFilter();
    });
  });
  readonly paged = computed(() => this.filtered().slice((this.page() - 1) * PAGE_SIZE, this.page() * PAGE_SIZE));
  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filtered().length / PAGE_SIZE)));
  readonly boardColumns = computed(() => {
    const items = this.filtered();
    const columns = CR_BOARD_COLUMNS.map((column) => ({
      ...column,
      items: items.filter((cr) => crBoardColumn(cr.currentStatusID)?.key === column.key),
    }));
    const unknown = items.filter((cr) => !crBoardColumn(cr.currentStatusID));
    return unknown.length
      ? [...columns, { key: 'other', title: 'Other', color: '#71717a', items: unknown }]
      : columns;
  });

  async ngOnInit(): Promise<void> {
    this.projectFilter.set(this.route.snapshot.queryParamMap.get('projectId') ?? 'all');
    await Promise.all([this.projectsService.loadAll(), this.crsService.loadAll()]);
  }
  async retry(): Promise<void> { await this.crsService.loadAll(); }
  updateSearch(event: Event): void { this.search.set((event.target as HTMLInputElement).value); this.page.set(1); }
  updateProject(event: Event): void { this.projectFilter.set((event.target as HTMLSelectElement).value); this.page.set(1); }
  updateStatus(event: Event): void { this.statusFilter.set((event.target as HTMLSelectElement).value); this.page.set(1); }
  updatePriority(event: Event): void { this.priorityFilter.set((event.target as HTMLSelectElement).value); this.page.set(1); }
  setView(next: CrListView): void {
    this.view.set(next);
    try { localStorage.setItem(STORAGE_KEYS.crListView, next); } catch { /* Keep the in-memory preference. */ }
  }
  setPage(next: number): void { this.page.set(Math.min(Math.max(1, next), this.pageCount())); }

  private savedView(): CrListView {
    try {
      return localStorage.getItem(STORAGE_KEYS.crListView) === 'list' ? 'list' : 'board';
    } catch {
      return 'board';
    }
  }
}
