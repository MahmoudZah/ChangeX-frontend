import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-data-table',
  standalone: true,
  template: `
    <div class="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              <ng-content select="[header]" />
            </tr>
          </thead>
          <tbody>
            <ng-content select="[body]" />
          </tbody>
        </table>
      </div>
      @if (total) {
        <div class="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
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
