import { TestBed } from '@angular/core/testing';
import { AuthService } from '@/core/auth/auth.service';
import { ApiService } from '@/core/http/api.service';
import { ClientsService } from '@/features/clients/data-access/clients.service';

describe('ClientsService', () => {
  it('uses the repaired JSON update endpoint with the client ID in the query', async () => {
    const api = jasmine.createSpyObj<ApiService>('ApiService', ['get', 'post', 'put', 'delete']);
    api.put.and.resolveTo({
      message: 'updated',
      data: {
        id: 'client-id', name: 'Client', email: 'client@example.com', description: null,
        address: null, contactInfo: 'Contact', defaultContactID: null, defaultContactName: null,
      },
    });
    TestBed.configureTestingModule({
      providers: [
        ClientsService,
        { provide: ApiService, useValue: api },
        { provide: AuthService, useValue: { isAdmin: () => true, user: () => null } },
      ],
    });
    const service = TestBed.inject(ClientsService);

    await service.update('client-id', {
      name: 'Client', email: 'client@example.com', description: null, address: null,
      contactInfo: 'Contact', defaultContactID: null,
    });

    expect(service.updatesAvailable).toBeTrue();
    expect(api.put).toHaveBeenCalledOnceWith('/Client/UpdateClient', jasmine.any(Object), { ID: 'client-id' });
  });
});
