import { Component, Input } from '@angular/core';

export interface StepItem {
  label: string;
  done?: boolean;
  current?: boolean;
}

@Component({
  selector: 'app-stepper',
  standalone: true,
  template: `
    <ol class="space-y-4">
      @for (step of steps; track step.label; let last = $last) {
        <li class="flex gap-3">
          <div class="flex flex-col items-center">
            <span
              class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold"
              [class.bg-approve]="step.done || step.current"
              [class.text-approve-foreground]="step.done || step.current"
              [class.bg-muted]="!step.done && !step.current"
              [class.text-muted-foreground]="!step.done && !step.current"
            >
              {{ $index + 1 }}
            </span>
            @if (!last) {
              <span class="mt-1 w-px flex-1 bg-border"></span>
            }
          </div>
          <div class="pb-4">
            <p class="text-sm font-medium" [class.text-muted-foreground]="!step.current && !step.done">
              {{ step.label }}
            </p>
          </div>
        </li>
      }
    </ol>
  `,
})
export class StepperComponent {
  @Input() steps: StepItem[] = [];
}
