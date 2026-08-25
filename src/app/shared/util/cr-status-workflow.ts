export const CR_STATUS_IDS = {
  pendingVendorFeedback: '3f2a9e7d-8b41-4c6a-9d2e-1a7f5c8b3e90',
  pendingClientClarification: '7c1d4e2f-9a6b-4f3d-8e7c-2b9a5d1f6c43',
  acceptedCr: '2e7c9a4d-5f3b-4c1e-8d6a-7b9f2c4e1a85',
  estimationCreated: '6f4b2e8d-1a9c-4d7f-b3e6-8c2a5f9d4b17',
  pendingClientApproval: 'a5e9c3b7-2d4f-4a8e-9c1b-6f3d7e2a9b58',
  acceptedEstimation: '9d3f6a2e-4c8b-4f1d-a7e9-2b6c4d8a3f71',
  analysis: '1c8e4b7a-3d9f-4e2c-b6a8-5f3d9e1c7a42',
  design: '6a4d2f9e-8c3b-4a7d-9e1f-4b8a6d2c5f93',
  development: 'f3b9e2d4-7a6c-4d8e-b2f1-9c5a3e7d4b26',
  testing: 'e2b7a4c9-6f1d-4e3a-8b9c-3d5a7f2e1c64',
  pendingCustomerApproval: '8d4f2c6e-3a9b-4e7d-9c1f-5a2d9b6c3e47',
  reworkRequired: '4b9e7c2a-6d3f-4a8e-9c2b-1e7a4d8c6f39',
  acceptedTest: 'b7e3a9c4-2f8d-4b6e-9a1c-6d4f2e8a7c53',
  deployed: 'd9a4c2f7-6e3b-4d8a-b7c1-2f9e5a3d8c64',
  delivered: '5c2e8a4d-9f7b-4e1c-a3d6-8b4f2c9e7a15',
  rejected: '8a3e6c1f-4b9d-4e2a-9f7c-2d5b8e4a1c96',
  pendingVendorReworkFeedback: 'c1f7a4e9-8b2d-4e6c-a3f1-7c9e2a5d8b64',
} as const;

export type CrStatusId = (typeof CR_STATUS_IDS)[keyof typeof CR_STATUS_IDS];
export type CrStatusOwner = 'Admin' | 'Client';
export type CrStatusTone = 'amber' | 'orange' | 'purple' | 'blue' | 'indigo' | 'sky' | 'emerald' | 'teal' | 'rose';
export type CrBoardColumnKey = 'intake' | 'estimation' | 'implementation' | 'signoff' | 'closed';
export type CrTransitionKind = 'primary' | 'clarification' | 'rework' | 'reject';

export interface CrStatusDefinition {
  id: CrStatusId;
  name: string;
  order: number;
  owner: CrStatusOwner;
  boardColumn: CrBoardColumnKey;
  tone: CrStatusTone;
  transitionIds: readonly CrStatusId[];
  terminal?: boolean;
}

export interface CrBoardColumnDefinition {
  key: CrBoardColumnKey;
  title: string;
  color: string;
}

const S = CR_STATUS_IDS;

/**
 * Static identity and hierarchy copied from the backend's current EF seed model.
 * Runtime action availability still comes from /Status/AvailableCRStatus/{crId}.
 */
export const CR_STATUS_DEFINITIONS: readonly CrStatusDefinition[] = [
  { id: S.pendingVendorFeedback, name: 'Pending Vendor FeedBack', order: 0, owner: 'Admin', boardColumn: 'intake', tone: 'amber', transitionIds: [S.acceptedCr, S.rejected, S.pendingClientClarification] },
  { id: S.pendingClientClarification, name: 'Pending Client Clarification', order: 1, owner: 'Client', boardColumn: 'intake', tone: 'orange', transitionIds: [S.pendingVendorFeedback] },
  { id: S.acceptedCr, name: 'Accepted (CR)', order: 2, owner: 'Admin', boardColumn: 'estimation', tone: 'emerald', transitionIds: [S.estimationCreated] },
  { id: S.estimationCreated, name: 'Estimation Created', order: 3, owner: 'Admin', boardColumn: 'estimation', tone: 'blue', transitionIds: [S.pendingVendorFeedback] },
  { id: S.pendingClientApproval, name: 'Pending Client Approval', order: 4, owner: 'Client', boardColumn: 'estimation', tone: 'purple', transitionIds: [S.acceptedEstimation, S.rejected] },
  { id: S.acceptedEstimation, name: 'Accepted (Estimation)', order: 5, owner: 'Admin', boardColumn: 'estimation', tone: 'emerald', transitionIds: [S.analysis] },
  { id: S.analysis, name: 'Analysis', order: 6, owner: 'Admin', boardColumn: 'implementation', tone: 'indigo', transitionIds: [S.design, S.pendingClientApproval] },
  { id: S.design, name: 'Design', order: 7, owner: 'Admin', boardColumn: 'implementation', tone: 'indigo', transitionIds: [S.development] },
  { id: S.development, name: 'Development', order: 8, owner: 'Admin', boardColumn: 'implementation', tone: 'sky', transitionIds: [S.testing] },
  { id: S.testing, name: 'Testing', order: 9, owner: 'Admin', boardColumn: 'implementation', tone: 'sky', transitionIds: [S.pendingCustomerApproval] },
  { id: S.pendingCustomerApproval, name: 'Pending Customer Approval', order: 10, owner: 'Client', boardColumn: 'signoff', tone: 'purple', transitionIds: [S.acceptedTest, S.reworkRequired] },
  { id: S.reworkRequired, name: 'Rework Required', order: 11, owner: 'Admin', boardColumn: 'signoff', tone: 'orange', transitionIds: [S.pendingVendorReworkFeedback] },
  { id: S.acceptedTest, name: 'Accepted (Test)', order: 12, owner: 'Admin', boardColumn: 'closed', tone: 'emerald', transitionIds: [S.deployed] },
  { id: S.deployed, name: 'Deployed', order: 13, owner: 'Admin', boardColumn: 'closed', tone: 'teal', transitionIds: [S.delivered] },
  { id: S.delivered, name: 'Delivered', order: 14, owner: 'Admin', boardColumn: 'closed', tone: 'teal', transitionIds: [], terminal: true },
  { id: S.rejected, name: 'Rejected', order: 15, owner: 'Admin', boardColumn: 'closed', tone: 'rose', transitionIds: [], terminal: true },
  { id: S.pendingVendorReworkFeedback, name: 'Pending Vendor Rework Feedback', order: 16, owner: 'Admin', boardColumn: 'signoff', tone: 'amber', transitionIds: [S.analysis, S.pendingCustomerApproval] },
];

export const CR_BOARD_COLUMNS: readonly CrBoardColumnDefinition[] = [
  { key: 'intake', title: 'Intake & Review', color: '#65dcd5' },
  { key: 'estimation', title: 'Estimation & Approval', color: '#f5a623' },
  { key: 'implementation', title: 'Implementation', color: '#6366f1' },
  { key: 'signoff', title: 'Sign-off & Rework', color: '#d97706' },
  { key: 'closed', title: 'Delivery & Closed', color: '#22a06b' },
];

export const CR_INITIAL_STATUS_ID = S.pendingVendorFeedback;

const STATUS_BY_ID = new Map<string, CrStatusDefinition>(
  CR_STATUS_DEFINITIONS.map((status) => [normalizeStatusId(status.id), status]),
);
const BOARD_COLUMN_BY_KEY = new Map(CR_BOARD_COLUMNS.map((column) => [column.key, column]));

export function normalizeStatusId(statusId: string | null | undefined): string {
  return (statusId ?? '').trim().toLowerCase();
}

export function crStatusDefinition(statusId: string | null | undefined): CrStatusDefinition | undefined {
  return STATUS_BY_ID.get(normalizeStatusId(statusId));
}

export function crStatusLabel(statusId: string | null | undefined, backendName?: string): string {
  const apiLabel = backendName?.trim();
  return apiLabel || crStatusDefinition(statusId)?.name || 'Unknown status';
}

export function crStatusOrder(statusId: string | null | undefined): number {
  return crStatusDefinition(statusId)?.order ?? Number.MAX_SAFE_INTEGER;
}

export function crBoardColumn(statusId: string | null | undefined): CrBoardColumnDefinition | undefined {
  const key = crStatusDefinition(statusId)?.boardColumn;
  return key ? BOARD_COLUMN_BY_KEY.get(key) : undefined;
}

export function crWorkflowPhaseIndex(statusId: string | null | undefined): number {
  const key = crStatusDefinition(statusId)?.boardColumn;
  return key ? CR_BOARD_COLUMNS.findIndex((column) => column.key === key) : 0;
}

export function crStageLabel(statusId: string | null | undefined): string {
  return crBoardColumn(statusId)?.title ?? 'Other';
}

export function isApprovalStatusId(statusId: string | null | undefined): boolean {
  const id = normalizeStatusId(statusId);
  return id === S.pendingClientApproval || id === S.pendingCustomerApproval;
}

export function isAcceptedStatusId(statusId: string | null | undefined): boolean {
  const id = normalizeStatusId(statusId);
  return id === S.acceptedCr || id === S.acceptedEstimation || id === S.acceptedTest;
}

export function isTerminalStatusId(statusId: string | null | undefined): boolean {
  return crStatusDefinition(statusId)?.terminal === true;
}

export function crTransitionKind(statusId: string | null | undefined): CrTransitionKind {
  const id = normalizeStatusId(statusId);
  if (id === S.pendingClientClarification) return 'clarification';
  if (id === S.reworkRequired) return 'rework';
  if (id === S.rejected) return 'reject';
  return 'primary';
}

export function parseAvailableStatusIds(value: string | null | undefined): string[] {
  return (value ?? '').split(',').map(normalizeStatusId).filter(Boolean);
}
