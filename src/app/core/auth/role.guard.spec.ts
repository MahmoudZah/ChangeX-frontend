import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { AuthService } from '@/core/auth/auth.service';
import { roleGuard } from '@/core/auth/role.guard';

describe('roleGuard', () => {
  it('rejects a regular user from an admin-only route', () => {
    const dashboardTree = {} as UrlTree;
    const router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    router.createUrlTree.and.returnValue(dashboardTree);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { user: () => ({ role: 'User' }) } },
        { provide: Router, useValue: router },
      ],
    });

    const result = TestBed.runInInjectionContext(() => roleGuard(['Admin'])({} as never, {} as never));

    expect(result).toBe(dashboardTree);
    expect(router.createUrlTree).toHaveBeenCalledOnceWith(['/dashboard']);
  });

  it('allows an administrator into an admin-only route', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { user: () => ({ role: 'Admin' }) } },
        { provide: Router, useValue: jasmine.createSpyObj<Router>('Router', ['createUrlTree']) },
      ],
    });

    const result = TestBed.runInInjectionContext(() => roleGuard(['Admin'])({} as never, {} as never));

    expect(result).toBeTrue();
  });
});
