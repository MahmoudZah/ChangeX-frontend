import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CrsService } from '@/features/change-requests/data-access/crs.service';
import { DataTableComponent } from '@/shared/ui/data-table/data-table.component';
import { PriorityBadgeComponent } from '@/shared/ui/priority-badge/priority-badge.component';
import { StatusBadgeComponent } from '@/shared/ui/status-badge/status-badge.component';
import { formatCurrency, formatDate } from '@/shared/util/formatters';

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
      if (this.statusFilter() === 'approval' && !cr.status.toLowerCase().includes('approval')) return false;
      if (this.statusFilter() === 'accepted' && !cr.status.toLowerCase().includes('accept')) return false;
      return true;
    });
  });
  readonly totalValue = computed(() => this.estimates().reduce((sum, cr) => sum + cr.estimatedCost, 0));
  readonly totalHours = computed(() => this.estimates().reduce((sum, cr) => sum + cr.estimatedHours, 0));
  readonly awaitingApproval = computed(() => this.estimates().filter((cr) => cr.status.toLowerCase().includes('approval')).length);

  async ngOnInit(): Promise<void> { await this.crsService.loadAll(); }
  async retry(): Promise<void> { await this.crsService.loadAll(); }
  updateSearch(event: Event): void { this.search.set((event.target as HTMLInputElement).value); }
  updateStatus(event: Event): void { this.statusFilter.set((event.target as HTMLSelectElement).value); }
}
