import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-data-table',
  standalone: true,
  template: `
    <div class="overflow-hidden rounded-[10px] border border-border bg-card">
      <div class="overflow-x-auto px-6 pt-3">
        <table class="w-full min-w-[900px] text-left text-sm">
          <thead class="border-b border-border text-xs font-semibold uppercase text-muted-foreground">
            <ng-content select="[header]" />
          </thead>
          <tbody>
            <ng-content select="[body]" />
          </tbody>
        </table>
      </div>
      @if (total) {
        <div class="flex items-center justify-between px-6 py-4 text-sm text-muted-foreground">
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
