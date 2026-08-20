import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiService } from '@/core/http/api.service';
import { ChangeRequest, CRDto } from '@/features/change-requests/data-access/cr.model';

interface ApiResponse<T> {
  message?: string;
  data?: T;
}

@Injectable({ providedIn: 'root' })
export class CrsService {
  private api = inject(ApiService);
  private _crs = signal<ChangeRequest[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  readonly crs = this._crs.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly pendingApprovals = computed(() =>
    this._crs().filter(
      (c) =>
        c.currentStatusName.toLowerCase().includes('approval') ||
        c.currentStatusName.toLowerCase().includes('client'),
    ),
  );

  async loadAll(projectId?: string, statusId?: string, name?: string): Promise<ChangeRequest[]> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const params: Record<string, string | undefined> = {};
      if (projectId) params['projectId'] = projectId;
      if (statusId) params['statusId'] = statusId;
      if (name) params['name'] = name;

      const res = await this.api.get<ApiResponse<ChangeRequest[]> | ChangeRequest[]>('/CR', params);
      const rawList = Array.isArray(res) ? res : (res as ApiResponse<ChangeRequest[]>).data ?? [];
      const list = (rawList as unknown as Record<string, unknown>[]).map((item) => this.normalizeCR(item));
      this._crs.set(list);
      return list;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load Change Requests';
      this._error.set(msg);
      console.error('CrsService.loadAll error:', err);
      return [];
    } finally {
      this._loading.set(false);
    }
  }

  async getById(id: string): Promise<ChangeRequest | null> {
    try {
      const res = await this.api.get<ApiResponse<ChangeRequest> | ChangeRequest>(`/CR/${id}`);
      const raw = (res as ApiResponse<ChangeRequest>).data ?? (res as ChangeRequest);
      return raw ? this.normalizeCR(raw as unknown as Record<string, unknown>) : null;
    } catch (err) {
      console.error(`CrsService.getById(${id}) error:`, err);
      return null;
    }
  }

  async create(dto: CRDto): Promise<ChangeRequest> {
    this._loading.set(true);
    try {
      const res = await this.api.post<ApiResponse<ChangeRequest> | ChangeRequest>('/CR', dto);
      const raw = (res as ApiResponse<ChangeRequest>).data ?? (res as ChangeRequest);
      const created = this.normalizeCR(raw as unknown as Record<string, unknown>);
      await this.loadAll();
      return created;
    } finally {
      this._loading.set(false);
    }
  }

  async update(id: string, dto: CRDto): Promise<ChangeRequest> {
    this._loading.set(true);
    try {
      const res = await this.api.put<ApiResponse<ChangeRequest> | ChangeRequest>(`/CR/${id}`, dto);
      const raw = (res as ApiResponse<ChangeRequest>).data ?? (res as ChangeRequest);
      const updated = this.normalizeCR(raw as unknown as Record<string, unknown>);
      await this.loadAll();
      return updated;
    } finally {
      this._loading.set(false);
    }
  }

  async delete(id: string): Promise<void> {
    this._loading.set(true);
    try {
      await this.api.delete(`/CR/${id}`);
      this._crs.update((prev) => prev.filter((c) => c.id !== id));
    } finally {
      this._loading.set(false);
    }
  }

  async changeStatus(crId: string, newStatusId: string): Promise<void> {
    this._loading.set(true);
    try {
      await this.api.put(`/CR/change_status/${newStatusId}`, { CRID: crId });
      await this.loadAll();
    } finally {
      this._loading.set(false);
    }
  }

  private normalizeCR(raw: Record<string, unknown>): ChangeRequest {
    const id = String(raw['id'] ?? raw['ID'] ?? '');
    const name = String(raw['name'] ?? raw['Name'] ?? raw['title'] ?? 'Change Request');
    const hours = Number(raw['estimatedManHour'] ?? raw['EstimatedManHour'] ?? 0);
    const rate = Number(raw['manHourRate'] ?? raw['ManHourRate'] ?? 150);
    const cost = hours * rate;
    const statusName = String(
      raw['currentStatusName'] ?? raw['CurrentStatusName'] ?? raw['status'] ?? 'Pending Vendor FeedBack',
    );
    const startDate = String(raw['startDate'] ?? raw['StartDate'] ?? '');
    const finishDate = String(raw['finishDate'] ?? raw['FinishDate'] ?? '');

    let daysOpen = 1;
    if (startDate) {
      const diff = Math.max(0, Date.now() - new Date(startDate).getTime());
      daysOpen = Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)));
    }

    const shortId = id.length > 4 ? id.substring(0, 4).toUpperCase() : '001';

    // scope may come as comma-separated or newline-separated string from backend
    const rawScope = raw['scope'] ?? raw['Scope'] ?? '';
    const scopeArr: string[] =
      typeof rawScope === 'string' && rawScope
        ? rawScope
            .split(/[,\n]/)
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [];

    return {
      id,
      name,
      title: name,
      code: `CR-${shortId}`,
      priority: String(raw['priority'] ?? raw['Priority'] ?? 'Medium'),
      scope: scopeArr,
      description: String(raw['description'] ?? raw['Description'] ?? ''),
      estimatedManHour: hours,
      estimatedHours: hours,
      hourlyRate: rate,
      manHourRate: rate,
      totalCost: cost,
      estimatedCost: cost,
      startDate,
      finishDate,
      expectedStart: startDate,
      expectedDelivery: finishDate,
      currentStatusID: String(raw['currentStatusID'] ?? raw['CurrentStatusID'] ?? ''),
      currentStatusName: statusName,
      status: statusName,
      stage: statusName,
      projectID: String(raw['projectID'] ?? raw['ProjectID'] ?? raw['projectId'] ?? ''),
      projectId: String(raw['projectID'] ?? raw['ProjectID'] ?? raw['projectId'] ?? ''),
      projectName: String(raw['projectName'] ?? raw['ProjectName'] ?? ''),
      clientId: String(raw['clientId'] ?? raw['ClientID'] ?? ''),
      clientName: String(raw['clientName'] ?? raw['ClientName'] ?? ''),
      daysOpen,
      lastUpdated: String(finishDate || new Date().toISOString()),
    };
  }
}
