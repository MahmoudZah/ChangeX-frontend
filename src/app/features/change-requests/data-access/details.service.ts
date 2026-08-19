import { Injectable, signal } from '@angular/core';
import { CrAttachment, CrComment } from '@/features/change-requests/data-access/detail.model';

const COMMENTS: CrComment[] = [
  {
    id: 'cm1',
    crId: 'cr-104',
    author: 'Sarah Jenkins',
    body: 'Please confirm whether contact deduplication should happen before or after order sync.',
    createdAt: '2024-10-25T15:00:00Z',
  },
  {
    id: 'cm2',
    crId: 'cr-104',
    author: 'Alex Rivera',
    body: 'We recommend deduplicating on email before pushing order events to HubSpot.',
    createdAt: '2024-10-26T10:00:00Z',
  },
];

const ATTACHMENTS: CrAttachment[] = [
  {
    id: 'a1',
    crId: 'cr-104',
    fileName: 'hubspot-field-mapping.pdf',
    fileType: 'pdf',
    uploadedAt: '2024-10-24T11:00:00Z',
  },
  {
    id: 'a2',
    crId: 'cr-104',
    fileName: 'sync-sequence-diagram.png',
    fileType: 'png',
    uploadedAt: '2024-10-25T09:00:00Z',
  },
];

@Injectable({ providedIn: 'root' })
export class DetailsService {
  private _comments = signal<CrComment[]>(COMMENTS);
  private _attachments = signal<CrAttachment[]>(ATTACHMENTS);

  commentsFor(crId: string): CrComment[] {
    return this._comments().filter((c) => c.crId === crId);
  }

  attachmentsFor(crId: string): CrAttachment[] {
    return this._attachments().filter((a) => a.crId === crId);
  }
}
