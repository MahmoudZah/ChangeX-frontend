import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StatusTransition } from '@/features/change-requests/data-access/status.model';

@Component({
  selector: 'app-status-change-modal',
  standalone: true,
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true">
      <section class="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"><h2 class="text-xl font-bold">Update Status</h2><p class="mt-1 text-sm text-muted-foreground">Choose the next valid workflow state.</p><div class="mt-5 grid gap-2">@for (status of statuses; track status.id) { <button type="button" class="rounded-lg border border-border px-4 py-3 text-left text-sm font-semibold hover:border-primary" (click)="selected.emit(status)">{{ status.label }}</button> }</div><button type="button" class="mt-5 h-10 w-full rounded-lg border border-border text-sm font-semibold" (click)="closed.emit()">Cancel</button></section>
    </div>
  `,
})
export class StatusChangeModalComponent {
  @Input() statuses: StatusTransition[] = [];
  @Output() selected = new EventEmitter<StatusTransition>();
  @Output() closed = new EventEmitter<void>();
}
