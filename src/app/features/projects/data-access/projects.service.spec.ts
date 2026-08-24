import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '@/core/auth/auth.service';
import { ApiService } from '@/core/http/api.service';
import { ClientsService } from '@/features/clients/data-access/clients.service';
import { ProjectsService } from '@/features/projects/data-access/projects.service';

describe('ProjectsService', () => {
  let api: jasmine.SpyObj<ApiService>;
  let clients: jasmine.SpyObj<ClientsService>;

  beforeEach(() => {
    api = jasmine.createSpyObj<ApiService>('ApiService', ['get', 'post', 'put', 'delete']);
    clients = jasmine.createSpyObj<ClientsService>('ClientsService', ['loadAll', 'getById'], {
      clients: signal([]),
    });
    clients.loadAll.and.resolveTo([]);
    TestBed.configureTestingModule({
      providers: [
        ProjectsService,
        { provide: ApiService, useValue: api },
        { provide: ClientsService, useValue: clients },
        { provide: AuthService, useValue: { isAdmin: () => true, user: () => null } },
      ],
    });
  });

  it('loads the project DTOs returned by the repaired backend contract', async () => {
    api.get.and.resolveTo([{
      id: 'project-id', name: 'Project', description: 'Description', scope: 'Scope',
      clientID: 'client-id', client: null, state: 0,
    }]);
    const service = TestBed.inject(ProjectsService);

    const projects = await service.loadAll();

    expect(projects[0].name).toBe('Project');
    expect(service.writesAvailable).toBeTrue();
    expect(api.get).toHaveBeenCalledOnceWith('/Project/GetAllProjects', { ClientID: undefined });
  });

  it('uses query-string IDs for project updates in the fetched backend routes', async () => {
    api.put.and.resolveTo({
      message: 'updated',
      data: {
        id: 'project-id', name: 'Project', description: 'Description', scope: 'Scope',
        clientID: 'client-id', client: null, state: 0,
      },
    });
    const service = TestBed.inject(ProjectsService);

    await service.update('project-id', {
      name: 'Project', description: 'Description', scope: 'Scope', clientID: 'client-id', state: 0,
    });

    expect(api.put).toHaveBeenCalledOnceWith('/Project/UpdateProject', jasmine.any(Object), { ID: 'project-id' });
  });

  it('sends project creation now that the backend has a CreateProjectDto mapping', async () => {
    api.post.and.resolveTo({
      message: 'created',
      data: {
        id: 'project-id', name: 'Project', description: 'Description', scope: 'Scope',
        clientID: 'client-id', client: null, state: 0,
      },
    });
    const service = TestBed.inject(ProjectsService);

    await service.create({
      name: 'Project', description: 'Description', scope: 'Scope', clientID: 'client-id', state: 0,
    });

    expect(api.post).toHaveBeenCalledOnceWith('/Project/AddProject', jasmine.any(Object));
  });
});
