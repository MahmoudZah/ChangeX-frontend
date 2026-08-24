import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@/core/auth/auth.service';
import { CrsService } from '@/features/change-requests/data-access/crs.service';
import { InvoicesService } from '@/features/change-requests/data-access/invoices.service';
import { ClientsService } from '@/features/clients/data-access/clients.service';
import { ProjectsService } from '@/features/projects/data-access/projects.service';
import { DataTableComponent } from '@/shared/ui/data-table/data-table.component';
import { PriorityBadgeComponent } from '@/shared/ui/priority-badge/priority-badge.component';
import { StatusBadgeComponent } from '@/shared/ui/status-badge/status-badge.component';
import { formatCurrency, formatDate } from '@/shared/util/formatters';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DataTableComponent, StatusBadgeComponent, PriorityBadgeComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly crs = inject(CrsService);
  readonly invoices = inject(InvoicesService);
  readonly projects = inject(ProjectsService);
  readonly clients = inject(ClientsService);

  readonly formatCurrency = formatCurrency;
  readonly formatDate = formatDate;
  readonly crError = this.crs.error;

  adminTab = signal<'all' | 'estimating' | 'signoff' | 'delayed'>('estimating');
  adminSearch = signal('');

  readonly recentCrs = computed(() => [...this.crs.crs()].slice(0, 5));
  readonly activeCrs = computed(
    () =>
      this.crs
        .crs()
        .filter((cr) => !['rejected', 'completed', 'implemented'].some((state) => cr.status.toLowerCase().includes(state))),
  );

  readonly userFirstName = computed(() => {
    return this.auth.user()?.name.split(' ')[0] ?? '';
  });

  readonly activeProjectCount = computed(
    () => this.projects.projects().filter((project) =>
      project.state === 'Active' && (this.auth.isAdmin() || project.clientId === this.auth.user()?.clientId),
    ).length,
  );

  readonly adminFiltered = computed(() => {
    const tab = this.adminTab();
    const search = this.adminSearch().trim().toLowerCase();
    const list = this.crs
      .crs()
      .filter((cr) => !search || `${cr.code} ${cr.title} ${cr.clientName} ${cr.projectName}`.toLowerCase().includes(search));
    if (tab === 'estimating') {
      return list.filter((cr) => cr.stage.toLowerCase().includes('estimat') || cr.status.toLowerCase().includes('review'));
    }
    if (tab === 'signoff') {
      return list.filter((cr) => cr.status.toLowerCase().includes('approval') || cr.status.toLowerCase().includes('test'));
    }
    if (tab === 'delayed') return list.filter((cr) => cr.status.toLowerCase().includes('delayed') || cr.daysOpen > 14);
    return list;
  });

  updateAdminSearch(event: Event): void {
    this.adminSearch.set((event.target as HTMLInputElement).value);
  }

  setAdminTab(tab: string): void {
    if (tab === 'all' || tab === 'estimating' || tab === 'signoff' || tab === 'delayed') {
      this.adminTab.set(tab);
    }
  }

  ngOnInit(): void {
    void this.crs.loadAll();
    void this.invoices.loadAll();
    void this.projects.loadAll();
    if (this.auth.isAdmin()) void this.clients.loadAll();
  }
}
