import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CrsService } from '@/features/change-requests/data-access/crs.service';
import { DataTableComponent } from '@/shared/ui/data-table/data-table.component';
import { PriorityBadgeComponent } from '@/shared/ui/priority-badge/priority-badge.component';
import { StatusBadgeComponent } from '@/shared/ui/status-badge/status-badge.component';
import { formatCurrency, formatDate } from '@/shared/util/formatters';
import { isAcceptedStatusId, isApprovalStatusId } from '@/shared/util/cr-status-workflow';

@Component({
  selector: 'app-estimates-list',
  standalone: true,
  imports: [RouterLink, DataTableComponent, PriorityBadgeComponent, StatusBadgeComponent],
  templateUrl: './estimates-list.component.html',
})
export class EstimatesListComponent implements OnInit {
  private crsService = inject(CrsService);
  readonly crs = this.crsService.crs;
  readonly loading = this.crsService.loading;
  readonly apiError = this.crsService.error;
  readonly formatCurrency = formatCurrency;
  readonly formatDate = formatDate;
  search = signal('');
  statusFilter = signal('all');
  readonly estimates = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.crs().filter((cr) => {
      if (!cr.estimatedHours) return false;
      if (query && !`${cr.code} ${cr.title} ${cr.clientName} ${cr.projectName}`.toLowerCase().includes(query)) return false;
      if (this.statusFilter() === 'approval' && !isApprovalStatusId(cr.currentStatusID)) return false;
      if (this.statusFilter() === 'accepted' && !isAcceptedStatusId(cr.currentStatusID)) return false;
      return true;
    });
  });
  readonly totalValue = computed(() => this.estimates().reduce((sum, cr) => sum + cr.estimatedCost, 0));
  readonly totalHours = computed(() => this.estimates().reduce((sum, cr) => sum + cr.estimatedHours, 0));
  readonly awaitingApproval = computed(() => this.estimates().filter((cr) => isApprovalStatusId(cr.currentStatusID)).length);

  async ngOnInit(): Promise<void> { await this.crsService.loadAll(); }
  async retry(): Promise<void> { await this.crsService.loadAll(); }
  updateSearch(event: Event): void { this.search.set((event.target as HTMLInputElement).value); }
  updateStatus(event: Event): void { this.statusFilter.set((event.target as HTMLSelectElement).value); }
}
