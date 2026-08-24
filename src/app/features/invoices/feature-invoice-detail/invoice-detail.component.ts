import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CrsService } from '@/features/change-requests/data-access/crs.service';
import { ChangeRequest } from '@/features/change-requests/data-access/cr.model';
import { Invoice } from '@/features/change-requests/data-access/invoice.model';
import { InvoicesService } from '@/features/change-requests/data-access/invoices.service';
import { StatusBadgeComponent } from '@/shared/ui/status-badge/status-badge.component';
import { formatCurrency, formatDate } from '@/shared/util/formatters';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent],
  templateUrl: './invoice-detail.component.html',
})
export class InvoiceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private invoicesService = inject(InvoicesService);
  private crsService = inject(CrsService);
  readonly invoice = signal<Invoice | null>(null);
  readonly cr = signal<ChangeRequest | null>(null);
  readonly formatCurrency = formatCurrency;
  readonly formatDate = formatDate;
  readonly unavailableMessage = this.invoicesService.unavailableMessage;

  print(): void { window.print(); }

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    await this.invoicesService.loadAll();
    const invoice = this.invoicesService.getById(id) ?? null;
    this.invoice.set(invoice);
    if (invoice) this.cr.set(await this.crsService.getById(invoice.crId));
  }
}
