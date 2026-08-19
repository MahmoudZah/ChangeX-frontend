import { Injectable, computed, signal } from '@angular/core';
import { Role, STORAGE_KEYS } from '@/shared/util/constants';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  company: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<AuthUser | null>(this.readUser());
  private _token = signal<string | null>(localStorage.getItem(STORAGE_KEYS.token));

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());
  readonly isAdmin = computed(() => this._user()?.role === 'Admin');

  login(email: string, password: string): boolean {
    void password;
    const isAdmin = email.toLowerCase().includes('admin');
    const user: AuthUser = isAdmin
      ? {
          id: 'u-admin',
          name: 'Alex Rivera',
          email,
          role: 'Admin',
          company: 'ChangeX',
        }
      : {
          id: 'u-sarah',
          name: 'Sarah Jenkins',
          email,
          role: 'Client',
          company: 'Acme Corporation',
        };

    const token = `mock.${btoa(email)}.${Date.now()}`;
    this._user.set(user);
    this._token.set(token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.token, token);
    return true;
  }

  logout(): void {
    this._user.set(null);
    this._token.set(null);
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.token);
  }

  private readUser(): AuthUser | null {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }
}
