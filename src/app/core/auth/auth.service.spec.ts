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
  const encodedPayload = btoa(JSON.stringify(payload))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `header.${encodedPayload}.signature`;
}
