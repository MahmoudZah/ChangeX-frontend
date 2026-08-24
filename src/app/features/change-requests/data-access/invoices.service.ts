import { Injectable, computed, signal } from '@angular/core';
import { Invoice } from '@/features/change-requests/data-access/invoice.model';

@Injectable({ providedIn: 'root' })
export class InvoicesService {
  private _invoices = signal<Invoice[]>([]);

  readonly invoices = this._invoices.asReadonly();
  readonly apiAvailable = false;
  readonly unavailableMessage = 'The current backend does not expose invoice endpoints.';
  readonly openCount = computed(() => 0);
  readonly openTotal = computed(() => 0);

  async loadAll(): Promise<Invoice[]> {
    this._invoices.set([]);
    return [];
  }

  getById(id: string): Invoice | undefined {
    return this._invoices().find((invoice) => invoice.id === id || invoice.invoiceNumber === id);
  }
}
