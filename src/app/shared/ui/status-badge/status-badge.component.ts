import { Component, Input } from '@angular/core';

const STATUS_CLASS: Record<string, { badge: string; dot: string }> = {
  'Pending Estimate': { badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20', dot: 'bg-amber-500' },
  'Pending Vendor FeedBack': { badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20', dot: 'bg-amber-500 animate-pulse-subtle' },
  'Pending Client Clarification': { badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20', dot: 'bg-orange-500 animate-pulse-subtle' },
  'Pending Client Approval': { badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20', dot: 'bg-purple-500 animate-pulse-subtle' },
  'Pending Customer Approval': { badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20', dot: 'bg-purple-500 animate-pulse-subtle' },
  Pending: { badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20', dot: 'bg-amber-500' },
  'Under Review': { badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20', dot: 'bg-indigo-500' },
  'Estimate Approval': { badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20', dot: 'bg-purple-500' },
  Estimating: { badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20', dot: 'bg-blue-500' },
  Delayed: { badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20', dot: 'bg-rose-500' },
  'In Progress': { badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20', dot: 'bg-sky-500 animate-pulse-subtle' },
  Accepted: { badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20', dot: 'bg-emerald-500' },
  'Accepted (CR)': { badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20', dot: 'bg-emerald-500' },
  'Accepted (Estimation)': { badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20', dot: 'bg-emerald-500' },
  'Accepted (Test)': { badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20', dot: 'bg-emerald-500' },
  Active: { badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20', dot: 'bg-emerald-500' },
  Rework: { badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20', dot: 'bg-orange-500' },
  Rejected: { badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20', dot: 'bg-rose-500' },
  Implemented: { badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20', dot: 'bg-teal-500' },
  Delivered: { badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20', dot: 'bg-teal-500' },
  Completed: { badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20', dot: 'bg-teal-500' },
  Canceled: { badge: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20', dot: 'bg-zinc-400' },
  Inactive: { badge: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20', dot: 'bg-zinc-400' },
  'Testing/UAT Signoff': { badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20', dot: 'bg-teal-500' },
  Draft: { badge: 'bg-muted text-muted-foreground border border-border', dot: 'bg-muted-foreground' },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold leading-relaxed tracking-tight transition-colors {{ config.badge }}">
      <span class="h-1.5 w-1.5 shrink-0 rounded-full {{ config.dot }}"></span>
      <span>{{ status }}</span>
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input({ required: true }) status = '';

  get config(): { badge: string; dot: string } {
    return STATUS_CLASS[this.status] ?? { badge: 'bg-muted text-muted-foreground border border-border', dot: 'bg-muted-foreground' };
  }
}

