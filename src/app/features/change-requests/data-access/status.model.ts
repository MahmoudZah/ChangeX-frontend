export interface CRStatusDto {
  id: string;
  currentStatus: string;
  availableStatusIDs: string | null;
  accessedBy: string;
}

export interface CRStatus extends CRStatusDto {
  availableStatusIDs: string | null;
}

export interface AvailableStatusDto {
  id: string;
  currentStatus: string;
}

export interface StatusTransition {
  id: string;
  label: string;
}

export function isReworkTransition(transition: StatusTransition): boolean {
  return transition.label.trim().toLowerCase().includes('rework');
}

export function isVisibleStatusTransition(
  currentStatus: string,
  transition: StatusTransition,
): boolean {
  const isPendingCustomerApproval = currentStatus.trim().toLowerCase() === 'pending customer approval';
  const isRejected = transition.label.trim().toLowerCase().startsWith('reject');
  return !(isPendingCustomerApproval && isRejected);
}
