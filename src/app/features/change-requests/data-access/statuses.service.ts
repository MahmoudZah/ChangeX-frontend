import { Injectable, signal } from '@angular/core';
import { StatusHistoryEntry } from '@/features/change-requests/data-access/status.model';

const MOCK: StatusHistoryEntry[] = [
  { id: 's1', crId: 'cr-104', status: 'Submitted', changedAt: '2024-10-24T10:00:00Z', changedBy: 'Sarah Jenkins' },
  { id: 's2', crId: 'cr-104', status: 'Under Review', changedAt: '2024-10-26T14:00:00Z', changedBy: 'Alex Rivera' },
  { id: 's3', crId: 'cr-104', status: 'Estimating', changedAt: '2024-10-28T09:00:00Z', changedBy: 'Alex Rivera' },
  { id: 's4', crId: 'cr-104', status: 'Pending Estimate', changedAt: '2024-11-01T11:00:00Z', changedBy: 'Alex Rivera', note: 'Estimate ready for client review' },
];

@Injectable({ providedIn: 'root' })
export class StatusesService {
  private _history = signal<StatusHistoryEntry[]>(MOCK);
  readonly history = this._history.asReadonly();

  getByCrId(crId: string): StatusHistoryEntry[] {
    return this._history().filter((e) => e.crId === crId);
  }
}
