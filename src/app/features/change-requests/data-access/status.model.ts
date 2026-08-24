export interface CRStatusDto {
  id: string;
  currentStatus: string;
  availableStatusIDs: string | null;
  accessedBy: string;
}

export interface CRStatus extends CRStatusDto {
  availableStatusIDs: string | null;
}

export interface StatusTransition {
  id: string;
  label: string;
}
