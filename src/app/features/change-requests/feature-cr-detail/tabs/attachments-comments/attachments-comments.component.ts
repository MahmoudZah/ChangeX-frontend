import { Component, Input, OnInit, inject } from '@angular/core';
import { DetailsService } from '@/features/change-requests/data-access/details.service';
import { CrAttachment, CrComment } from '@/features/change-requests/data-access/detail.model';
import { formatDate } from '@/shared/util/formatters';

@Component({
  selector: 'app-cr-attachments-comments-tab',
  standalone: true,
  templateUrl: './attachments-comments.component.html',
})
export class CrAttachmentsCommentsTabComponent implements OnInit {
  @Input({ required: true }) crId!: string;
  private details = inject(DetailsService);
  readonly formatDate = formatDate;

  comments: CrComment[] = [];
  attachments: CrAttachment[] = [];

  ngOnInit(): void {
    this.comments = this.details.commentsFor(this.crId);
    this.attachments = this.details.attachmentsFor(this.crId);
  }
}
