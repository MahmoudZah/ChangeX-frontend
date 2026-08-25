import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { AuthService } from '@/core/auth/auth.service';
import { ChangeRequest } from '@/features/change-requests/data-access/cr.model';
import { CrsService } from '@/features/change-requests/data-access/crs.service';
import { DetailsService } from '@/features/change-requests/data-access/details.service';
import { StatusTransition } from '@/features/change-requests/data-access/status.model';
import { StatusesService } from '@/features/change-requests/data-access/statuses.service';
import { CrDetailComponent } from '@/features/change-requests/feature-cr-detail/cr-detail.component';
import { CR_STATUS_IDS } from '@/shared/util/cr-status-workflow';

describe('CrDetailComponent estimation navigation', () => {
  const nextStatus: StatusTransition = { id: CR_STATUS_IDS.estimationCreated, label: 'Estimation Created' };
  let fixture: ComponentFixture<CrDetailComponent>;
  let component: CrDetailComponent;
  let crs: jasmine.SpyObj<CrsService>;
  let details: jasmine.SpyObj<DetailsService>;

  beforeEach(async () => {
    crs = jasmine.createSpyObj<CrsService>('CrsService', ['getById', 'changeStatus', 'updateEstimate', 'delete'], {
      lastMessage: signal('updated'),
    });
    crs.getById.and.resolveTo(changeRequest());
    crs.changeStatus.and.resolveTo(changeRequest({ currentStatusName: 'Pending Client Approval' }));
    details = jasmine.createSpyObj<DetailsService>('DetailsService', ['loadFor', 'detailsFor', 'createReworkContext'], {
      details: signal([]), loading: signal(false), error: signal(''), lastMessage: signal(''),
    });
    details.loadFor.and.resolveTo([]);
    details.detailsFor.and.returnValue([]);
    details.createReworkContext.and.resolveTo([]);
    const statuses = jasmine.createSpyObj<StatusesService>('StatusesService', [
      'getAvailableForCr', 'getCurrentForCr', 'canAct',
    ], { error: signal('') });
    statuses.getAvailableForCr.and.returnValue([nextStatus]);
    statuses.getCurrentForCr.and.returnValue({
      id: CR_STATUS_IDS.acceptedCr, currentStatus: 'Accepted (CR)', availableStatusIDs: nextStatus.id,
      accessedBy: 'Admin',
    });
    statuses.canAct.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [CrDetailComponent],
      providers: [
        provideRouter([]),
        { provide: CrsService, useValue: crs },
        { provide: DetailsService, useValue: details },
        { provide: StatusesService, useValue: statuses },
        { provide: AuthService, useValue: { isAdmin: () => true, user: () => ({ role: 'Admin' }) } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'cr-id' } } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CrDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('blocks tab navigation and direct status changes while estimation is invalid', async () => {
    expect(component.tab()).toBe('estimate');

    component.selectTab('overview');
    await component.changeTo(nextStatus);

    expect(component.tab()).toBe('estimate');
    expect(component.error()).toContain('required estimation fields');
    expect(crs.changeStatus).not.toHaveBeenCalled();
  });

  it('allows navigation after a complete valid estimate has been persisted', () => {
    component.cr.set(changeRequest({
      estimatedManHour: 8,
      estimatedHours: 8,
      manHourRate: 50,
      hourlyRate: 50,
      startDate: '2026-09-10',
      finishDate: '2026-09-11',
    }));

    component.selectTab('overview');

    expect(component.tab()).toBe('overview');
    expect(component.error()).toBe('');
  });

  it('saves Rework context before changing to the Rework status', async () => {
    const rework = { id: CR_STATUS_IDS.reworkRequired, label: 'Rework Required' };
    const file = new File(['support'], 'support.png', { type: 'image/png' });
    const sequence: string[] = [];
    details.createReworkContext.and.callFake(async () => {
      sequence.push('context');
      return [];
    });
    crs.changeStatus.and.callFake(async () => {
      sequence.push('status');
      return changeRequest({ currentStatusName: 'Rework Required' });
    });
    component.cr.set(changeRequest({
      estimatedManHour: 8, estimatedHours: 8, manHourRate: 50, hourlyRate: 50,
      startDate: '2026-09-10', finishDate: '2026-09-11',
    }));
    component.reworkTarget.set(rework);

    await component.submitRework({ message: 'Please revise this.', files: [file] });

    expect(details.createReworkContext).toHaveBeenCalledOnceWith('cr-id', 'Please revise this.', [file]);
    expect(crs.changeStatus).toHaveBeenCalledOnceWith('cr-id', CR_STATUS_IDS.reworkRequired);
    expect(sequence).toEqual(['context', 'status']);
  });
});

function changeRequest(overrides: Partial<ChangeRequest> = {}): ChangeRequest {
  return {
    id: 'cr-id', name: 'CR', title: 'CR', code: 'CR-1', priority: 'High', scope: ['Scope'],
    description: 'Description', estimatedManHour: 0, estimatedHours: 0, hourlyRate: 0,
    manHourRate: 0, totalCost: 0, estimatedCost: 0, startDate: '', finishDate: '',
    expectedStart: '', expectedDelivery: '', currentStatusID: CR_STATUS_IDS.acceptedCr,
    currentStatusName: 'Accepted (CR)', status: 'Accepted (CR)', stage: 'Estimation & Approval',
    projectID: 'project-id', projectId: 'project-id', projectName: 'Project', clientId: '',
    clientName: '', daysOpen: 0, ...overrides,
  };
}
