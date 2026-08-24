import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Invoice } from '@/features/change-requests/data-access/invoice.model';
import { InvoicesService } from '@/features/change-requests/data-access/invoices.service';

@Component({ selector: 'app-cr-invoice-tab', standalone: true, imports: [CurrencyPipe, DatePipe, RouterLink], template: `<section class="rounded-[10px] border border-border bg-card p-6"><h2 class="text-lg font-bold">Related Invoices</h2><div class="mt-5 space-y-3">@for (invoice of invoices; track invoice.id) { <a [routerLink]="['/invoices', invoice.id]" class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4 hover:border-primary"><div><p class="font-bold">{{ invoice.invoiceNumber ?? invoice.id }}</p><p class="text-xs text-muted-foreground">Due {{ invoice.dueDate | date:'mediumDate' }}</p></div><strong>{{ (invoice.amount ?? invoice.cost ?? 0) | currency:'USD' }}</strong></a> } @empty { <p class="text-sm text-muted-foreground">No invoice has been created for this request.</p> }</div></section>` })
export class InvoiceComponent implements OnInit {
  private service = inject(InvoicesService);
  @Input({ required: true }) crId!: string;
  invoices: Invoice[] = [];
  async ngOnInit(): Promise<void> { await this.service.loadAll(); this.invoices = this.service.invoices().filter((invoice) => invoice.crId === this.crId); }
}
