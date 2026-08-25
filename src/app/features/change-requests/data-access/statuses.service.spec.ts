import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ApiService } from '@/core/http/api.service';
import { StatusesService } from '@/features/change-requests/data-access/statuses.service';

describe('StatusesService', () => {
  let api: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    api = jasmine.createSpyObj<ApiService>('ApiService', ['get']);
    TestBed.configureTestingModule({
      providers: [StatusesService, { provide: ApiService, useValue: api }],
    });
  });

  it('uses transition IDs and names returned by the API without frontend workflow labels', async () => {
    const available = [
      { id: 'accepted-id', currentStatus: 'Accepted (CR)' },
      { id: 'rejected-id', currentStatus: 'Rejected' },
      { id: 'clarification-id', currentStatus: 'Pending Client Clarification' },
    ];
    api.get.and.callFake(((path: string) => Promise.resolve(path.includes('/AvailableCRStatus/')
      ? { message: 'ok', data: available }
      : {
          message: 'ok',
          data: {
            id: 'current-id',
            currentStatus: 'Pending Vendor FeedBack',
            availableStatusIDs: available.map((status) => status.id).join(','),
            accessedBy: 'Admin',
          },
        })) as ApiService['get']);

    const service = TestBed.inject(StatusesService);
    const result = await service.loadForCr('cr-id');

    expect(result).toEqual([
      { id: 'accepted-id', label: 'Accepted (CR)' },
      { id: 'rejected-id', label: 'Rejected' },
      { id: 'clarification-id', label: 'Pending Client Clarification' },
    ]);
    expect(api.get.calls.allArgs().map((args) => args[0])).toContain('/Status/AvailableCRStatus/cr-id');
    expect(service.canAct('cr-id', 'Admin')).toBeTrue();
    expect(service.canAct('cr-id', 'User')).toBeFalse();
  });

  it('keeps successful current statuses when another status request fails', async () => {
    api.get.and.callFake(((path: string) => path.endsWith('/good')
      ? Promise.resolve({
          message: 'ok',
          data: { id: 'status-id', currentStatus: 'Analysis', availableStatusIDs: null, accessedBy: 'Admin' },
        })
      : Promise.reject(new HttpErrorResponse({ status: 503 }))) as ApiService['get']);

    const service = TestBed.inject(StatusesService);
    await service.loadCurrentForCrs(['good', 'bad']);

    expect(service.getCurrentForCr('good')?.currentStatus).toBe('Analysis');
    expect(service.getCurrentForCr('bad')).toBeUndefined();
    expect(service.error()).toContain('Cannot connect');
  });

  it('uses the current status ID list as authority and preserves its transition order', async () => {
    const available = [
      { id: 'rework-id', currentStatus: 'Rework Required' },
      { id: 'rejected-id', currentStatus: 'Rejected' },
      { id: 'accepted-id', currentStatus: 'Accepted (Test)' },
    ];
    api.get.and.callFake(((path: string) => Promise.resolve(path.includes('/AvailableCRStatus/')
      ? { message: 'ok', data: available }
      : {
          message: 'ok',
          data: {
            id: 'current-id', currentStatus: 'Pending Customer Approval',
            availableStatusIDs: 'accepted-id,rework-id', accessedBy: 'Client',
          },
        })) as ApiService['get']);

    const service = TestBed.inject(StatusesService);
    const transitions = await service.loadForCr('cr-id');

    expect(transitions).toEqual([
      { id: 'accepted-id', label: 'Accepted (Test)' },
      { id: 'rework-id', label: 'Rework Required' },
    ]);
    expect(service.getAvailableForCr('cr-id')).toEqual(transitions);
    expect(service.canTransition('cr-id', 'accepted-id', 'User')).toBeTrue();
    expect(service.canTransition('cr-id', 'rejected-id', 'User')).toBeFalse();
    expect(service.canTransition('cr-id', 'accepted-id', 'Admin')).toBeFalse();
    expect(service.canTransition('cr-id', 'accepted-id', undefined)).toBeFalse();
  });

  it('rejects the old string-only transition contract instead of creating undefined actions', async () => {
    api.get.and.callFake(((path: string) => Promise.resolve(path.includes('/AvailableCRStatus/')
      ? { message: 'ok', data: ['accepted-id', 'rejected-id'] }
      : {
          message: 'ok',
          data: {
            id: 'current-id', currentStatus: 'Pending Vendor FeedBack',
            availableStatusIDs: 'accepted-id,rejected-id', accessedBy: 'Admin',
          },
        })) as ApiService['get']);

    const service = TestBed.inject(StatusesService);
    const transitions = await service.loadForCr('cr-id');

    expect(transitions).toEqual([]);
    expect(service.error()).toContain('invalid available-status response');
  });
});
