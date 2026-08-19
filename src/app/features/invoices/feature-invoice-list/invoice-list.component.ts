import { Component, inject, OnInit } from '@angular/core';
import { InvoicesService } from '@/features/change-requests/data-access/invoices.service';
import { DataTableComponent } from '@/shared/ui/data-table/data-table.component';
import { StatusBadgeComponent } from '@/shared/ui/status-badge/status-badge.component';
import { formatCurrency, formatDate } from '@/shared/util/formatters';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [DataTableComponent, StatusBadgeComponent],
  templateUrl: './invoice-list.component.html',
})
export class InvoiceListComponent implements OnInit {
  private invoicesService = inject(InvoicesService);
  readonly invoices = this.invoicesService.invoices;
  readonly formatCurrency = formatCurrency;
  readonly formatDate = formatDate;

  ngOnInit(): void {
    void this.invoicesService;
  }
}
