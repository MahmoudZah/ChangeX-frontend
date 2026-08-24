import { CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { apiErrorMessage } from '@/core/http/api-contract';
import { ChangeRequest } from '@/features/change-requests/data-access/cr.model';
import { CrsService } from '@/features/change-requests/data-access/crs.service';

export interface EstimateDraft {
  hours: number;
  rate: number;
  startDate: string;
  finishDate: string;
}

export interface EstimateValidationErrors {
  hours?: string;
  rate?: string;
  startDate?: string;
  finishDate?: string;
}

export function validateEstimateDraft(draft: EstimateDraft): EstimateValidationErrors {
  const errors: EstimateValidationErrors = {};
  if (!Number.isFinite(draft.hours) || draft.hours <= 0) {
    errors.hours = 'Estimated man hours must be greater than 0.';
  }
  if (!Number.isFinite(draft.rate) || draft.rate <= 0) {
    errors.rate = 'Man hour rate must be greater than 0.';
  }
  if (!draft.startDate) errors.startDate = 'Start date is required.';
  if (!draft.finishDate) errors.finishDate = 'Finish date is required.';
  else if (draft.startDate && draft.finishDate < draft.startDate) {
    errors.finishDate = 'Finish date must be on or after the start date.';
  }
  return errors;
}

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
            <label class="block" for="estimate-hours"><span class="mb-2 block text-sm font-semibold">Estimated Man Hours *</span><input id="estimate-hours" [(ngModel)]="hours" (ngModelChange)="draftChanged()" name="hours" type="number" min="0.01" step="0.01" required [attr.aria-invalid]="fieldError('hours') ? 'true' : null" aria-describedby="estimate-hours-error" class="h-11 w-full rounded-lg border bg-card px-4 text-sm" [class.border-destructive]="fieldError('hours')" [class.border-border]="!fieldError('hours')" />@if (fieldError('hours'); as message) { <small id="estimate-hours-error" class="mt-1 block text-xs text-destructive">{{ message }}</small> }</label>
            <label class="block" for="estimate-rate"><span class="mb-2 block text-sm font-semibold">Man Hour Rate *</span><input id="estimate-rate" [(ngModel)]="rate" (ngModelChange)="draftChanged()" name="rate" type="number" min="0.01" step="0.01" required [attr.aria-invalid]="fieldError('rate') ? 'true' : null" aria-describedby="estimate-rate-error" class="h-11 w-full rounded-lg border bg-card px-4 text-sm" [class.border-destructive]="fieldError('rate')" [class.border-border]="!fieldError('rate')" />@if (fieldError('rate'); as message) { <small id="estimate-rate-error" class="mt-1 block text-xs text-destructive">{{ message }}</small> }</label>
            <label class="block" for="estimate-start-date"><span class="mb-2 block text-sm font-semibold">Start Date *</span><input id="estimate-start-date" [(ngModel)]="startDate" (ngModelChange)="draftChanged()" name="startDate" type="date" required [attr.aria-invalid]="fieldError('startDate') ? 'true' : null" aria-describedby="estimate-start-date-error" class="h-11 w-full rounded-lg border bg-card px-4 text-sm" [class.border-destructive]="fieldError('startDate')" [class.border-border]="!fieldError('startDate')" />@if (fieldError('startDate'); as message) { <small id="estimate-start-date-error" class="mt-1 block text-xs text-destructive">{{ message }}</small> }</label>
            <label class="block" for="estimate-finish-date"><span class="mb-2 block text-sm font-semibold">Finish Date *</span><input id="estimate-finish-date" [(ngModel)]="finishDate" (ngModelChange)="draftChanged()" name="finishDate" type="date" required [attr.aria-invalid]="fieldError('finishDate') ? 'true' : null" aria-describedby="estimate-finish-date-error" class="h-11 w-full rounded-lg border bg-card px-4 text-sm" [class.border-destructive]="fieldError('finishDate')" [class.border-border]="!fieldError('finishDate')" />@if (fieldError('finishDate'); as message) { <small id="estimate-finish-date-error" class="mt-1 block text-xs text-destructive">{{ message }}</small> }</label>
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
  @Output() validityChange = new EventEmitter<boolean>();

  private crs = inject(CrsService);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  readonly attempted = signal(false);
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
    this.validityChange.emit(this.isValid());
  }

  async save(): Promise<void> {
    if (this.busy()) return;
    this.error.set('');
    this.notice.set('');
    if (!this.validate()) return;

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

  validate(): boolean {
    this.attempted.set(true);
    const valid = this.isValid();
    this.validityChange.emit(valid);
    this.error.set(valid ? '' : 'Complete every required estimation field before continuing.');
    return valid;
  }

  draftChanged(): void {
    const valid = this.isValid();
    this.validityChange.emit(valid);
    if (this.attempted()) {
      this.error.set(valid ? '' : 'Complete every required estimation field before continuing.');
    }
  }

  fieldError(field: keyof EstimateValidationErrors): string {
    if (!this.attempted()) return '';
    return this.validationErrors()[field] ?? '';
  }

  private isValid(): boolean {
    return Object.keys(this.validationErrors()).length === 0;
  }

  private validationErrors(): EstimateValidationErrors {
    return validateEstimateDraft({
      hours: Number(this.hours),
      rate: Number(this.rate),
      startDate: this.startDate,
      finishDate: this.finishDate,
    });
  }

  private usableDate(value: string): string {
    return value && !value.startsWith('0001-01-01') ? value.slice(0, 10) : '';
  }
}
