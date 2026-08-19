import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CrsService } from '@/features/change-requests/data-access/crs.service';
import { StatusBadgeComponent } from '@/shared/ui/status-badge/status-badge.component';
import { formatCurrency } from '@/shared/util/formatters';

@Component({
  selector: 'app-approvals-list',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent],
  templateUrl: './approvals-list.component.html',
})
export class ApprovalsListComponent implements OnInit {
  private crs = inject(CrsService);
  readonly pending = this.crs.pendingApprovals;
  readonly formatCurrency = formatCurrency;

  ngOnInit(): void {
    void this.crs.loadAll();
  }
}
