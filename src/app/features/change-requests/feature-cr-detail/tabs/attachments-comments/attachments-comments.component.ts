import { Component, computed, inject, Input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { apiErrorMessage } from '@/core/http/api-contract';
import { CrDetail } from '@/features/change-requests/data-access/detail.model';
import { DetailsService } from '@/features/change-requests/data-access/details.service';
import { formatDate } from '@/shared/util/formatters';

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'];

@Component({ selector: 'app-cr-attachments-comments-tab', standalone: true, imports: [FormsModule], templateUrl: './attachments-comments.component.html' })
export class CrAttachmentsCommentsTabComponent implements OnInit {
  @Input({ required: true }) crId = '';
  private service = inject(DetailsService);
  readonly formatDate = formatDate;
  readonly loading = this.service.loading;
  readonly loadError = this.service.error;
  readonly records = computed(() => this.service.detailsFor(this.crId));
  readonly editingId = signal('');
  readonly busy = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  readonly fileName = signal('');
  comment = '';
  selectedFile: File | null = null;

  async ngOnInit(): Promise<void> { await this.service.loadFor(this.crId); }
  async retry(): Promise<void> { await this.service.loadFor(this.crId); }
  beginEdit(record: CrDetail): void { this.editingId.set(record.id); this.comment = record.comment; this.selectedFile = null; this.fileName.set(''); this.error.set(''); }
  cancelEdit(): void { this.editingId.set(''); this.comment = ''; this.selectedFile = null; this.fileName.set(''); }
  isDownloadable(url: string): boolean { return url.startsWith('/attachments/'); }

  selectFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile = null; this.fileName.set(''); this.error.set('');
    if (!file) return;
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ALLOWED_EXTENSIONS.includes(extension) || file.size > 10 * 1024 * 1024) { input.value = ''; this.error.set('Use a PDF, Word, Excel, JPG, or PNG file up to 10 MB.'); return; }
    this.selectedFile = file; this.fileName.set(file.name);
  }

  async save(): Promise<void> {
    if (this.busy()) return;
    if (!this.editingId() && !this.selectedFile) { this.error.set('Choose an attachment. The API requires a file for every new message.'); return; }
    if (!this.comment.trim() && !this.selectedFile) { this.error.set('Enter a message or choose a replacement attachment.'); return; }
    this.busy.set(true); this.error.set(''); this.notice.set('');
    try {
      if (this.editingId()) await this.service.update(this.editingId(), this.crId, this.comment.trim(), this.selectedFile ?? undefined);
      else await this.service.create(this.crId, this.comment.trim(), this.selectedFile!);
      this.notice.set(this.service.lastMessage()); this.cancelEdit();
    } catch (error) { this.error.set(apiErrorMessage(error, 'The comment and attachment could not be saved.')); }
    finally { this.busy.set(false); }
  }

  async deleteRecord(record: CrDetail): Promise<void> {
    if (this.busy() || !window.confirm(`Delete this ${record.fileName ? 'attachment and message' : 'message'}?`)) return;
    this.busy.set(true); this.error.set('');
    try { this.notice.set(await this.service.delete(record.id)); }
    catch (error) { this.error.set(apiErrorMessage(error, 'The detail record could not be deleted.')); }
    finally { this.busy.set(false); }
  }
}
