import { Component, inject, HostListener } from '@angular/core';
import { ConfirmDialogService } from './confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (dialog.state().isOpen) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150"
        (click)="onBackdropClick($event)"
      >
        <div
          class="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150"
          role="dialog"
          aria-modal="true"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-start gap-4">
            <!-- Icon Indicator -->
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl {{ iconContainerClass }}">
              @if (dialog.state().variant === 'danger') {
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              } @else if (dialog.state().variant === 'warning') {
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              } @else if (dialog.state().variant === 'success') {
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              } @else {
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              }
            </div>

            <div class="min-w-0 flex-1">
              <h3 class="text-base font-bold text-foreground">{{ dialog.state().title }}</h3>
              <p class="mt-1.5 text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{{ dialog.state().message }}</p>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-2.5 border-t border-border pt-4">
            @if (dialog.state().type === 'confirm') {
              <button
                type="button"
                (click)="dialog.handleCancel()"
                class="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-card px-4 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
              >
                {{ dialog.state().cancelText }}
              </button>
            }

            <button
              type="button"
              (click)="dialog.handleConfirm()"
              class="inline-flex h-9 items-center justify-center rounded-xl px-5 text-xs font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-95 {{ confirmBtnClass }}"
            >
              {{ dialog.state().confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  readonly dialog = inject(ConfirmDialogService);

  get iconContainerClass(): string {
    const variant = this.dialog.state().variant;
    switch (variant) {
      case 'danger':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
      case 'warning':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case 'success':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      default:
        return 'bg-primary/10 text-primary';
    }
  }

  get confirmBtnClass(): string {
    const variant = this.dialog.state().variant;
    switch (variant) {
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700';
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700';
      default:
        return 'bg-primary hover:opacity-90';
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.dialog.state().isOpen) {
      this.dialog.handleCancel();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.dialog.handleCancel();
    }
  }
}
