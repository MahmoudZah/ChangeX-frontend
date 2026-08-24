import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '@/core/http/api.service';
import { Role, STORAGE_KEYS } from '@/shared/util/constants';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  company: string;
  clientId: string;
  phoneNumber: string;
}

interface LoginResponse {
  token: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);
  private _user = signal<AuthUser | null>(null);
  private _token = signal<string | null>(null);
  private _loginError = signal('');
  private expiryTimer?: ReturnType<typeof setTimeout>;

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token() && !!this._user());
  readonly isAdmin = computed(() => this._user()?.role === 'Admin');
  readonly isClientUser = computed(() => ['UserAdmin', 'User'].includes(this._user()?.role ?? ''));
  readonly canManageProjects = computed(() => this._user()?.role === 'Admin');
  readonly loginError = this._loginError.asReadonly();

  constructor() {
    this.restoreSession();
  }

  async login(email: string, password: string): Promise<boolean> {
    this._loginError.set('');
    try {
      const payload: LoginRequest = { email, password };
      const response = await this.api.post<LoginResponse>('/Auth/Login', payload);
      const token = response.token?.trim();
      if (!token) {
        this._loginError.set('The API returned an invalid authentication token.');
        return false;
      }

      const claims = this.decodeJwt(token);
      const id = this.readClaim(claims, 'userid', 'nameidentifier', 'sub');
      const name = this.readClaim(claims, 'name', 'unique_name') || email.split('@')[0];
      const resolvedEmail = this.readClaim(claims, 'email') || email;
      const role = this.normalizeRole(this.readClaim(claims, 'role'));
      const clientId = this.readClaim(claims, 'clientid');
      const phoneNumber = this.readClaim(claims, 'phonenumber');
      const expiresAt = this.tokenExpiry(claims);

      if (!id || !role || !expiresAt || expiresAt <= Date.now()) {
        this._loginError.set('The API returned an invalid authentication token.');
        return false;
      }

      const user: AuthUser = {
        id,
        name,
        email: resolvedEmail,
        role,
        company: role === 'Admin' ? 'ChangeX' : 'Client workspace',
        clientId,
        phoneNumber,
      };

      this.persistSession(token, user, expiresAt);
      return true;
    } catch (error) {
      const httpError = error instanceof HttpErrorResponse ? error : null;
      const errorBody = this.loginErrorBody(httpError?.error);
      this._loginError.set(
        httpError && (httpError.status === 0 || [502, 503, 504].includes(httpError.status))
          ? 'Cannot connect to the API. Make sure the backend is running.'
          : errorBody?.message || 'Invalid email or password.',
      );
      return false;
    }
  }

  logout(): void {
    if (this.expiryTimer) clearTimeout(this.expiryTimer);
    this._user.set(null);
    this._token.set(null);
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.token);
  }

  validToken(): string | null {
    const token = this._token();
    if (!token) return null;
    const expiresAt = this.tokenExpiry(this.decodeJwt(token));
    if (!expiresAt || expiresAt <= Date.now()) {
      this.logout();
      return null;
    }
    return token;
  }

  private restoreSession(): void {
    const token = localStorage.getItem(STORAGE_KEYS.token);
    const user = this.readUser();
    if (!token || !user) {
      this.logout();
      return;
    }

    const claims = this.decodeJwt(token);
    const expiresAt = this.tokenExpiry(claims);
    const tokenUserId = this.readClaim(claims, 'userid', 'nameidentifier', 'sub');
    if (!expiresAt || expiresAt <= Date.now() || tokenUserId !== user.id) {
      this.logout();
      return;
    }

    this._token.set(token);
    this._user.set(user);
    this.scheduleExpiry(expiresAt);
  }

  private persistSession(token: string, user: AuthUser, expiresAt: number): void {
    this._token.set(token);
    this._user.set(user);
    localStorage.setItem(STORAGE_KEYS.token, token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    this.scheduleExpiry(expiresAt);
  }

  private scheduleExpiry(expiresAt: number): void {
    if (this.expiryTimer) clearTimeout(this.expiryTimer);
    const delay = Math.max(0, Math.min(expiresAt - Date.now(), 2_147_483_647));
    this.expiryTimer = setTimeout(() => {
      const returnUrl = this.router.url.startsWith('/login') ? '/dashboard' : this.router.url;
      this.logout();
      void this.router.navigate(['/login'], { queryParams: { returnUrl, expired: '1' } });
    }, delay);
  }

  private decodeJwt(token: string): Record<string, unknown> {
    try {
      const payload = token.split('.')[1] ?? '';
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
      const bytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
      const decoded: unknown = JSON.parse(new TextDecoder().decode(bytes));
      return this.isRecord(decoded) ? decoded : {};
    } catch {
      return {};
    }
  }

  private readClaim(claims: Record<string, unknown>, ...keys: string[]): string {
    for (const [claimKey, value] of Object.entries(claims)) {
      const normalizedKey = claimKey.toLowerCase();
      if (keys.some((key) => normalizedKey === key || normalizedKey.endsWith(`/${key}`))) {
        return String(value ?? '');
      }
    }
    return '';
  }

  private tokenExpiry(claims: Record<string, unknown>): number {
    const seconds = Number(claims['exp']);
    return Number.isFinite(seconds) ? seconds * 1000 : 0;
  }

  private normalizeRole(value: unknown): Role | null {
    const normalized = String(value ?? '').toLowerCase();
    if (normalized === 'admin') return 'Admin';
    if (normalized === 'useradmin') return 'UserAdmin';
    if (normalized === 'user') return 'User';
    return null;
  }

  private readUser(): AuthUser | null {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    if (!raw) return null;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!this.isRecord(parsed)) return null;
      const role = this.normalizeRole(parsed['role'] ?? '');
      const id = this.stringValue(parsed['id']);
      const email = this.stringValue(parsed['email']);
      const name = this.stringValue(parsed['name']);
      if (!id || !email || !name || !role) return null;
      return {
        id,
        name,
        email,
        role,
        company: this.stringValue(parsed['company']) || (role === 'Admin' ? 'ChangeX' : 'Client workspace'),
        clientId: this.stringValue(parsed['clientId']),
        phoneNumber: this.stringValue(parsed['phoneNumber']),
      };
    } catch {
      return null;
    }
  }

  private loginErrorBody(value: unknown): { message?: string } | null {
    if (!this.isRecord(value)) return null;
    return { message: this.stringValue(value['message']) || undefined };
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private stringValue(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }
}
