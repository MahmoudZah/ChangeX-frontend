import { Priority } from '@/shared/util/constants';

export interface CRResponseDto {
  id: string;
  name: string;
  priority: string;
  scope: string;
  description: string;
  estimatedManHour: number;
  manHourRate: number;
  startDate: string;
  finishDate: string;
  currentStatusID: string;
  currentStatusName: string;
  projectID: string;
  projectName: string;
  currentStatus?: { currentStatus: string };
  project?: { name: string };
}

export interface ChangeRequest {
  id: string;
  name: string;
  title: string;
  code: string;
  priority: Priority | string;
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
}

export interface CreateCRDto {
  name: string;
  priority: string;
  scope: string;
  description: string;
  projectID: string;
}

export interface EstimateCRDto {
  estimatedManHour: number;
  manHourRate: number;
  startDate: string;
  finishDate: string;
}
