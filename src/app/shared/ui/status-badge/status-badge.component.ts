import { Component, Input } from '@angular/core';

const STATUS_CLASS: Record<string, string> = {
  'Pending Estimate': 'bg-status-pending text-status-pending-foreground',
  'Pending Vendor FeedBack': 'bg-status-pending text-status-pending-foreground',
  'Pending Client Clarification': 'bg-status-pending text-status-pending-foreground',
  'Pending Client Approval': 'bg-status-pending text-status-pending-foreground',
  'Pending Customer Approval': 'bg-status-pending text-status-pending-foreground',
  Pending: 'bg-status-pending text-status-pending-foreground',
  'Under Review': 'bg-status-pending text-status-pending-foreground',
  'Estimate Approval': 'bg-status-pending text-status-pending-foreground',
  Estimating: 'bg-status-pending text-status-pending-foreground',
  Delayed: 'bg-status-rejected text-status-rejected-foreground',
  'In Progress': 'bg-status-progress text-status-progress-foreground',
  Accepted: 'bg-status-accepted text-status-accepted-foreground',
  'Accepted (CR)': 'bg-status-accepted text-status-accepted-foreground',
  'Accepted (Estimation)': 'bg-status-accepted text-status-accepted-foreground',
  'Accepted (Test)': 'bg-status-accepted text-status-accepted-foreground',
  Active: 'bg-status-completed text-status-completed-foreground',
  Rework: 'bg-status-rework text-status-rework-foreground',
  Rejected: 'bg-status-rejected text-status-rejected-foreground',
  Implemented: 'bg-status-delivered text-status-delivered-foreground',
  Delivered: 'bg-status-delivered text-status-delivered-foreground',
  Completed: 'bg-status-completed text-status-completed-foreground',
  Canceled: 'bg-status-rejected text-status-rejected-foreground',
  Inactive: 'bg-status-completed text-status-completed-foreground',
  'Testing/UAT Signoff': 'bg-status-delivered text-status-delivered-foreground',
  Draft: 'bg-muted text-muted-foreground',
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span class="inline-flex whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold leading-none {{ klass }}">
      {{ status }}
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input({ required: true }) status = '';

  get klass(): string {
    return STATUS_CLASS[this.status] ?? 'bg-muted text-muted-foreground';
  }
}
