import { Injectable, computed, signal } from '@angular/core';
import { Invoice } from '@/features/change-requests/data-access/invoice.model';

const MOCK: Invoice[] = [
  { id: 'inv-1', crId: 'cr-101', crCode: 'CR-101', amount: 5400, dueDate: '2026-08-31', state: 'Open' },
  { id: 'inv-2', crId: 'cr-102', crCode: 'CR-102', amount: 3100, dueDate: '2026-08-28', state: 'Open' },
  { id: 'inv-3', crId: 'cr-100', crCode: 'CR-100', amount: 3950, dueDate: '2026-07-15', state: 'Paid' },
];

@Injectable({ providedIn: 'root' })
export class InvoicesService {
  private _invoices = signal<Invoice[]>(MOCK);
  readonly invoices = this._invoices.asReadonly();

  readonly openCount = computed(() => this._invoices().filter((i) => i.state === 'Open').length);

  readonly openTotal = computed(() =>
    this._invoices().filter((i) => i.state === 'Open').reduce((sum, i) => sum + i.amount, 0),
  );

  forCr(crId: string): Invoice[] {
    return this._invoices().filter((i) => i.crId === crId);
  }
}
