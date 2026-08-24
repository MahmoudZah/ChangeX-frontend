import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ApiService } from '@/core/http/api.service';
import { AuthService } from '@/core/auth/auth.service';

describe('AuthService', () => {
  const api = jasmine.createSpyObj<ApiService>('ApiService', ['post']);
  const router = jasmine.createSpyObj<Router>('Router', ['navigate'], { url: '/login' });

  beforeEach(() => {
    localStorage.clear();
    api.post.calls.reset();
    router.navigate.calls.reset();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useValue: api },
        { provide: Router, useValue: router },
      ],
    });
  });

  afterEach(() => localStorage.clear());

  it('accepts the current backend login response with a plain token string', async () => {
    const token = createToken({
      UserID: '89a8fc71-7ba2-4683-afbd-c45376bff1d3',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'Admin',
      ClientID: '3383bcdd-42b3-4013-a70c-eeda2c49c17f',
      PhoneNumber: '01000000000',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    api.post.and.resolveTo({ token });

    const service = TestBed.inject(AuthService);

    expect(await service.login('admin@example.com', 'secret')).toBeTrue();
    expect(service.token()).toBe(token);
    expect(service.user()?.role).toBe('Admin');
  });

  it('preserves UTF-8 claim values and recognizes the regular User role', async () => {
    const token = createToken({
      UserID: '89a8fc71-7ba2-4683-afbd-c45376bff1d3',
      name: 'مستخدم تجريبي',
      email: 'user@example.com',
      role: 'User',
      ClientID: '3383bcdd-42b3-4013-a70c-eeda2c49c17f',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    api.post.and.resolveTo({ token });

    const service = TestBed.inject(AuthService);

    expect(await service.login('user@example.com', 'test-password')).toBeTrue();
    expect(service.user()?.name).toBe('مستخدم تجريبي');
    expect(service.user()?.role).toBe('User');
  });

  it('rejects an already-expired token and does not persist a session', async () => {
    api.post.and.resolveTo({ token: createToken({
      UserID: '89a8fc71-7ba2-4683-afbd-c45376bff1d3',
      role: 'Admin',
      exp: Math.floor(Date.now() / 1000) - 1,
    }) });

    const service = TestBed.inject(AuthService);

    expect(await service.login('admin@example.com', 'test-password')).toBeFalse();
    expect(service.isAuthenticated()).toBeFalse();
    expect(localStorage.length).toBe(0);
  });

  it('rejects malformed tokens returned by the API', async () => {
    api.post.and.resolveTo({ token: 'not-a-jwt' });

    const service = TestBed.inject(AuthService);

    expect(await service.login('admin@example.com', 'test-password')).toBeFalse();
    expect(service.loginError()).toContain('invalid authentication token');
  });

  it('shows the current backend error message when login fails', async () => {
    api.post.and.rejectWith(new HttpErrorResponse({
      status: 404,
      error: { message: 'Login failed: email is incorrect.' },
    }));

    const service = TestBed.inject(AuthService);

    expect(await service.login('missing@example.com', 'secret')).toBeFalse();
    expect(service.loginError()).toBe('Login failed: email is incorrect.');
  });
});

function createToken(payload: Record<string, unknown>): string {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const encodedPayload = btoa(String.fromCharCode(...bytes))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `header.${encodedPayload}.signature`;
}
