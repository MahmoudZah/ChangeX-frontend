import { TestBed } from '@angular/core/testing';
import { AuthService, AuthUser } from '@/core/auth/auth.service';
import { ApiService } from '@/core/http/api.service';
import { CRResponseDto } from '@/features/change-requests/data-access/cr.model';
import { CrsService } from '@/features/change-requests/data-access/crs.service';
import { StatusesService } from '@/features/change-requests/data-access/statuses.service';

describe('CrsService', () => {
  const crId = '11111111-1111-1111-1111-111111111111';
  const clientId = '22222222-2222-2222-2222-222222222222';
  let admin = false;
  let api: jasmine.SpyObj<ApiService>;
  let statuses: jasmine.SpyObj<StatusesService>;

  const user: AuthUser = {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Client User',
    email: 'client@example.com',
    role: 'User',
    company: 'Client workspace',
    clientId,
    phoneNumber: '',
  };

  beforeEach(() => {
    admin = false;
    api = jasmine.createSpyObj<ApiService>('ApiService', ['get', 'post', 'put', 'delete']);
    statuses = jasmine.createSpyObj<StatusesService>('StatusesService', [
      'loadCurrentForCrs', 'loadForCr', 'getCurrentForCr',
    ]);
    statuses.loadCurrentForCrs.and.resolveTo();
    statuses.loadForCr.and.resolveTo([]);
    statuses.getCurrentForCr.and.returnValue({
      id: '44444444-4444-4444-4444-444444444444',
      currentStatus: 'Pending Client Clarification',
      availableStatusIDs: null,
      accessedBy: 'Client',
    });

    TestBed.configureTestingModule({
      providers: [
        CrsService,
        { provide: ApiService, useValue: api },
        { provide: StatusesService, useValue: statuses },
        {
          provide: AuthService,
          useValue: {
            isAdmin: () => admin,
            user: () => admin ? { ...user, role: 'Admin' as const } : user,
          },
        },
      ],
    });
  });

  it('scopes regular-user lists by the JWT client and uses the status name in the CR response', async () => {
    api.get.and.resolveTo({ message: 'ok', data: [rawCr()] });

    const result = await TestBed.inject(CrsService).loadAll();

    expect(api.get).toHaveBeenCalledOnceWith('/CR/GetAllCRs', {
      projectID: undefined,
      ClientID: clientId,
      statusId: undefined,
      name: undefined,
    });
    expect(statuses.loadCurrentForCrs).not.toHaveBeenCalled();
    expect(result[0].status).toBe('Pending Vendor FeedBack');
    expect(result[0].clientId).toBe(clientId);
    expect(result[0].projectName).toBe('Contract Project');
  });

  it('loads a status name from the status endpoint when CRResponseDto leaves it empty', async () => {
    let currentStatus = undefined as ReturnType<StatusesService['getCurrentForCr']>;
    statuses.getCurrentForCr.and.callFake(() => currentStatus);
    statuses.loadCurrentForCrs.and.callFake(async () => {
      currentStatus = {
        id: '44444444-4444-4444-4444-444444444444',
        currentStatus: 'Pending Client Clarification',
        availableStatusIDs: null,
        accessedBy: 'Client',
      };
    });
    api.get.and.resolveTo({ message: 'ok', data: [{ ...rawCr(), currentStatusName: '' }] });

    const result = await TestBed.inject(CrsService).loadAll();

    expect(statuses.loadCurrentForCrs).toHaveBeenCalledOnceWith([crId]);
    expect(result[0].status).toBe('Pending Client Clarification');
  });

  it('authorizes a regular-user detail through the scoped collection without calling the unsafe ID endpoint', async () => {
    api.get.and.resolveTo({ message: 'ok', data: [rawCr()] });

    const result = await TestBed.inject(CrsService).getById(crId);

    expect(result?.id).toBe(crId);
    expect(api.get.calls.allArgs().map((args) => args[0])).toEqual(['/CR/GetAllCRs']);
    expect(statuses.loadForCr).toHaveBeenCalledOnceWith(crId, true);
  });

  it('returns not found for a regular user when the ID is absent from the client-scoped collection', async () => {
    api.get.and.resolveTo({ message: 'ok', data: [] });

    const result = await TestBed.inject(CrsService).getById(crId);

    expect(result).toBeNull();
    expect(statuses.loadForCr).not.toHaveBeenCalled();
  });

  it('uses the direct detail endpoint for an administrator and refreshes workflow state', async () => {
    admin = true;
    api.get.and.resolveTo({ message: 'ok', data: rawCr() });

    const result = await TestBed.inject(CrsService).getById(crId);

    expect(result?.id).toBe(crId);
    expect(api.get).toHaveBeenCalledOnceWith(`/CR/GetCR/${crId}`);
    expect(statuses.loadForCr).toHaveBeenCalledOnceWith(crId, true);
  });

  function rawCr(): CRResponseDto {
    return {
      id: crId,
      name: 'Contract change',
      priority: 'High',
      scope: 'API, UI',
      description: 'Regression fixture',
      estimatedManHour: 4,
      manHourRate: 100,
      startDate: '2026-08-24',
      finishDate: '2026-08-25',
      currentStatusID: '44444444-4444-4444-4444-444444444444',
      currentStatusName: 'Pending Vendor FeedBack',
      projectID: '55555555-5555-5555-5555-555555555555',
      projectName: 'Contract Project',
    };
  }
});
