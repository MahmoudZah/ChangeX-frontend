import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from '@/core/auth/auth.service';
import { ApiEnvelope, ApiMessage, apiErrorMessage } from '@/core/http/api-contract';
import { ApiService } from '@/core/http/api.service';
import { Client, ClientDto, ClientResponseDto } from '@/features/clients/data-access/client.model';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private _clients = signal<Client[]>([]);
  private _loading = signal(false);
  private _error = signal('');
  private _lastMessage = signal('');

  readonly clients = this._clients.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly lastMessage = this._lastMessage.asReadonly();
  readonly updatesAvailable = true;
  readonly updateUnavailableMessage = '';

  async loadAll(): Promise<Client[]> {
    this._loading.set(true);
    this._error.set('');
    try {
      const currentClientId = this.auth.user()?.clientId;
      const clients = this.auth.isAdmin()
        ? (await this.api.get<ApiEnvelope<ClientResponseDto[]>>('/Client/GetAllClients')).data.map((item) => this.normalize(item))
        : currentClientId
          ? [this.normalize((await this.api.get<ApiEnvelope<ClientResponseDto>>(`/Client/GetClient/${currentClientId}`)).data)]
          : [];
      this._clients.set(clients);
      return clients;
    } catch (error) {
      this._clients.set([]);
      this._error.set(apiErrorMessage(error, 'Clients could not be loaded from the API.'));
      return [];
    } finally {
      this._loading.set(false);
    }
  }

  getById(id: string): Client | undefined {
    return this._clients().find((client) => client.id === id);
  }

  async loadById(id: string): Promise<Client | null> {
    this._error.set('');
    try {
      if (this.auth.isAdmin()) {
        const cached = this.getById(id);
        if (cached) return cached;
        const clients = await this.loadAll();
        if (this._error()) throw new Error(this._error());
        return clients.find((client) => client.id === id) ?? null;
      }

      if (id !== this.auth.user()?.clientId) return null;
      const response = await this.api.get<ApiEnvelope<ClientResponseDto>>(`/Client/GetClient/${id}`);
      const client = this.normalize(response.data);
      this._clients.update((current) => [...current.filter((item) => item.id !== id), client]);
      return client;
    } catch (error) {
      if ((error as { status?: number }).status === 404) return null;
      this._error.set(apiErrorMessage(error, 'The client could not be loaded from the API.'));
      throw error;
    }
  }

  async create(dto: ClientDto): Promise<Client> {
    this._lastMessage.set('');
    const response = await this.api.post<ApiEnvelope<ClientResponseDto>>('/Client/AddClient', dto);
    const client = this.normalize(response.data);
    this._clients.update((current) => [...current, client]);
    this._lastMessage.set(response.message);
    return client;
  }

  async update(id: string, dto: ClientDto): Promise<Client> {
    this._lastMessage.set('');
    const response = await this.api.put<ApiEnvelope<ClientResponseDto>>('/Client/UpdateClient', dto, { ID: id });
    const client = this.normalize(response.data);
    this._clients.update((current) => current.map((item) => item.id === id ? client : item));
    this._lastMessage.set(response.message);
    return client;
  }

  async delete(id: string): Promise<string> {
    this._lastMessage.set('');
    const response = await this.api.delete<ApiMessage>('/Client/DeleteClient', { ID: id });
    this._clients.update((current) => current.filter((client) => client.id !== id));
    this._lastMessage.set(response.message);
    return response.message;
  }

  private normalize(raw: ClientResponseDto): Client {
    return {
      id: raw.id,
      name: raw.name,
      email: raw.email,
      description: raw.description ?? '',
      address: raw.address ?? '',
      contactInfo: raw.contactInfo,
      defaultContactId: raw.defaultContactID,
      defaultContactName: raw.defaultContactName,
    };
  }
}
