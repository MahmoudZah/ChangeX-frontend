import { Injectable, signal } from '@angular/core';
import { User } from '@/features/users/data-access/user.model';

const MOCK: User[] = [
  { id: 'u-sarah', name: 'Sarah Jenkins', email: 'sarah.jenkins@acme.com', role: 'Client', clientId: 'c1', company: 'Aurae Corporation' },
  { id: 'u-admin', name: 'Alex Rivera', email: 'admin@changex.com', role: 'Admin', clientId: null, company: 'ChangeX' },
  { id: 'u-jordan', name: 'Jordan Lee', email: 'jordan@acme.com', role: 'Client', clientId: 'c2', company: 'Acme Inc' },
];

@Injectable({ providedIn: 'root' })
export class UsersService {
  private _users = signal<User[]>(MOCK);
  readonly users = this._users.asReadonly();

  async loadAll(): Promise<void> {
    this._users.set(MOCK);
  }
}
