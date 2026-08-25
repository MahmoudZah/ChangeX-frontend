import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthService } from '@/core/auth/auth.service';
import { ApiEnvelope, ApiMessage, apiErrorMessage } from '@/core/http/api-contract';
import { ApiService } from '@/core/http/api.service';
import { ChangeRequest, CreateCRDto, CRResponseDto, EstimateCRDto } from '@/features/change-requests/data-access/cr.model';
import { StatusesService } from '@/features/change-requests/data-access/statuses.service';
import { crStageLabel, isApprovalStatusId, normalizeStatusId } from '@/shared/util/cr-status-workflow';

@Injectable({ providedIn: 'root' })
export class CrsService {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private statuses = inject(StatusesService);
  private _crs = signal<ChangeRequest[]>([]);
  private _loading = signal(false);
  private _error = signal('');
  private _lastMessage = signal('');

  readonly crs = this._crs.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly lastMessage = this._lastMessage.asReadonly();
  readonly pendingApprovals = computed(() =>
    this._crs().filter((cr) => isApprovalStatusId(cr.currentStatusID)),
  );

  async loadAll(projectId?: string, statusId?: string, name?: string): Promise<ChangeRequest[]> {
    this._loading.set(true);
    this._error.set('');
    try {
      const clientId = this.auth.isAdmin() ? undefined : this.auth.user()?.clientId;
      const response = await this.api.get<ApiEnvelope<CRResponseDto[]>>('/CR/GetAllCRs', {
        projectID: projectId,
        ClientID: clientId,
        statusId,
        name,
      });
      const crs = response.data.map((item) => this.normalize(item));
      const missingStatusIds = crs
        .filter((item) => item.currentStatusName === 'Status unavailable')
        .map((item) => item.id);
      if (missingStatusIds.length) await this.statuses.loadCurrentForCrs(missingStatusIds);
      const hydratedCrs = crs.map((item) => {
        if (item.currentStatusName !== 'Status unavailable') return item;
        const statusName = this.statuses.getCurrentForCr(item.id)?.currentStatus;
        return statusName
          ? { ...item, currentStatusName: statusName, status: statusName, stage: crStageLabel(item.currentStatusID) }
          : item;
      });
      this._crs.set(hydratedCrs);
      return hydratedCrs;
    } catch (error) {
      this._crs.set([]);
      this._error.set(apiErrorMessage(error, 'Change requests could not be loaded from the API.'));
      return [];
    } finally {
      this._loading.set(false);
    }
  }

  async getById(id: string, refreshWorkflow = false): Promise<ChangeRequest | null> {
    this._error.set('');
    try {
      if (!this.auth.isAdmin()) {
        const scopedCrs = await this.loadAll();
        if (this._error()) throw new Error(this._error());
        const scopedCr = scopedCrs.find((item) => item.id === id) ?? null;
        if (!scopedCr) return null;
        await this.statuses.loadForCr(id, refreshWorkflow);
        const currentStatusName = this.statuses.getCurrentForCr(id)?.currentStatus || scopedCr.currentStatusName;
        const currentStatusID = this.statuses.getCurrentForCr(id)?.id || scopedCr.currentStatusID;
        const authorizedCr = { ...scopedCr, currentStatusID, currentStatusName, status: currentStatusName, stage: crStageLabel(currentStatusID) };
        this._crs.update((current) => [...current.filter((item) => item.id !== id), authorizedCr]);
        return authorizedCr;
      }

      const response = await this.api.get<ApiEnvelope<CRResponseDto>>(`/CR/GetCR/${id}`);
      await this.statuses.loadForCr(id, true);
      const currentStatusName = this.statuses.getCurrentForCr(id)?.currentStatus || response.data.currentStatusName;
      const cr = this.normalize({ ...response.data, currentStatusName });
      this._crs.update((current) => [...current.filter((item) => item.id !== id), cr]);
      return cr;
    } catch (error) {
      if ((error as { status?: number }).status === 404) return null;
      this._error.set(apiErrorMessage(error, 'The change request could not be loaded from the API.'));
      throw error;
    }
  }

  async create(dto: CreateCRDto): Promise<ChangeRequest> {
    this._loading.set(true);
    this._lastMessage.set('');
    try {
      const response = await this.api.post<ApiEnvelope<CRResponseDto>>('/CR/AddCR', dto);
      const created = this.normalize(response.data);
      this._crs.update((current) => [...current, created]);
      this._lastMessage.set(response.message);
      return created;
    } finally {
      this._loading.set(false);
    }
  }

  async updateEstimate(id: string, dto: EstimateCRDto): Promise<ChangeRequest> {
    this._loading.set(true);
    this._lastMessage.set('');
    try {
      const response = await this.api.put<ApiEnvelope<CRResponseDto>>('/CR/UpdateCR', dto, { ID: id });
      const updated = await this.getById(id) ?? this.normalize(response.data);
      this._lastMessage.set(response.message);
      return updated;
    } finally {
      this._loading.set(false);
    }
  }

  async delete(id: string): Promise<string> {
    this._lastMessage.set('');
    const response = await this.api.delete<ApiMessage>('/CR/DeleteCR', { ID: id });
    this._crs.update((current) => current.filter((cr) => cr.id !== id));
    this._lastMessage.set(response.message);
    return response.message;
  }

  async changeStatus(crId: string, newStatusId: string): Promise<ChangeRequest> {
    this._loading.set(true);
    this._lastMessage.set('');
    try {
      if (!this.statuses.canTransition(crId, newStatusId, this.auth.user()?.role)) {
        await this.statuses.loadForCr(crId, true);
      }
      if (!this.statuses.canTransition(crId, newStatusId, this.auth.user()?.role)) {
        throw new Error('This status transition is no longer available for your role. Refresh the request and try again.');
      }
      const response = await this.api.put<ApiEnvelope<CRResponseDto>>('/CR/ChangeStatus', null, {
        ID: newStatusId,
        CRID: crId,
      });
      const persisted = await this.getById(crId, true);
      if (!persisted || normalizeStatusId(persisted.currentStatusID) !== normalizeStatusId(newStatusId)) {
        throw new Error('The API accepted the status change but did not persist it.');
      }
      this._lastMessage.set(response.message);
      return persisted;
    } finally {
      this._loading.set(false);
    }
  }

  private normalize(raw: CRResponseDto): ChangeRequest {
    const statusName = raw.currentStatusName
      || raw.currentStatus?.currentStatus
      || this.statuses.getCurrentForCr(raw.id)?.currentStatus
      || 'Status unavailable';
    const scope = raw.scope.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
    const startDate = this.usableDate(raw.startDate);
    const finishDate = this.usableDate(raw.finishDate);
    const startTime = startDate ? new Date(startDate).getTime() : Number.NaN;
    const daysOpen = Number.isNaN(startTime)
      ? 0
      : Math.max(0, Math.floor((Date.now() - startTime) / 86_400_000));

    return {
      id: raw.id,
      name: raw.name,
      title: raw.name,
      code: `CR-${raw.id.slice(0, 8).toUpperCase()}`,
      priority: raw.priority,
      scope,
      description: raw.description,
      estimatedManHour: raw.estimatedManHour,
      estimatedHours: raw.estimatedManHour,
      hourlyRate: raw.manHourRate,
      manHourRate: raw.manHourRate,
      totalCost: raw.estimatedManHour * raw.manHourRate,
      estimatedCost: raw.estimatedManHour * raw.manHourRate,
      startDate,
      finishDate,
      expectedStart: startDate,
      expectedDelivery: finishDate,
      currentStatusID: raw.currentStatusID,
      currentStatusName: statusName,
      status: statusName,
      stage: crStageLabel(raw.currentStatusID),
      projectID: raw.projectID,
      projectId: raw.projectID,
      projectName: raw.projectName || raw.project?.name || '',
      clientId: this.auth.isAdmin() ? '' : this.auth.user()?.clientId ?? '',
      clientName: this.auth.isAdmin() ? '' : this.auth.user()?.company ?? '',
      daysOpen,
    };
  }

  private usableDate(value: string): string {
    return value && !value.startsWith('0001-01-01') ? value : '';
  }
}
