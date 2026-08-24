import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { apiErrorMessage } from '@/core/http/api-contract';
import { CrsService } from '@/features/change-requests/data-access/crs.service';
import { StatusesService } from '@/features/change-requests/data-access/statuses.service';
import { StatusBadgeComponent } from '@/shared/ui/status-badge/status-badge.component';
import { formatCurrency, formatDate } from '@/shared/util/formatters';

@Component({ selector: 'app-approvals-list', standalone: true, imports: [RouterLink, StatusBadgeComponent], templateUrl: './approvals-list.component.html' })
export class ApprovalsListComponent implements OnInit {
  private crs = inject(CrsService);
  private statuses = inject(StatusesService);
  readonly pending = this.crs.pendingApprovals;
  readonly loading = this.crs.loading;
  readonly loadError = this.crs.error;
  readonly formatCurrency = formatCurrency;
  readonly formatDate = formatDate;
  readonly busyId = signal('');
  readonly error = signal('');
  readonly notice = signal('');

  async ngOnInit(): Promise<void> { await this.load(); }
  async load(): Promise<void> {
    const crs = await this.crs.loadAll();
    await Promise.all(crs.filter((cr) => cr.status.toLowerCase().includes('approval')).map((cr) => this.statuses.loadForCr(cr.id)));
  }
  transitions(id: string) { return this.statuses.getAvailableForCr(id); }
  async change(id: string, targetId: string): Promise<void> {
    if (this.busyId()) return;
    this.busyId.set(id); this.error.set(''); this.notice.set('');
    try { await this.crs.changeStatus(id, targetId); await this.statuses.loadForCr(id); this.notice.set(this.crs.lastMessage()); }
    catch (error) { this.error.set(apiErrorMessage(error, 'The status could not be updated.')); }
    finally { this.busyId.set(''); }
  }
}
