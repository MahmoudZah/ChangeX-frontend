import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiService } from '@/core/http/api.service';
import { Invoice, InvoiceDto } from '@/features/change-requests/data-access/invoice.model';

@Injectable({ providedIn: 'root' })
export class InvoicesService {
  private api = inject(ApiService);
  private _invoices = signal<Invoice[]>([]);
  readonly invoices = this._invoices.asReadonly();

  readonly openCount = computed(
    () => this._invoices().filter((i) => (i.state ?? i.status) !== 'Paid').length,
  );
  readonly openTotal = computed(() =>
    this._invoices()
      .filter((i) => (i.state ?? i.status) !== 'Paid')
      .reduce((sum, inv) => sum + (Number(inv.cost ?? inv.amount) || 0), 0),
  );

  async loadAll(): Promise<Invoice[]> {
    try {
      const res = await this.api.get<Invoice[]>('/Invoice');
      if (Array.isArray(res)) {
        this._invoices.set(res);
        return res;
      }
    } catch {
      // Fallback
    }
    return this._invoices();
  }

  async create(dto: InvoiceDto): Promise<void> {
    try {
      await this.api.post('/Invoice', dto);
      await this.loadAll();
    } catch {
      const newInv: Invoice = {
        id: 'INV-' + Math.floor(1000 + Math.random() * 9000),
        crId: dto.crid,
        crid: dto.crid,
        cost: dto.cost,
        status: 'Issued',
        state: 'Open',
        createdAt: new Date().toISOString(),
      };
      this._invoices.update((prev) => [...prev, newInv]);
    }
  }
}
