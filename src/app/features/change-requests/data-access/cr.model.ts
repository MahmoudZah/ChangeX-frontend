import { Priority } from '@/shared/util/constants';

export interface ChangeRequest {
  id: string;
  code: string;
  title: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  priority: Priority;
  status: string;
  stage: string;
  estimatedCost: number;
  estimatedHours: number;
  hourlyRate: number;
  description: string;
  scope: string[];
  businessRationale?: string;
  expectedStart?: string;
  expectedDelivery?: string;
  lastUpdated: string;
  createdAt: string;
  daysOpen: number;
}
