import { Component, computed, Input } from '@angular/core';
import { StatusBadgeComponent } from '@/shared/ui/status-badge/status-badge.component';

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
  @Input({ required: true }) status = '';
  @Input() accessedBy = '';

  readonly currentStageIndex = computed(() => {
    const s = this.status.toLowerCase();
    if (s.includes('deliver') || s.includes('complete') || s.includes('implement')) return 4;
    if (s.includes('progress') || s.includes('develop') || s.includes('test')) return 3;
    if (s.includes('approval') || s.includes('clarification') || s.includes('customer') || s.includes('client')) return 2;
    if (s.includes('accepted') || s.includes('estimat')) return 1;
    return 0;
  });

  readonly stages = computed<WorkflowStageInfo[]>(() => {
    const curr = this.currentStageIndex();
    return [
      {
        number: 1,
        title: 'Intake & Submission',
        role: 'Client Account',
        description: 'Change request submitted with title, description, scope, and optional attachments.',
        keyOutputs: ['Functional Requirements', 'Business Justification', 'Supporting Files'],
        isCurrent: curr === 0,
        isPast: curr > 0,
      },
      {
        number: 2,
        title: 'Vendor Scoping & Estimation',
        role: 'Vendor Admin',
        description: 'Vendor reviews feasibility, accepts the request, and computes estimated man-hours, rate, and delivery dates.',
        keyOutputs: ['Engineering Man-Hours', 'Hourly Rate & Cost Quote', 'Planned Timeline'],
        isCurrent: curr === 1,
        isPast: curr > 1,
      },
      {
        number: 3,
        title: 'Client Review & Signoff',
        role: 'Client Account',
        description: 'Client evaluates the proposed estimate and timeline. Can request clarification, initiate rework, or approve.',
        keyOutputs: ['Commercial Authorization', 'Budget Signoff', 'Rework Context (if requested)'],
        isCurrent: curr === 2,
        isPast: curr > 2,
      },
      {
        number: 4,
        title: 'Engineering Implementation',
        role: 'Vendor Admin & Engineers',
        description: 'Development sprints, unit testing, system integration, and quality assurance.',
        keyOutputs: ['Feature Codebase', 'QA Verification', 'Automated Test Runs'],
        isCurrent: curr === 3,
        isPast: curr > 3,
      },
      {
        number: 5,
        title: 'Delivery, UAT & Sign-off',
        role: 'Client & Vendor',
        description: 'Final deployment to production/staging, user acceptance testing sign-off, and invoicing closure.',
        keyOutputs: ['Production Release', 'Client Acceptance', 'Final Billing Invoice'],
        isCurrent: curr === 4,
        isPast: false,
      },
    ];
  });
}

