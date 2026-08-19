import { Injectable, signal } from '@angular/core';
import { Client } from '@/features/clients/data-access/client.model';

const MOCK: Client[] = [
  { id: 'c1', name: 'Aurae Corporation', email: 'ops@aurae.com', contactInfo: 'Sarah Jenkins', projectCount: 4 },
  { id: 'c2', name: 'Acme Inc', email: 'it@acme.com', contactInfo: 'Jordan Lee', projectCount: 2 },
  { id: 'c3', name: 'Northwind Labs', email: 'hello@northwind.io', contactInfo: 'Priya Shah', projectCount: 3 },
];

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private _clients = signal<Client[]>(MOCK);
  readonly clients = this._clients.asReadonly();

  async loadAll(): Promise<void> {
    this._clients.set(MOCK);
  }

  getById(id: string): Client | undefined {
    return this._clients().find((c) => c.id === id);
  }
}
