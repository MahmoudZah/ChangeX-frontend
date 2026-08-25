import { Component, Input } from '@angular/core';

const PRIORITY_CLASS: Record<string, string> = {
  Low: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20',
  Medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  High: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20',
  Critical: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold',
};

@Component({
  selector: 'app-priority-badge',
  standalone: true,
  template: `
    <span class="inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold leading-relaxed tracking-tight transition-colors {{ badgeClass }}">
      {{ priority }}
    </span>
  `,
})
export class PriorityBadgeComponent {
  @Input({ required: true }) priority: string = 'Medium';

  get badgeClass(): string {
    return PRIORITY_CLASS[this.priority] ?? 'bg-muted text-muted-foreground border border-border';
  }
}


