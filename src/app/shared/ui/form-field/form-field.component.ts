import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-form-field',
  standalone: true,
  template: `
    <label class="mb-1.5 block text-sm font-semibold text-foreground">{{ label }}</label>
    <ng-content />
    @if (error) {
      <p class="mt-1 text-xs text-destructive">{{ error }}</p>
    }
  `,
})
export class FormFieldComponent {
  @Input({ required: true }) label = '';
  @Input() error = '';
}
