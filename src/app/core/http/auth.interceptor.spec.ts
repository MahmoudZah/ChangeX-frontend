import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '@/core/auth/auth.service';
import { authInterceptor } from '@/core/http/auth.interceptor';
import { ApiService } from '@/core/http/api.service';

describe('authInterceptor', () => {
  const auth = {
    validToken: jasmine.createSpy('validToken'),
    isAuthenticated: jasmine.createSpy('isAuthenticated'),
    logout: jasmine.createSpy('logout'),
  };
  const router = jasmine.createSpyObj<Router>('Router', ['navigate'], { url: '/projects' });

  beforeEach(() => {
    auth.validToken.calls.reset();
    auth.validToken.and.returnValue('valid-token');
    auth.isAuthenticated.calls.reset();
    auth.isAuthenticated.and.returnValue(true);
    auth.logout.calls.reset();
    router.navigate.calls.reset();
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('clears the session on a bearer authentication challenge because the API has no refresh endpoint', async () => {
    const request = TestBed.inject(ApiService).get('/Project/GetAllProjects').catch(() => undefined);
    const controller = TestBed.inject(HttpTestingController);
    const pending = controller.expectOne('/api/Project/GetAllProjects');
    expect(pending.request.headers.get('Authorization')).toBe('Bearer valid-token');
    pending.flush({}, {
      status: 401,
      statusText: 'Unauthorized',
      headers: { 'WWW-Authenticate': 'Bearer' },
    });
    await request;

    expect(auth.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/projects', expired: '1' },
    });
  });

  it('does not log out for a 403 authorization failure', async () => {
    const request = TestBed.inject(ApiService).get('/Client/GetAllClients').catch(() => undefined);
    const pending = TestBed.inject(HttpTestingController).expectOne('/api/Client/GetAllClients');
    pending.flush({}, { status: 403, statusText: 'Forbidden' });
    await request;

    expect(auth.logout).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
