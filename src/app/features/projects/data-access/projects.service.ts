import { Injectable, inject, signal } from '@angular/core';
import { ApiEnvelope, SerializedTask, apiErrorMessage } from '@/core/http/api-contract';
import { ApiService } from '@/core/http/api.service';
import { ClientsService } from '@/features/clients/data-access/clients.service';
import { Project, ProjectDto, ProjectResponseDto, ProjectState } from '@/features/projects/data-access/project.model';

type ProjectTaskEnvelope<T> = ApiEnvelope<SerializedTask<T>>;

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private api = inject(ApiService);
  private clients = inject(ClientsService);
  private _projects = signal<Project[]>([]);
  private _loading = signal(false);
  private _error = signal('');
  private _lastMessage = signal('');

  readonly projects = this._projects.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly lastMessage = this._lastMessage.asReadonly();

  async loadAll(clientId?: string): Promise<Project[]> {
    this._loading.set(true);
    this._error.set('');
    try {
      const [response] = await Promise.all([
        this.api.get<ProjectTaskEnvelope<ProjectResponseDto[]>>('/ProjectAdmin'),
        this.clients.loadAll(),
      ]);
      const projects = response.data.result.map((item) => this.normalize(item));
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
      const response = await this.api.get<ProjectTaskEnvelope<ProjectResponseDto | null>>(`/ProjectAdmin/${id}`);
      if (!response.data.result) return null;
      const project = this.normalize(response.data.result);
      this._projects.update((current) => [...current.filter((item) => item.id !== id), project]);
      return project;
    } catch (error) {
      this._error.set(apiErrorMessage(error, 'The project could not be loaded from the API.'));
      throw error;
    }
  }

  async create(dto: ProjectDto): Promise<Project> {
    this._lastMessage.set('');
    const response = await this.api.post<ProjectTaskEnvelope<ProjectResponseDto>>('/ProjectAdmin', dto);
    const project = this.normalize(response.data.result);
    this._projects.update((current) => [...current, project]);
    this._lastMessage.set(response.message);
    return project;
  }

  async update(id: string, dto: ProjectDto): Promise<Project> {
    this._lastMessage.set('');
    const response = await this.api.put<ProjectTaskEnvelope<ProjectResponseDto | null>>(`/ProjectAdmin/${id}`, dto);
    if (!response.data.result) throw new Error('The project no longer exists.');
    const project = this.normalize(response.data.result);
    this._projects.update((current) => current.map((item) => item.id === id ? project : item));
    this._lastMessage.set(response.message);
    return project;
  }

  async delete(id: string): Promise<string> {
    this._lastMessage.set('');
    let controllerError: unknown;
    try {
      await this.api.delete<ApiEnvelope<never>>(`/ProjectAdmin/${id}`);
    } catch (error) {
      controllerError = error;
      if ((error as { status?: number }).status !== 404) throw error;
    }

    const projects = await this.loadAll();
    if (this._error()) throw controllerError ?? new Error(this._error());
    if (projects.some((project) => project.id === id)) {
      throw controllerError ?? new Error('The API did not delete the project.');
    }

    const message = 'Project deleted successfully.';
    this._lastMessage.set(message);
    return message;
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
