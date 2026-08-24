import { CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { apiErrorMessage } from '@/core/http/api-contract';
import { ChangeRequest } from '@/features/change-requests/data-access/cr.model';
import { CrsService } from '@/features/change-requests/data-access/crs.service';

@Component({
  selector: 'app-cr-estimation-tab',
  standalone: true,
  imports: [CurrencyPipe, FormsModule],
  template: `
    <section class="rounded-[10px] border border-border bg-card p-6">
      <div>
        <h2 class="text-lg font-bold">Engineering Estimate</h2>
        <p class="mt-1 text-sm text-muted-foreground">Prepared by the delivery admin after the CR is accepted.</p>
      </div>

      @if (canEdit) {
        <form class="mt-6" (ngSubmit)="save()" novalidate>
          <div class="grid gap-5 sm:grid-cols-2">
            <label class="block"><span class="mb-2 block text-sm font-semibold">Estimated Man Hours *</span><input [(ngModel)]="hours" name="hours" type="number" min="0.01" step="0.01" required class="h-11 w-full rounded-lg border border-border bg-card px-4 text-sm" /></label>
            <label class="block"><span class="mb-2 block text-sm font-semibold">Man Hour Rate *</span><input [(ngModel)]="rate" name="rate" type="number" min="0.01" step="0.01" required class="h-11 w-full rounded-lg border border-border bg-card px-4 text-sm" /></label>
            <label class="block"><span class="mb-2 block text-sm font-semibold">Start Date *</span><input [(ngModel)]="startDate" name="startDate" type="date" required class="h-11 w-full rounded-lg border border-border bg-card px-4 text-sm" /></label>
            <label class="block"><span class="mb-2 block text-sm font-semibold">Finish Date *</span><input [(ngModel)]="finishDate" name="finishDate" type="date" required class="h-11 w-full rounded-lg border border-border bg-card px-4 text-sm" /></label>
          </div>
          <div class="mt-5 rounded-lg bg-muted/30 p-4"><span class="text-sm text-muted-foreground">Estimated total</span><strong class="ml-3 text-lg">{{ hours * rate | currency:'USD' }}</strong></div>
          @if (error()) { <p class="mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{{ error() }}</p> }
          @if (notice()) { <p class="mt-4 rounded-lg bg-status-accepted px-4 py-3 text-sm text-status-accepted-foreground">{{ notice() }}</p> }
          <button type="submit" [disabled]="busy()" class="mt-5 h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-white disabled:opacity-60">{{ busy() ? 'Saving…' : 'Save Estimate' }}</button>
        </form>
      } @else {
        <dl class="mt-5 grid gap-4 sm:grid-cols-3">
          <div><dt class="text-xs font-semibold uppercase text-muted-foreground">Hours</dt><dd class="mt-1 text-xl font-bold">{{ cr.estimatedHours || '—' }}</dd></div>
          <div><dt class="text-xs font-semibold uppercase text-muted-foreground">Rate</dt><dd class="mt-1 text-xl font-bold">{{ cr.hourlyRate ? (cr.hourlyRate | currency:'USD') + '/hr' : '—' }}</dd></div>
          <div><dt class="text-xs font-semibold uppercase text-muted-foreground">Total</dt><dd class="mt-1 text-xl font-bold">{{ cr.estimatedCost ? (cr.estimatedCost | currency:'USD') : '—' }}</dd></div>
        </dl>
      }
    </section>
  `,
})
export class EstimationComponent implements OnChanges {
  @Input({ required: true }) cr!: ChangeRequest;
  @Input() canEdit = false;
  @Output() saved = new EventEmitter<ChangeRequest>();

  private crs = inject(CrsService);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  hours = 0;
  rate = 0;
  startDate = '';
  finishDate = '';

  ngOnChanges(): void {
    if (!this.cr || this.busy()) return;
    this.hours = this.cr.estimatedHours;
    this.rate = this.cr.hourlyRate;
    this.startDate = this.usableDate(this.cr.startDate);
    this.finishDate = this.usableDate(this.cr.finishDate);
  }

  async save(): Promise<void> {
    if (this.busy()) return;
    this.error.set('');
    this.notice.set('');
    if (this.hours <= 0 || this.rate <= 0 || !this.startDate || !this.finishDate || this.finishDate < this.startDate) {
      this.error.set('Enter positive hours and rate, with a finish date on or after the start date.');
      return;
    }

    this.busy.set(true);
    try {
      const updated = await this.crs.updateEstimate(this.cr.id, {
        estimatedManHour: this.hours,
        manHourRate: this.rate,
        startDate: this.startDate,
        finishDate: this.finishDate,
      });
      this.notice.set(this.crs.lastMessage() || 'Estimate saved. Use the available workflow transition when it is ready for client approval.');
      this.saved.emit(updated);
    } catch (error) {
      this.error.set(apiErrorMessage(error, 'The estimate could not be saved.'));
    } finally {
      this.busy.set(false);
    }
  }

  private usableDate(value: string): string {
    return value && !value.startsWith('0001-01-01') ? value.slice(0, 10) : '';
  }
}
