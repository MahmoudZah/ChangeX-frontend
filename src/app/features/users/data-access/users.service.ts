import { Injectable, inject, signal } from '@angular/core';
import { ApiEnvelope, ApiMessage, apiErrorMessage } from '@/core/http/api-contract';
import { ApiService } from '@/core/http/api.service';
import { ClientUser, User, UserAccountDto, UserDto, UserInClientDto } from '@/features/users/data-access/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private api = inject(ApiService);
  private _users = signal<User[]>([]);
  private _clientUsers = signal<Record<string, ClientUser[]>>({});
  private _loading = signal(false);
  private _error = signal('');
  private _lastMessage = signal('');

  readonly users = this._users.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly lastMessage = this._lastMessage.asReadonly();

  async loadAll(query?: string, systemRole?: boolean): Promise<User[]> {
    this._loading.set(true);
    this._error.set('');
    try {
      const response = await this.api.get<UserAccountDto[]>('/User/GetAllUsers', { query, systemRole });
      const users = response.map((item) => this.normalize(item));
      this._users.set(users);
      return users;
    } catch (error) {
      this._users.set([]);
      this._error.set(apiErrorMessage(error, 'Users could not be loaded from the API.'));
      return [];
    } finally {
      this._loading.set(false);
    }
  }

  getById(id: string): User | undefined {
    return this._users().find((user) => user.id === id);
  }

  async loadById(id: string): Promise<User | null> {
    this._error.set('');
    try {
      const response = await this.api.get<UserAccountDto>(`/User/GetUser/${id}`);
      const user = this.normalize(response);
      this._users.update((current) => [...current.filter((item) => item.id !== id), user]);
      return user;
    } catch (error) {
      if ((error as { status?: number }).status === 404) return null;
      this._error.set(apiErrorMessage(error, 'The user could not be loaded from the API.'));
      throw error;
    }
  }

  async loadForClient(clientId: string, query?: string): Promise<ClientUser[]> {
    this._error.set('');
    try {
      const response = await this.api.get<UserInClientDto[]>(`/User/GetAllUsersClient/${clientId}`, { query });
      const users = response.map((item) => ({ ...item, key: item.email.toLowerCase() }));
      this._clientUsers.update((current) => ({ ...current, [clientId]: users }));
      return users;
    } catch (error) {
      this._clientUsers.update((current) => ({ ...current, [clientId]: [] }));
      this._error.set(apiErrorMessage(error, 'Client users could not be loaded from the API.'));
      return [];
    }
  }

  usersForClient(clientId: string): ClientUser[] {
    return this._clientUsers()[clientId] ?? [];
  }

  async create(dto: UserDto): Promise<User> {
    this._lastMessage.set('');
    const response = await this.api.post<ApiEnvelope<UserAccountDto>>('/User/AddUser', dto);
    const user = this.normalize(response.data);
    this._users.update((current) => [...current, user]);
    this._lastMessage.set(response.message);
    return user;
  }

  async update(id: string, dto: UserDto): Promise<User> {
    this._lastMessage.set('');
    const response = await this.api.put<ApiEnvelope<UserAccountDto>>('/User/UpdateUser', dto, { ID: id });
    const user = this.normalize(response.data);
    this._users.update((current) => current.map((item) => item.id === id ? user : item));
    this._lastMessage.set(response.message);
    return user;
  }

  async delete(id: string): Promise<string> {
    this._lastMessage.set('');
    const response = await this.api.delete<ApiMessage>('/User/DeleteUser', { ID: id });
    this._users.update((current) => current.filter((user) => user.id !== id));
    this._lastMessage.set(response.message);
    return response.message;
  }

  private normalize(raw: UserAccountDto): User {
    return {
      id: raw.id,
      name: raw.name,
      email: raw.email,
      phoneNumber: raw.phoneNumber,
      systemRole: raw.systemRole,
      clientId: raw.clientID,
      company: raw.clientName,
      accountType: raw.systemRole ? 'System administrator' : 'Client account',
    };
  }
}
