import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '@/core/http/api.service';
import { CRStatus, StatusHistoryEntry } from '@/features/change-requests/data-access/status.model';

export const SEEDED_CR_STATUSES: CRStatus[] = [
  {
    id: '3f2a9e7d-8b41-4c6a-9d2e-1a7f5c8b3e90',
    currentStatus: 'Pending Vendor FeedBack',
    availableStatusIDs: '2e7c9a4d-5f3b-4c1e-8d6a-7b9f2c4e1a85,8a3e6c1f-4b9d-4e2a-9f7c-2d5b8e4a1c96,7c1d4e2f-9a6b-4f3d-8e7c-2b9a5d1f6c43',
    accessedBy: 'Admin',
  },
  {
    id: '7c1d4e2f-9a6b-4f3d-8e7c-2b9a5d1f6c43',
    currentStatus: 'Pending Client Clarification',
    availableStatusIDs: '3f2a9e7d-8b41-4c6a-9d2e-1a7f5c8b3e90',
    accessedBy: 'Client',
  },
  {
    id: '2e7c9a4d-5f3b-4c1e-8d6a-7b9f2c4e1a85',
    currentStatus: 'Accepted (CR)',
    availableStatusIDs: '6f4b2e8d-1a9c-4d7f-b3e6-8c2a5f9d4b17',
    accessedBy: 'Admin',
  },
  {
    id: '6f4b2e8d-1a9c-4d7f-b3e6-8c2a5f9d4b17',
    currentStatus: 'Estimation Created',
    availableStatusIDs: '3f2a9e7d-8b41-4c6a-9d2e-1a7f5c8b3e90,a5e9c3b7-2d4f-4a8e-9c1b-6f3d7e2a9b58',
    accessedBy: 'Admin',
  },
  {
    id: 'a5e9c3b7-2d4f-4a8e-9c1b-6f3d7e2a9b58',
    currentStatus: 'Pending Client Approval',
    availableStatusIDs: '9d3f6a2e-4c8b-4f1d-a7e9-2b6c4d8a3f71,8a3e6c1f-4b9d-4e2a-9f7c-2d5b8e4a1c96',
    accessedBy: 'Client',
  },
  {
    id: '9d3f6a2e-4c8b-4f1d-a7e9-2b6c4d8a3f71',
    currentStatus: 'Accepted (Estimation)',
    availableStatusIDs: '1c8e4b7a-3d9f-4e2c-b6a8-5f3d9e1c7a42',
    accessedBy: 'Admin',
  },
  {
    id: '1c8e4b7a-3d9f-4e2c-b6a8-5f3d9e1c7a42',
    currentStatus: 'Analysis',
    availableStatusIDs: '6a4d2f9e-8c3b-4a7d-9e1f-4b8a6d2c5f93,a5e9c3b7-2d4f-4a8e-9c1b-6f3d7e2a9b58',
    accessedBy: 'Admin',
  },
  {
    id: '6a4d2f9e-8c3b-4a7d-9e1f-4b8a6d2c5f93',
    currentStatus: 'Design',
    availableStatusIDs: 'f3b9e2d4-7a6c-4d8e-b2f1-9c5a3e7d4b26',
    accessedBy: 'Admin',
  },
  {
    id: 'f3b9e2d4-7a6c-4d8e-b2f1-9c5a3e7d4b26',
    currentStatus: 'Development',
    availableStatusIDs: 'e2b7a4c9-6f1d-4e3a-8b9c-3d5a7f2e1c64',
    accessedBy: 'Admin',
  },
  {
    id: 'e2b7a4c9-6f1d-4e3a-8b9c-3d5a7f2e1c64',
    currentStatus: 'Testing',
    availableStatusIDs: '8d4f2c6e-3a9b-4e7d-9c1f-5a2d9b6c3e47',
    accessedBy: 'Admin',
  },
  {
    id: '8d4f2c6e-3a9b-4e7d-9c1f-5a2d9b6c3e47',
    currentStatus: 'Pending Customer Approval',
    availableStatusIDs: 'b7e3a9c4-2f8d-4b6e-9a1c-6d4f2e8a7c53,8a3e6c1f-4b9d-4e2a-9f7c-2d5b8e4a1c96,4b9e7c2a-6d3f-4a8e-9c2b-1e7a4d8c6f39',
    accessedBy: 'Client',
  },
  {
    id: '4b9e7c2a-6d3f-4a8e-9c2b-1e7a4d8c6f39',
    currentStatus: 'Rework Required',
    availableStatusIDs: '1c8e4b7a-3d9f-4e2c-b6a8-5f3d9e1c7a42',
    accessedBy: 'Admin',
  },
  {
    id: 'b7e3a9c4-2f8d-4b6e-9a1c-6d4f2e8a7c53',
    currentStatus: 'Accepted (Test)',
    availableStatusIDs: 'd9a4c2f7-6e3b-4d8a-b7c1-2f9e5a3d8c64',
    accessedBy: 'Admin',
  },
  {
    id: 'd9a4c2f7-6e3b-4d8a-b7c1-2f9e5a3d8c64',
    currentStatus: 'Deployed',
    availableStatusIDs: '5c2e8a4d-9f7b-4e1c-a3d6-8b4f2c9e7a15',
    accessedBy: 'Admin',
  },
  {
    id: '5c2e8a4d-9f7b-4e1c-a3d6-8b4f2c9e7a15',
    currentStatus: 'Delivered',
    availableStatusIDs: 'c1f7a4e9-8b2d-4e6c-a3f1-7c9e2a5d8b64',
    accessedBy: 'Admin',
  },
  {
    id: '8a3e6c1f-4b9d-4e2a-9f7c-2d5b8e4a1c96',
    currentStatus: 'Rejected',
    availableStatusIDs: '',
    accessedBy: 'Admin',
  },
  {
    id: 'c1f7a4e9-8b2d-4e6c-a3f1-7c9e2a5d8b64',
    currentStatus: 'Completed',
    availableStatusIDs: '',
    accessedBy: 'Admin',
  },
];

@Injectable({ providedIn: 'root' })
export class StatusesService {
  private api = inject(ApiService);
  private _statuses = signal<CRStatus[]>(SEEDED_CR_STATUSES);
  readonly statuses = this._statuses.asReadonly();

  async loadAll(): Promise<CRStatus[]> {
    try {
      const res = await this.api.get<CRStatus[]>('/Status');
      if (Array.isArray(res) && res.length > 0) {
        this._statuses.set(res);
        return res;
      }
    } catch {
      // Use exact seeded database statuses
    }
    return SEEDED_CR_STATUSES;
  }

  getDefaultInitialStatus(): CRStatus {
    return SEEDED_CR_STATUSES[0];
  }

  /** Returns status history entries for a given CR id. Not yet backed by an API. */
  getByCrId(_crId: string): StatusHistoryEntry[] {
    return [];
  }

  getAvailableTransitions(statusIdOrName: string): CRStatus[] {
    const all = this._statuses();
    const current = all.find(
      (s) =>
        s.id.toLowerCase() === statusIdOrName.toLowerCase() ||
        s.currentStatus.toLowerCase() === statusIdOrName.toLowerCase(),
    );

    if (!current || !current.availableStatusIDs) {
      return [];
    }

    const targetIds = current.availableStatusIDs
      .split(',')
      .map((id) => id.trim().toLowerCase());

    return all.filter((s) => targetIds.includes(s.id.toLowerCase()));
  }
}
