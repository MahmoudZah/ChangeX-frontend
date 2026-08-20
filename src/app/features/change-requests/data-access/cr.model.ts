import { Priority } from '@/shared/util/constants';

export interface ChangeRequest {
  id: string;
  name: string;
  title: string;
  code: string;
  priority: Priority | string;
  /** scope as an array of bullet-point strings (split from backend string) */
  scope: string[];
  description: string;
  estimatedManHour: number;
  estimatedHours: number;
  hourlyRate: number;
  manHourRate: number;
  totalCost: number;
  estimatedCost: number;
  startDate: string;
  finishDate: string;
  expectedStart: string;
  expectedDelivery: string;
  currentStatusID: string;
  currentStatusName: string;
  status: string;
  stage: string;
  projectID: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  daysOpen: number;
  lastUpdated: string;
}

export interface CRDto {
  name: string;
  priority: string;
  scope: string;
  description: string;
  estimatedManHour: number;
  manHourRate: number;
  startDate: string;
  finishDate: string;
  currentStatusID: string;
  projectID: string;
}
