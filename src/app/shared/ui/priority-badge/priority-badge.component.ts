import { Component, Input } from '@angular/core';
import { Priority } from '@/shared/util/constants';

const PRIORITY_CLASS: Record<Priority, string> = {
  Low: 'bg-priority-low text-priority-low-foreground',
  Medium: 'bg-priority-medium text-priority-medium-foreground',
  High: 'bg-priority-high text-priority-high-foreground',
  Critical: 'bg-priority-critical text-priority-critical-foreground',
};

@Component({
  selector: 'app-priority-badge',
  standalone: true,
  template: `
    <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold {{ PRIORITY_CLASS[priority] }}">
      {{ priority }}
    </span>
  `,
})
export class PriorityBadgeComponent {
  @Input({ required: true }) priority: Priority = 'Medium';
  readonly PRIORITY_CLASS = PRIORITY_CLASS;
}
