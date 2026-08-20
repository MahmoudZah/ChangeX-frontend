import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CrsService } from '@/features/change-requests/data-access/crs.service';
import { ChangeRequest } from '@/features/change-requests/data-access/cr.model';
import { CrOverviewTabComponent } from '@/features/change-requests/feature-cr-detail/tabs/overview/overview.component';
import { CrStatusTimelineTabComponent } from '@/features/change-requests/feature-cr-detail/tabs/status-timeline/status-timeline.component';
import { CrAttachmentsCommentsTabComponent } from '@/features/change-requests/feature-cr-detail/tabs/attachments-comments/attachments-comments.component';
import { PriorityBadgeComponent } from '@/shared/ui/priority-badge/priority-badge.component';
import { StatusBadgeComponent } from '@/shared/ui/status-badge/status-badge.component';
import { formatDate } from '@/shared/util/formatters';

type Tab = 'overview' | 'timeline' | 'comments';

@Component({
  selector: 'app-cr-detail',
  standalone: true,
  imports: [
    RouterLink,
    StatusBadgeComponent,
    PriorityBadgeComponent,
    CrOverviewTabComponent,
    CrStatusTimelineTabComponent,
    CrAttachmentsCommentsTabComponent,
  ],
  templateUrl: './cr-detail.component.html',
})
export class CrDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private crs = inject(CrsService);

  readonly formatDate = formatDate;
  cr = signal<ChangeRequest | null>(null);
  tab = signal<Tab>('overview');
  attachmentCount = signal(0);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    void this.loadCr(id);
  }

  private async loadCr(id: string): Promise<void> {
    const found = await this.crs.getById(id);
    this.cr.set(found);
  }
}
