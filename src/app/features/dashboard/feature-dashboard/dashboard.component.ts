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
import { formatCurrency, formatRelative } from '@/shared/util/formatters';

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
  readonly formatRelative = formatRelative;

  adminTab = signal<'all' | 'estimating' | 'signoff' | 'delayed'>('estimating');

  readonly recentCrs = computed(() => [...this.crs.crs()].slice(0, 5));

  readonly userFirstName = computed(() => {
    return this.auth.user()?.name.split(' ')[0] ?? '';
  });

  readonly activeProjectCount = computed(
    () => this.projects.projects().filter((p) => p.state === 'Active').length,
  );

  readonly adminFiltered = computed(() => {
    const tab = this.adminTab();
    const list = this.crs.crs();
    if (tab === 'estimating') return list.filter((cr) => (cr.status ?? '').toLowerCase().includes('estimat'));
    if (tab === 'signoff') return list.filter((cr) => (cr.status ?? '').toLowerCase().includes('signoff'));
    if (tab === 'delayed') return list.filter((cr) => (cr.status ?? '').toLowerCase().includes('delayed'));
    return list;
  });

  ngOnInit(): void {
    void this.crs.loadAll();
    void this.invoices;
    void this.projects.loadAll();
    void this.clients.loadAll();
  }
}
