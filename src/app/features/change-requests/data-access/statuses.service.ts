import { Injectable, inject, signal } from '@angular/core';
import { ApiEnvelope, apiErrorMessage } from '@/core/http/api-contract';
import { ApiService } from '@/core/http/api.service';
import { Role } from '@/shared/util/constants';
import {
  AvailableStatusDto,
  CRStatus,
  CRStatusDto,
  StatusTransition,
} from '@/features/change-requests/data-access/status.model';

@Injectable({ providedIn: 'root' })
export class StatusesService {
  private api = inject(ApiService);
  private _currentByCr = signal<Record<string, CRStatus>>({});
  private _availableByCr = signal<Record<string, StatusTransition[]>>({});
  private _loading = signal(false);
  private _error = signal('');

  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  async loadCurrentForCrs(crIds: string[]): Promise<void> {
    const ids = [...new Set(crIds.filter(Boolean))];
    if (!ids.length) return;

    this._loading.set(true);
    this._error.set('');
    try {
      const results = await Promise.allSettled(
        ids.map((id) => this.api.get<ApiEnvelope<CRStatusDto>>(`/Status/CR/${id}`)),
      );
      const currentByCr: Record<string, CRStatus> = {};
      let firstError: unknown;
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') currentByCr[ids[index]] = result.value.data;
        else firstError ??= result.reason;
      });
      this._currentByCr.update((current) => ({ ...current, ...currentByCr }));
      if (firstError) {
        this._error.set(apiErrorMessage(firstError, 'Some change-request statuses could not be loaded.'));
      }
    } finally {
      this._loading.set(false);
    }
  }

  async loadForCr(crId: string, refreshCurrent = false): Promise<StatusTransition[]> {
    this._loading.set(true);
    this._error.set('');
    try {
      const cachedCurrent = refreshCurrent ? undefined : this.getCurrentForCr(crId);
      const [currentResponse, availableResponse] = await Promise.all([
        cachedCurrent
          ? Promise.resolve({ message: '', data: cachedCurrent })
          : this.api.get<ApiEnvelope<CRStatusDto>>(`/Status/CR/${crId}`),
        this.api.get<ApiEnvelope<unknown[]>>(`/Status/AvailableCRStatus/${crId}`),
      ]);
      const current = currentResponse.data;
      if (!availableResponse.data.every((status) => this.isAvailableStatusDto(status))) {
        throw new Error('The API returned an invalid available-status response.');
      }
      const transitions = availableResponse.data.map((status) => ({
        id: status.id,
        label: status.currentStatus,
      }));
      this._currentByCr.update((map) => ({ ...map, [crId]: current }));
      this._availableByCr.update((map) => ({ ...map, [crId]: transitions }));
      return transitions;
    } catch (error) {
      this._availableByCr.update((map) => ({ ...map, [crId]: [] }));
      this._error.set(apiErrorMessage(error, 'Status transitions could not be loaded from the API.'));
      return [];
    } finally {
      this._loading.set(false);
    }
  }

  getCurrentForCr(crId: string): CRStatus | undefined {
    return this._currentByCr()[crId];
  }

  getAvailableForCr(crId: string): StatusTransition[] {
    return this._availableByCr()[crId] ?? [];
  }

  canAct(crId: string, role: Role | undefined): boolean {
    const accessedBy = this.getCurrentForCr(crId)?.accessedBy.toLowerCase();
    return accessedBy === 'admin' ? role === 'Admin' : accessedBy === 'client' && role !== 'Admin';
  }

  private isAvailableStatusDto(value: unknown): value is AvailableStatusDto {
    if (typeof value !== 'object' || value === null) return false;
    const status = value as Partial<AvailableStatusDto>;
    return typeof status.id === 'string' && !!status.id &&
      typeof status.currentStatus === 'string' && !!status.currentStatus.trim();
  }
}
