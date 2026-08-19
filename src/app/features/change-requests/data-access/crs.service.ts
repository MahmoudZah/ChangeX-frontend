import { Injectable, computed, signal } from '@angular/core';
import { ChangeRequest } from '@/features/change-requests/data-access/cr.model';

const MOCK: ChangeRequest[] = [
  {
    id: 'cr-104',
    code: 'CR-104',
    title: 'HubSpot Synchronizer Pipeline',
    projectId: 'p1',
    projectName: 'E-Commerce Replatform',
    clientId: 'c1',
    clientName: 'Acme Corporation',
    priority: 'High',
    status: 'Pending Estimate',
    stage: 'Estimating',
    estimatedCost: 4250,
    estimatedHours: 34,
    hourlyRate: 125,
    description:
      'Build a reliable synchronizer pipeline between the commerce platform and HubSpot CRM so marketing and sales teams receive accurate customer and order data in near real time.',
    scope: [
      'HubSpot CRM Contact API mapping',
      'Order lifecycle webhook handlers',
      'Retry queue for failed sync events',
      'Admin visibility into last sync status',
    ],
    businessRationale: 'Marketing needs accurate lifecycle data for segmentation and campaign triggers.',
    expectedStart: '2024-11-04',
    expectedDelivery: '2024-11-15',
    lastUpdated: '2026-08-19T08:00:00Z',
    createdAt: '2024-10-24T10:00:00Z',
    daysOpen: 2,
  },
  {
    id: 'cr-103',
    code: 'CR-103',
    title: 'Checkout Apple Pay Support',
    projectId: 'p1',
    projectName: 'E-Commerce Replatform',
    clientId: 'c1',
    clientName: 'Acme Corporation',
    priority: 'Critical',
    status: 'Under Review',
    stage: 'Reviewing',
    estimatedCost: 6800,
    estimatedHours: 52,
    hourlyRate: 125,
    description: 'Add Apple Pay as a first-class payment option in checkout with device and browser fallbacks.',
    scope: ['Apple Pay merchant validation', 'Checkout UI updates', 'Payment reconciliation hooks'],
    lastUpdated: '2026-08-18T14:00:00Z',
    createdAt: '2026-08-10T09:00:00Z',
    daysOpen: 1,
  },
  {
    id: 'cr-102',
    code: 'CR-102',
    title: 'Product Recommendations Widget',
    projectId: 'p1',
    projectName: 'E-Commerce Replatform',
    clientId: 'c1',
    clientName: 'Acme Corporation',
    priority: 'Medium',
    status: 'Accepted',
    stage: 'Scheduled',
    estimatedCost: 3100,
    estimatedHours: 24,
    hourlyRate: 125,
    description: 'Personalized recommendations on PDP and cart based on browsing history and inventory signals.',
    scope: ['Recommendation service integration', 'PDP widget', 'Analytics events'],
    lastUpdated: '2026-08-17T11:00:00Z',
    createdAt: '2026-08-01T09:00:00Z',
    daysOpen: 4,
  },
  {
    id: 'cr-101',
    code: 'CR-101',
    title: 'Gift Card Redemption Flow',
    projectId: 'p1',
    projectName: 'E-Commerce Replatform',
    clientId: 'c1',
    clientName: 'Acme Corporation',
    priority: 'High',
    status: 'Implemented',
    stage: 'Completed',
    estimatedCost: 5400,
    estimatedHours: 42,
    hourlyRate: 125,
    description: 'Allow customers to apply gift cards during checkout with partial redemption support.',
    scope: ['Balance lookup API', 'Checkout validation', 'Refund handling'],
    lastUpdated: '2026-08-16T16:00:00Z',
    createdAt: '2026-07-20T09:00:00Z',
    daysOpen: 16,
  },
  {
    id: 'cr-100',
    code: 'CR-100',
    title: 'Legacy Coupon Migration',
    projectId: 'p2',
    projectName: 'Marketing Website Refresh',
    clientId: 'c1',
    clientName: 'Acme Corporation',
    priority: 'Low',
    status: 'Rejected',
    stage: 'Archived',
    estimatedCost: 1800,
    estimatedHours: 14,
    hourlyRate: 125,
    description: 'Migrate legacy coupon codes into the new promotion engine.',
    scope: ['Coupon import script', 'Validation rules mapping'],
    lastUpdated: '2026-08-15T10:00:00Z',
    createdAt: '2026-07-15T09:00:00Z',
    daysOpen: 8,
  },
  {
    id: 'cr-99',
    code: 'CR-99',
    title: 'Support Portal SSO',
    projectId: 'p3',
    projectName: 'Internal Tools Portal',
    clientId: 'c1',
    clientName: 'Acme Corporation',
    priority: 'High',
    status: 'Estimate Approval',
    stage: 'Estimating',
    estimatedCost: 3900,
    estimatedHours: 30,
    hourlyRate: 125,
    description: 'Single sign-on between the commerce account and the internal support portal.',
    scope: ['SAML integration', 'Session handoff', 'Role mapping'],
    lastUpdated: '2026-08-19T07:00:00Z',
    createdAt: '2026-08-12T09:00:00Z',
    daysOpen: 2,
  },
  {
    id: 'cr-98',
    code: 'CR-98',
    title: 'UAT Regression Pack',
    projectId: 'p1',
    projectName: 'E-Commerce Replatform',
    clientId: 'c1',
    clientName: 'Acme Corporation',
    priority: 'Medium',
    status: 'Testing/UAT Signoff',
    stage: 'Reviewing',
    estimatedCost: 2100,
    estimatedHours: 0,
    hourlyRate: 125,
    description: 'Final UAT signoff for checkout and payment regression scenarios.',
    scope: ['Test case execution', 'Defect triage', 'Signoff documentation'],
    lastUpdated: '2026-08-18T09:00:00Z',
    createdAt: '2026-08-05T09:00:00Z',
    daysOpen: 1,
  },
  {
    id: 'cr-97',
    code: 'CR-97',
    title: 'Inventory Alert Webhooks',
    projectId: 'p3',
    projectName: 'Internal Tools Portal',
    clientId: 'c1',
    clientName: 'Acme Corporation',
    priority: 'Critical',
    status: 'Delayed',
    stage: 'Researching',
    estimatedCost: 0,
    estimatedHours: 0,
    hourlyRate: 125,
    description: 'Notify ops when SKU inventory crosses configured thresholds.',
    scope: ['Webhook dispatcher', 'Threshold configuration UI'],
    lastUpdated: '2026-08-14T12:00:00Z',
    createdAt: '2026-07-28T09:00:00Z',
    daysOpen: 16,
  },
];

@Injectable({ providedIn: 'root' })
export class CrsService {
  private _crs = signal<ChangeRequest[]>(MOCK);
  readonly crs = this._crs.asReadonly();

  readonly pendingApprovals = computed(() =>
    this._crs().filter((cr) =>
      ['Estimate Approval', 'Testing/UAT Signoff', 'Pending Estimate'].includes(cr.status),
    ),
  );

  readonly activeCount = computed(() =>
    this._crs().filter((cr) => ['Accepted', 'Under Review', 'In Progress'].includes(cr.status)).length,
  );

  async loadAll(): Promise<void> {
    this._crs.set(MOCK);
  }

  getById(id: string): ChangeRequest | undefined {
    return this._crs().find((cr) => cr.id === id);
  }

  getByProject(projectId: string): ChangeRequest[] {
    return this._crs().filter((cr) => cr.projectId === projectId);
  }

  create(payload: Partial<ChangeRequest>): ChangeRequest {
    const next: ChangeRequest = {
      id: `cr-${Date.now()}`,
      code: `CR-${100 + this._crs().length}`,
      title: payload.title ?? 'Untitled',
      projectId: payload.projectId ?? 'p1',
      projectName: payload.projectName ?? 'E-Commerce Replatform',
      clientId: 'c1',
      clientName: 'Acme Corporation',
      priority: payload.priority ?? 'Medium',
      status: 'Pending Estimate',
      stage: 'Estimating',
      estimatedCost: 0,
      estimatedHours: 0,
      hourlyRate: 125,
      description: payload.description ?? '',
      scope: payload.scope ?? [],
      businessRationale: payload.businessRationale,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      daysOpen: 0,
    };
    this._crs.update((list) => [next, ...list]);
    return next;
  }
}
