import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from '@/core/auth/auth.service';
import { ApiEnvelope, ApiMessage, apiErrorMessage } from '@/core/http/api-contract';
import { ApiService } from '@/core/http/api.service';
import { ClientsService } from '@/features/clients/data-access/clients.service';
import { Project, ProjectDto, ProjectResponseDto, ProjectState } from '@/features/projects/data-access/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private clients = inject(ClientsService);
  private _projects = signal<Project[]>([]);
  private _loading = signal(false);
  private _error = signal('');
  private _lastMessage = signal('');

  readonly projects = this._projects.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly lastMessage = this._lastMessage.asReadonly();
  readonly writesAvailable = true;
  readonly unavailableMessage = '';

  async loadAll(clientId?: string): Promise<Project[]> {
    this._loading.set(true);
    this._error.set('');
    try {
      const requestedClientId = clientId ?? (this.auth.isAdmin() ? undefined : this.auth.user()?.clientId);
      const clientsRequest = this.clients.clients().length
        ? Promise.resolve(this.clients.clients())
        : this.clients.loadAll();
      const [response] = await Promise.all([
        this.api.get<ProjectResponseDto[]>('/Project/GetAllProjects', { ClientID: requestedClientId }),
        clientsRequest,
      ]);
      const authenticatedClientId = this.auth.user()?.clientId;
      const projects = response
        .map((item) => this.normalize(item))
        .filter((project) => this.auth.isAdmin() || project.clientId === authenticatedClientId);
      this._projects.set(projects);
      return clientId ? projects.filter((project) => project.clientId === clientId) : projects;
    } catch (error) {
      this._projects.set([]);
      this._error.set(apiErrorMessage(error, 'Projects could not be loaded from the API.'));
      return [];
    } finally {
      this._loading.set(false);
    }
  }

  getById(id: string): Project | undefined {
    return this._projects().find((project) => project.id === id);
  }

  async loadById(id: string): Promise<Project | null> {
    this._error.set('');
    try {
      if (!this.clients.clients().length) await this.clients.loadAll();
      const response = await this.api.get<ProjectResponseDto>(`/Project/GetProject/${id}`);
      const project = this.normalize(response);
      if (!this.auth.isAdmin() && project.clientId !== this.auth.user()?.clientId) return null;
      this._projects.update((current) => [...current.filter((item) => item.id !== id), project]);
      return project;
    } catch (error) {
      if ((error as { status?: number }).status === 404) return null;
      const message = apiErrorMessage(error, 'The project could not be loaded from the API.');
      this._error.set(message);
      throw new Error(message, { cause: error });
    }
  }

  async create(dto: ProjectDto): Promise<Project> {
    this._lastMessage.set('');
    const response = await this.api.post<ApiEnvelope<ProjectResponseDto>>('/Project/AddProject', dto);
    const project = this.normalize(response.data);
    this._projects.update((current) => [...current, project]);
    this._lastMessage.set(response.message);
    return project;
  }

  async update(id: string, dto: ProjectDto): Promise<Project> {
    this._lastMessage.set('');
    const response = await this.api.put<ApiEnvelope<ProjectResponseDto>>('/Project/UpdateProject', dto, { ID: id });
    const project = this.normalize(response.data);
    this._projects.update((current) => current.map((item) => item.id === id ? project : item));
    this._lastMessage.set(response.message);
    return project;
  }

  async delete(id: string): Promise<string> {
    this._lastMessage.set('');
    const response = await this.api.delete<ApiMessage>('/Project/DeleteProject', { ID: id });
    this._projects.update((current) => current.filter((project) => project.id !== id));
    this._lastMessage.set(response.message);
    return response.message;
  }

  private normalize(raw: ProjectResponseDto): Project {
    return {
      id: raw.id,
      name: raw.name,
      description: raw.description,
      scope: raw.scope,
      clientId: raw.clientID,
      clientName: this.clients.getById(raw.clientID)?.name ?? '',
      state: this.normalizeState(raw.state),
    };
  }

  private normalizeState(value: number): ProjectState {
    if (value === 1) return 'Completed';
    if (value === 2) return 'Canceled';
    return 'Active';
  }
}
