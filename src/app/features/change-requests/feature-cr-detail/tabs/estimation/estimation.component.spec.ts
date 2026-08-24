import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeRequest } from '@/features/change-requests/data-access/cr.model';
import { CrsService } from '@/features/change-requests/data-access/crs.service';
import {
  EstimationComponent,
  validateEstimateDraft,
} from '@/features/change-requests/feature-cr-detail/tabs/estimation/estimation.component';

describe('EstimationComponent', () => {
  let fixture: ComponentFixture<EstimationComponent>;
  let component: EstimationComponent;
  let crs: jasmine.SpyObj<CrsService>;

  beforeEach(async () => {
    crs = jasmine.createSpyObj<CrsService>('CrsService', ['updateEstimate'], {
      lastMessage: signal('Estimate saved.'),
    });
    await TestBed.configureTestingModule({
      imports: [EstimationComponent],
      providers: [{ provide: CrsService, useValue: crs }],
    }).compileComponents();
    fixture = TestBed.createComponent(EstimationComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('cr', changeRequest());
    fixture.componentRef.setInput('canEdit', true);
    fixture.detectChanges();
  });

  it('blocks save and preserves values when required estimation data is missing', async () => {
    component.hours = 12;
    component.rate = 0;
    component.startDate = '';
    component.finishDate = '';

    await component.save();

    expect(crs.updateEstimate).not.toHaveBeenCalled();
    expect(component.hours).toBe(12);
    expect(component.fieldError('rate')).toContain('greater than 0');
    expect(component.fieldError('startDate')).toContain('required');
  });

  it('blocks a finish date before the start date', async () => {
    component.hours = 12;
    component.rate = 75;
    component.startDate = '2026-09-10';
    component.finishDate = '2026-09-09';

    await component.save();

    expect(crs.updateEstimate).not.toHaveBeenCalled();
    expect(component.fieldError('finishDate')).toContain('on or after');
  });

  it('submits the exact estimate DTO when every required field is valid', async () => {
    const updated = changeRequest({
      estimatedHours: 12,
      estimatedManHour: 12,
      hourlyRate: 75,
      manHourRate: 75,
      startDate: '2026-09-10',
      finishDate: '2026-09-12',
    });
    crs.updateEstimate.and.resolveTo(updated);
    const saved = jasmine.createSpy('saved');
    component.saved.subscribe(saved);
    component.hours = 12;
    component.rate = 75;
    component.startDate = '2026-09-10';
    component.finishDate = '2026-09-12';

    await component.save();

    expect(crs.updateEstimate).toHaveBeenCalledOnceWith('cr-id', {
      estimatedManHour: 12,
      manHourRate: 75,
      startDate: '2026-09-10',
      finishDate: '2026-09-12',
    });
    expect(saved).toHaveBeenCalledOnceWith(updated);
  });
});

describe('validateEstimateDraft', () => {
  it('rejects a partially completed estimate', () => {
    expect(validateEstimateDraft({ hours: 3, rate: 0, startDate: '2026-09-10', finishDate: '' })).toEqual({
      rate: 'Man hour rate must be greater than 0.',
      finishDate: 'Finish date is required.',
    });
  });

  it('accepts a complete valid estimate', () => {
    expect(validateEstimateDraft({
      hours: 3,
      rate: 80,
      startDate: '2026-09-10',
      finishDate: '2026-09-11',
    })).toEqual({});
  });
});

function changeRequest(overrides: Partial<ChangeRequest> = {}): ChangeRequest {
  return {
    id: 'cr-id', name: 'CR', title: 'CR', code: 'CR-1', priority: 'High', scope: ['Scope'],
    description: 'Description', estimatedManHour: 0, estimatedHours: 0, hourlyRate: 0,
    manHourRate: 0, totalCost: 0, estimatedCost: 0, startDate: '', finishDate: '',
    expectedStart: '', expectedDelivery: '', currentStatusID: 'status-id',
    currentStatusName: 'Accepted (CR)', status: 'Accepted (CR)', stage: 'Scheduled',
    projectID: 'project-id', projectId: 'project-id', projectName: 'Project', clientId: '',
    clientName: '', daysOpen: 0, ...overrides,
  };
}
