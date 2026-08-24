import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface ReworkContext {
  message: string;
  files: File[];
}

export function isValidReworkContext(message: string, files: readonly File[]): boolean {
  return message.trim().length > 0 || files.length > 0;
}

@Component({
  selector: 'app-rework-context',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './rework-context.component.html',
})
export class ReworkContextComponent {
  @Input() busy = false;
  @Output() submitted = new EventEmitter<ReworkContext>();
  @Output() canceled = new EventEmitter<void>();

  readonly files = signal<File[]>([]);
  readonly error = signal('');
  message = '';

  messageChanged(value: string): void {
    this.message = value;
    if (isValidReworkContext(value, this.files())) this.error.set('');
  }

  selectFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selected = Array.from(input.files ?? []);
    input.value = '';
    if (!selected.length) return;

    const invalid = selected.find((file) => {
      const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
      return !ALLOWED_EXTENSIONS.includes(extension) || file.size > MAX_FILE_SIZE;
    });
    if (invalid) {
      this.error.set('Use PDF, Word, Excel, JPG, or PNG files up to 10 MB each.');
      return;
    }

    this.error.set('');
    this.files.update((current) => {
      const keys = new Set(current.map((file) => this.fileKey(file)));
      return [...current, ...selected.filter((file) => !keys.has(this.fileKey(file)))];
    });
  }

  removeFile(index: number): void {
    this.files.update((current) => current.filter((_, fileIndex) => fileIndex !== index));
  }

  submit(): void {
    if (this.busy) return;
    const message = this.message.trim();
    const files = this.files();
    if (!isValidReworkContext(message, files)) {
      this.error.set('Please add a message or attach at least one file.');
      return;
    }

    this.error.set('');
    this.submitted.emit({ message, files: [...files] });
  }

  private fileKey(file: File): string {
    return `${file.name}:${file.size}:${file.lastModified}`;
  }
}
