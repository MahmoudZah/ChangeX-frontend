import { Component, Input } from '@angular/core';

export interface StepItem {
  label: string;
  description?: string;
  done?: boolean;
  current?: boolean;
  role?: string;
}

@Component({
  selector: 'app-stepper',
  standalone: true,
  template: `
    @if (orientation === 'horizontal') {
      <div class="relative w-full overflow-x-auto py-2">
        <ol class="flex min-w-[620px] items-center justify-between gap-2">
          @for (step of steps; track step.label; let last = $last) {
            <li class="relative flex flex-1 items-center gap-3">
              <div class="flex items-center gap-3">
                <div class="relative flex shrink-0 items-center justify-center">
                  @if (step.current) {
                    <span class="absolute -inset-1 rounded-full bg-primary/20 animate-pulse-subtle"></span>
                  }
                  <span
                    class="relative flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all shadow-sm"
                    [class.bg-approve]="step.done"
                    [class.text-approve-foreground]="step.done"
                    [class.bg-primary]="step.current"
                    [class.text-white]="step.current"
                    [class.ring-2]="step.current"
                    [class.ring-primary]="step.current"
                    [class.bg-muted]="!step.done && !step.current"
                    [class.text-muted-foreground]="!step.done && !step.current"
                    [class.border]="!step.done && !step.current"
                    [class.border-border]="!step.done && !step.current"
                  >
                    @if (step.done) {
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
                      </svg>
                    } @else {
                      {{ $index + 1 }}
                    }
                  </span>
                </div>

                <div class="min-w-0 pr-2">
                  <p
                    class="truncate text-xs font-bold leading-tight transition-colors"
                    [class.text-primary]="step.current"
                    [class.dark:text-white]="step.current"
                    [class.text-foreground]="step.done"
                    [class.text-muted-foreground]="!step.done && !step.current"
                  >
                    {{ step.label }}
                  </p>
                  @if (step.description) {
                    <p class="truncate text-[11px] text-muted-foreground">{{ step.description }}</p>
                  }
                </div>
              </div>

              @if (!last) {
                <div class="h-0.5 flex-1 rounded-full transition-all" [class.bg-approve]="step.done" [class.bg-border]="!step.done"></div>
              }
            </li>
          }
        </ol>
      </div>
    } @else {
      <ol class="space-y-4">
        @for (step of steps; track step.label; let last = $last) {
          <li class="flex gap-4">
            <div class="flex flex-col items-center">
              <span
                class="relative flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shadow-sm"
                [class.bg-approve]="step.done"
                [class.text-approve-foreground]="step.done"
                [class.bg-primary]="step.current"
                [class.text-white]="step.current"
                [class.bg-muted]="!step.done && !step.current"
                [class.text-muted-foreground]="!step.done && !step.current"
              >
                @if (step.done) {
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
                  </svg>
                } @else {
                  {{ $index + 1 }}
                }
              </span>
              @if (!last) {
                <span class="mt-1 w-0.5 flex-1 bg-border"></span>
              }
            </div>
            <div class="pb-5 min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <p class="text-sm font-semibold" [class.text-primary]="step.current" [class.text-muted-foreground]="!step.current && !step.done">
                  {{ step.label }}
                </p>
                @if (step.role) {
                  <span class="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">{{ step.role }}</span>
                }
              </div>
              @if (step.description) {
                <p class="mt-0.5 text-xs text-muted-foreground">{{ step.description }}</p>
              }
            </div>
          </li>
        }
      </ol>
    }
  `,
})

export class StepperComponent {
  @Input() steps: StepItem[] = [];
  @Input() orientation: 'horizontal' | 'vertical' = 'vertical';
}

