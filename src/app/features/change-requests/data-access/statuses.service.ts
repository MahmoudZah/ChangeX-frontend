import { Injectable, inject, signal } from '@angular/core';
import { ApiEnvelope, apiErrorMessage } from '@/core/http/api-contract';
import { ApiService } from '@/core/http/api.service';
import { Role } from '@/shared/util/constants';
import { CRStatus, CRStatusDto, StatusTransition } from '@/features/change-requests/data-access/status.model';

const WORKFLOW_TARGET_LABELS: Record<string, string[]> = {
  'pending vendor feedback': ['Accepted (CR)', 'Rejected', 'Pending Client Clarification'],
  'pending client clarification': ['Pending Vendor FeedBack'],
  'accepted (cr)': ['Estimation Created'],
  'estimation created': ['Pending Vendor FeedBack'],
  'pending client approval': ['Accepted (Estimation)', 'Rejected'],
  'accepted (estimation)': ['Analysis'],
  analysis: ['Design', 'Pending Client Approval'],
  design: ['Development'],
  development: ['Testing'],
  testing: ['Pending Customer Approval'],
  'pending customer approval': ['Accepted (Test)', 'Rejected', 'Rework Required'],
  'rework required': ['Analysis'],
  'accepted (test)': ['Deployed'],
  deployed: ['Delivered'],
  delivered: ['Completed'],
};

@Injectable({ providedIn: 'root' })
export class StatusesService {
  private api = inject(ApiService);
  private _currentByCr = signal<Record<string, CRStatus>>({});
  private _availableByCr = signal<Record<string, StatusTransition[]>>({});
  private _loading = signal(false);
  private _error = signal('');

  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  async loadForCr(crId: string): Promise<StatusTransition[]> {
    this._loading.set(true);
    this._error.set('');
    try {
      const [currentResponse, availableResponse] = await Promise.all([
        this.api.get<ApiEnvelope<CRStatusDto>>(`/Status/cr/${crId}`),
        this.api.get<ApiEnvelope<string[]>>(`/Status/cr/${crId}/available`),
      ]);
      const current = currentResponse.data;
      const labels = WORKFLOW_TARGET_LABELS[current.currentStatus.trim().toLowerCase()] ?? [];
      const transitions = availableResponse.data.map((id, index) => ({
        id,
        label: labels[index] ?? `Status ${id.slice(0, 8)}`,
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
}
