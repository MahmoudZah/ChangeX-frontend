import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CrsService } from '@/features/change-requests/data-access/crs.service';
import { StatusesService } from '@/features/change-requests/data-access/statuses.service';
import { ApprovalsListComponent } from '@/features/change-requests/feature-approvals-list/approvals-list.component';

describe('ApprovalsListComponent', () => {
  it('routes Rework through the context form instead of changing status directly', async () => {
    const crs = jasmine.createSpyObj<CrsService>('CrsService', ['loadAll', 'changeStatus'], {
      pendingApprovals: signal([]), loading: signal(false), error: signal(''), lastMessage: signal(''),
    });
    crs.loadAll.and.resolveTo([]);
    const statuses = jasmine.createSpyObj<StatusesService>('StatusesService', ['loadForCr', 'getAvailableForCr']);
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    router.navigate.and.resolveTo(true);
    await TestBed.configureTestingModule({
      imports: [ApprovalsListComponent],
      providers: [
        { provide: CrsService, useValue: crs },
        { provide: StatusesService, useValue: statuses },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();
    const component = TestBed.createComponent(ApprovalsListComponent).componentInstance;

    await component.change('cr-id', { id: 'rework-id', label: 'Rework Required' });

    expect(crs.changeStatus).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledOnceWith(
      ['/change-requests', 'cr-id'],
      { state: { openRework: true } },
    );
  });
});
