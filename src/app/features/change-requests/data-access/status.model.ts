export interface StatusHistoryEntry {
  id: string;
  crId: string;
  status: string;
  changedAt: string;
  changedBy: string;
  note?: string;
}
