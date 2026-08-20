export interface CRStatus {
  id: string;
  currentStatus: string;
  availableStatusIDs?: string;
  availableStatuses?: string[];
  accessedBy?: string;
}

export interface StatusHistoryEntry {
  id: string;
  crId: string;
  status: string;
  changedAt: string;
  changedBy: string;
  note?: string;
}
