import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-data-table',
  standalone: true,
  template: `
    <div class="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[760px] text-left text-sm">
          <thead class="border-b border-border bg-muted/30 text-xs font-semibold uppercase text-muted-foreground">
            <ng-content select="[header]" />
          </thead>
          <tbody class="divide-y divide-border/60">
            <ng-content select="[body]" />
          </tbody>
        </table>
      </div>
      @if (total) {
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border px-5 py-4 text-xs sm:text-sm text-muted-foreground">
          <span>Showing {{ from }}–{{ to }} of {{ total }} results</span>
          <ng-content select="[pager]" />
        </div>
      }
    </div>
  `,
})
export class DataTableComponent {
  @Input() total = 0;
  @Input() from = 0;
  @Input() to = 0;
}
