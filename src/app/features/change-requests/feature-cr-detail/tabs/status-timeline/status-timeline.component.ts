import { Component, computed, input } from '@angular/core';
import { StatusBadgeComponent } from '@/shared/ui/status-badge/status-badge.component';
import { crWorkflowPhaseIndex } from '@/shared/util/cr-status-workflow';

export interface WorkflowStageInfo {
  number: number;
  title: string;
  role: string;
  description: string;
  keyOutputs: string[];
  isCurrent: boolean;
  isPast: boolean;
}

@Component({
  selector: 'app-cr-status-timeline-tab',
  standalone: true,
  imports: [StatusBadgeComponent],
  templateUrl: './status-timeline.component.html',
})
export class CrStatusTimelineTabComponent {
  readonly status = input.required<string>();
  readonly statusId = input.required<string>();
  readonly accessedBy = input('');

  readonly currentStageIndex = computed(() => crWorkflowPhaseIndex(this.statusId()));

  readonly stages = computed<WorkflowStageInfo[]>(() => {
    const curr = this.currentStageIndex();
    return [
      {
        number: 1,
        title: 'Intake & Vendor Review',
        role: 'Client & Vendor Admin',
        description: 'The client submits the request and the vendor accepts, rejects, or asks the client for clarification.',
        keyOutputs: ['Functional Requirements', 'Vendor Triage', 'Clarification (if requested)'],
        isCurrent: curr === 0,
        isPast: curr > 0,
      },
      {
        number: 2,
        title: 'Estimation & Commercial Approval',
        role: 'Vendor Admin & Client',
        description: 'The vendor prepares effort, cost, and dates before the estimate is submitted for client approval.',
        keyOutputs: ['Engineering Man-Hours', 'Hourly Rate & Cost Quote', 'Client Authorization'],
        isCurrent: curr === 1,
        isPast: curr > 1,
      },
      {
        number: 3,
        title: 'Engineering Implementation',
        role: 'Vendor Admin & Engineers',
        description: 'The approved request moves through analysis, design, development, and testing.',
        keyOutputs: ['Analysis', 'Design', 'Feature Codebase', 'QA Verification'],
        isCurrent: curr === 2,
        isPast: curr > 2,
      },
      {
        number: 4,
        title: 'Customer Sign-off & Rework',
        role: 'Client & Vendor Admin',
        description: 'The client accepts testing or requests rework with context; the vendor then follows the backend rework path.',
        keyOutputs: ['Customer Acceptance', 'Rework Context (if requested)', 'Vendor Rework Feedback'],
        isCurrent: curr === 3,
        isPast: curr > 3,
      },
      {
        number: 5,
        title: 'Delivery & Closure',
        role: 'Vendor Admin',
        description: 'Accepted work is deployed and delivered. Delivered and Rejected are terminal backend statuses.',
        keyOutputs: ['Production Release', 'Delivered Request', 'Terminal Workflow State'],
        isCurrent: curr === 4,
        isPast: false,
      },
    ];
  });
}

