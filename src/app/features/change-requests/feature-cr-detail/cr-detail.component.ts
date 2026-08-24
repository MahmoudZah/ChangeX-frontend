import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '@/core/auth/auth.service';
import { apiErrorMessage } from '@/core/http/api-contract';
import { ChangeRequest } from '@/features/change-requests/data-access/cr.model';
import { CrsService } from '@/features/change-requests/data-access/crs.service';
import { DetailsService } from '@/features/change-requests/data-access/details.service';
import { StatusTransition } from '@/features/change-requests/data-access/status.model';
import { StatusesService } from '@/features/change-requests/data-access/statuses.service';
import { CrAttachmentsCommentsTabComponent } from '@/features/change-requests/feature-cr-detail/tabs/attachments-comments/attachments-comments.component';
import { EstimationComponent } from '@/features/change-requests/feature-cr-detail/tabs/estimation/estimation.component';
import { CrOverviewTabComponent } from '@/features/change-requests/feature-cr-detail/tabs/overview/overview.component';
import { CrStatusTimelineTabComponent } from '@/features/change-requests/feature-cr-detail/tabs/status-timeline/status-timeline.component';
import { PriorityBadgeComponent } from '@/shared/ui/priority-badge/priority-badge.component';
import { StatusBadgeComponent } from '@/shared/ui/status-badge/status-badge.component';
import { formatDate } from '@/shared/util/formatters';

type Tab = 'overview' | 'estimate' | 'timeline' | 'comments';

@Component({ selector: 'app-cr-detail', standalone: true, imports: [RouterLink, StatusBadgeComponent, PriorityBadgeComponent, CrOverviewTabComponent, EstimationComponent, CrStatusTimelineTabComponent, CrAttachmentsCommentsTabComponent], templateUrl: './cr-detail.component.html' })
export class CrDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private crs = inject(CrsService);
  private auth = inject(AuthService);
  private details = inject(DetailsService);
  readonly statuses = inject(StatusesService);
  readonly formatDate = formatDate;
  readonly isAdmin = this.auth.isAdmin;
  readonly cr = signal<ChangeRequest | null>(null);
  readonly tab = signal<Tab>('overview');
  readonly loading = signal(true);
  readonly forbidden = signal(false);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly notice = signal((window.history.state as { notice?: string }).notice ?? '');
  readonly transitions = computed(() => this.statuses.getAvailableForCr(this.cr()?.id ?? ''));
  readonly canAct = computed(() => this.statuses.canAct(this.cr()?.id ?? '', this.auth.user()?.role));
  readonly attachmentCount = computed(() => this.details.detailsFor(this.cr()?.id ?? '').length);

  async ngOnInit(): Promise<void> { await this.load(); }
  async load(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.loading.set(true); this.error.set(''); this.forbidden.set(false);
    try {
      const item = await this.crs.getById(id);
      if (item && !this.auth.isAdmin() && item.clientId !== this.auth.user()?.clientId) this.forbidden.set(true);
      else this.cr.set(item);
      if (item && !this.forbidden()) await this.details.loadFor(id);
    } catch (error) { this.error.set(apiErrorMessage(error, 'The change request could not be loaded.')); }
    finally { this.loading.set(false); }
  }

  async changeTo(target: StatusTransition): Promise<void> {
    const item = this.cr();
    if (!item || this.busy() || !this.canAct()) return;
    this.busy.set(true); this.error.set(''); this.notice.set('');
    try {
      this.cr.set(await this.crs.changeStatus(item.id, target.id));
      await this.statuses.loadForCr(item.id);
      this.notice.set(this.crs.lastMessage() || `Status changed to ${target.label}.`);
    } catch (error) { this.error.set(apiErrorMessage(error, 'The status could not be updated.')); }
    finally { this.busy.set(false); }
  }

  async deleteCr(item: ChangeRequest): Promise<void> {
    if (this.busy() || !window.confirm(`Delete ${item.name}? This cannot be undone.`)) return;
    this.busy.set(true); this.error.set('');
    try { const notice = await this.crs.delete(item.id); await this.router.navigate(['/change-requests'], { state: { notice } }); }
    catch (error) { this.error.set(apiErrorMessage(error, 'The change request could not be deleted.')); }
    finally { this.busy.set(false); }
  }

  selectTab(id: string): void {
    if (['overview', 'estimate', 'timeline', 'comments'].includes(id)) this.tab.set(id as Tab);
  }
}
