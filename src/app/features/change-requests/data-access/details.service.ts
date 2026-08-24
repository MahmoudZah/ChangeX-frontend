import { Injectable, inject, signal } from '@angular/core';
import { ApiEnvelope, ApiMessage, apiErrorMessage } from '@/core/http/api-contract';
import { ApiService } from '@/core/http/api.service';
import { CrDetail, DetailResponseDto } from '@/features/change-requests/data-access/detail.model';

@Injectable({ providedIn: 'root' })
export class DetailsService {
  private api = inject(ApiService);
  private _details = signal<CrDetail[]>([]);
  private _loading = signal(false);
  private _error = signal('');
  private _lastMessage = signal('');

  readonly details = this._details.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly lastMessage = this._lastMessage.asReadonly();

  detailsFor(crId: string): CrDetail[] {
    return this._details().filter((detail) => detail.crId === crId);
  }

  async loadFor(crId: string): Promise<CrDetail[]> {
    this._loading.set(true);
    this._error.set('');
    try {
      const response = await this.api.get<ApiEnvelope<DetailResponseDto[]>>('/Detail', { crId });
      const details = response.data.map((item) => this.normalize(item));
      this._details.update((current) => [...current.filter((item) => item.crId !== crId), ...details]);
      return details;
    } catch (error) {
      this._details.update((current) => current.filter((item) => item.crId !== crId));
      this._error.set(apiErrorMessage(error, 'Comments and attachments could not be loaded from the API.'));
      return [];
    } finally {
      this._loading.set(false);
    }
  }

  async create(crId: string, attachment: File, comment: string): Promise<CrDetail> {
    this._lastMessage.set('');
    const form = this.buildForm(crId, comment, attachment);
    const response = await this.api.post<ApiEnvelope<DetailResponseDto>>('/Detail', form);
    const detail = this.normalize(response.data);
    this._details.update((current) => [...current, detail]);
    this._lastMessage.set(response.message);
    return detail;
  }

  async update(id: string, crId: string, comment: string, attachment?: File): Promise<CrDetail> {
    this._lastMessage.set('');
    const form = this.buildForm(crId, comment, attachment);
    const response = await this.api.put<ApiEnvelope<DetailResponseDto>>(`/Detail/${id}`, form);
    const detail = this.normalize(response.data);
    this._details.update((current) => current.map((item) => item.id === id ? detail : item));
    this._lastMessage.set(response.message);
    return detail;
  }

  async delete(id: string): Promise<string> {
    this._lastMessage.set('');
    const response = await this.api.delete<ApiMessage>(`/Detail/${id}`);
    this._details.update((current) => current.filter((detail) => detail.id !== id));
    this._lastMessage.set(response.message);
    return response.message;
  }

  private buildForm(crId: string, comment: string, attachment?: File): FormData {
    const form = new FormData();
    form.append('CRID', crId);
    form.append('Comment', comment);
    if (attachment) form.append('Attachment', attachment);
    return form;
  }

  private normalize(raw: DetailResponseDto): CrDetail {
    const fileName = raw.attachment.split('/').pop() || 'attachment';
    return {
      id: raw.id,
      crId: raw.crid,
      attachmentUrl: raw.attachment,
      fileName,
      fileType: fileName.includes('.') ? fileName.split('.').pop() ?? 'file' : 'file',
      comment: raw.comment,
      state: raw.state,
      uploadedAt: raw.uploadedTime,
    };
  }
}
