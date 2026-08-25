import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
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
import { ReworkContext, ReworkContextComponent } from '@/features/change-requests/feature-cr-detail/rework-context/rework-context.component';
import { CrOverviewTabComponent } from '@/features/change-requests/feature-cr-detail/tabs/overview/overview.component';
import { CrStatusTimelineTabComponent } from '@/features/change-requests/feature-cr-detail/tabs/status-timeline/status-timeline.component';
import { PriorityBadgeComponent } from '@/shared/ui/priority-badge/priority-badge.component';
import { StatusBadgeComponent } from '@/shared/ui/status-badge/status-badge.component';
import { StepItem, StepperComponent } from '@/shared/ui/stepper/stepper.component';
import { formatDate } from '@/shared/util/formatters';
import { CR_STATUS_IDS, crTransitionKind, crWorkflowPhaseIndex, normalizeStatusId } from '@/shared/util/cr-status-workflow';

type Tab = 'overview' | 'estimate' | 'timeline' | 'comments';

@Component({
  selector: 'app-cr-detail',
  standalone: true,
  imports: [
    RouterLink,
    StatusBadgeComponent,
    PriorityBadgeComponent,
    StepperComponent,
    CrOverviewTabComponent,
    EstimationComponent,
    ReworkContextComponent,
    CrStatusTimelineTabComponent,
    CrAttachmentsCommentsTabComponent,
  ],
  templateUrl: './cr-detail.component.html',
})
export class CrDetailComponent implements OnInit {
  @ViewChild(EstimationComponent) private estimation?: EstimationComponent;

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
  readonly notice = signal(((window.history.state ?? {}) as { notice?: string }).notice ?? '');
  readonly reworkTarget = signal<StatusTransition | null>(null);
  readonly estimateDraftValid = signal(false);
  readonly transitions = computed(() => this.statuses.getAvailableForCr(this.cr()?.id ?? ''));
  readonly canAct = computed(() => this.statuses.canAct(this.cr()?.id ?? '', this.auth.user()?.role));

  readonly primaryTransitions = computed(() => {
    return this.transitions().filter((transition) => crTransitionKind(transition.id) === 'primary');
  });

  readonly secondaryTransitions = computed(() => {
    return this.transitions().filter((transition) => crTransitionKind(transition.id) !== 'primary');
  });

  readonly lifecycleSteps = computed<StepItem[]>(() => {
    const activeIndex = crWorkflowPhaseIndex(this.cr()?.currentStatusID);

    return [
      { label: 'Submitted', description: 'Request created', done: activeIndex > 0, current: activeIndex === 0 },
      { label: 'Estimation', description: 'Scope & pricing', done: activeIndex > 1, current: activeIndex === 1, role: 'Vendor' },
      { label: 'Client Approval', description: 'Estimate sign-off', done: activeIndex > 2, current: activeIndex === 2, role: 'Client' },
      { label: 'Implementation', description: 'Engineering & QA', done: activeIndex > 3, current: activeIndex === 3, role: 'Engineering' },
      { label: 'Delivered', description: 'Verified & closed', done: activeIndex >= 4, current: activeIndex === 4 },
    ];
  });

  readonly actionOwnerInfo = computed(() => {
    const item = this.cr();
    if (!item) return null;
    const current = this.statuses.getCurrentForCr(item.id);
    if (!current) return null;
    const accessedBy = current?.accessedBy.toLowerCase();
    const isUserTurn = this.canAct();

    if (accessedBy === 'admin') {
      return {
        role: 'Vendor Admin',
        isUserTurn,
        badgeClass: 'bg-primary/10 text-primary border border-primary/20',
        description: isUserTurn
          ? 'You have action required on this request. Prepare the estimate or advance the workflow.'
          : 'Awaiting Vendor Admin response and cost estimation.',
      };
    } else {
      return {
        role: 'Client Account',
        isUserTurn,
        badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
        description: isUserTurn
          ? 'Your review and confirmation are required to proceed with implementation.'
          : 'Awaiting client approval or requested clarification.',
      };
    }
  });

  readonly canEditEstimate = computed(() => {
    const item = this.cr();
    const currentStatusId = this.statuses.getCurrentForCr(item?.id ?? '')?.id;
    return this.isAdmin() && this.canAct() && !!item &&
      !this.hasCompleteEstimate(item) &&
      normalizeStatusId(currentStatusId) === CR_STATUS_IDS.acceptedCr;
  });
  readonly attachmentCount = computed(() => this.details.detailsFor(this.cr()?.id ?? '').length);

  async ngOnInit(): Promise<void> { await this.load(); }
  async load(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.loading.set(true); this.error.set(''); this.forbidden.set(false);
    try {
      const item = await this.crs.getById(id);
      if (item && !this.auth.isAdmin() && item.clientId !== this.auth.user()?.clientId) this.forbidden.set(true);
      else this.cr.set(item);
      if (item && !this.forbidden()) {
        await this.details.loadFor(id);
        if (normalizeStatusId(this.statuses.getCurrentForCr(id)?.id) === CR_STATUS_IDS.pendingClientClarification) {
          this.tab.set('comments');
        } else if (this.canEditEstimate()) {
          this.tab.set('estimate');
        }
        if (((window.history.state ?? {}) as { openRework?: boolean }).openRework) {
          const target = this.transitions().find((transition) => crTransitionKind(transition.id) === 'rework');
          if (target) this.reworkTarget.set(target);
        }
      }
    } catch (error) { this.error.set(apiErrorMessage(error, 'The change request could not be loaded.')); }
    finally { this.loading.set(false); }
  }

  async changeTo(target: StatusTransition): Promise<void> {
    const item = this.cr();
    if (!item || this.busy() || !this.canAct()) return;
    if (this.blockIncompleteEstimate()) return;
    if (crTransitionKind(target.id) === 'rework') {
      this.error.set('');
      this.notice.set('');
      this.reworkTarget.set(target);
      return;
    }

    this.busy.set(true); this.error.set(''); this.notice.set('');
    try {
      await this.performTransition(target);
    } catch (error) { this.error.set(apiErrorMessage(error, 'The status could not be updated.')); }
    finally { this.busy.set(false); }
  }

  async submitRework(context: ReworkContext): Promise<void> {
    const item = this.cr();
    const target = this.reworkTarget();
    if (!item || !target || this.busy()) return;

    this.busy.set(true); this.error.set(''); this.notice.set('');
    try {
      await this.details.createReworkContext(item.id, context.message, context.files);
      await this.performTransition(target);
      this.reworkTarget.set(null);
      this.notice.set('Rework requested with the supplied context.');
    } catch (error) {
      this.error.set(apiErrorMessage(error, 'The Rework context could not be saved.'));
    } finally {
      this.busy.set(false);
    }
  }

  async estimateSaved(updated: ChangeRequest): Promise<void> {
    this.cr.set(updated);
    this.error.set('');
    const nextTransitions = this.transitions();
    if (nextTransitions.length === 1) {
      await this.changeTo(nextTransitions[0]);
      return;
    }
    this.notice.set(this.crs.lastMessage() || 'Estimate saved.');
  }

  async deleteCr(item: ChangeRequest): Promise<void> {
    if (this.busy() || !window.confirm(`Delete ${item.name}? This cannot be undone.`)) return;
    this.busy.set(true); this.error.set('');
    try { const notice = await this.crs.delete(item.id); await this.router.navigate(['/change-requests'], { state: { notice } }); }
    catch (error) { this.error.set(apiErrorMessage(error, 'The change request could not be deleted.')); }
    finally { this.busy.set(false); }
  }

  selectTab(id: string): void {
    if (!['overview', 'estimate', 'timeline', 'comments'].includes(id)) return;
    if (id !== 'estimate' && this.blockIncompleteEstimate()) return;
    this.error.set('');
    this.tab.set(id as Tab);
  }

  cancelRework(): void {
    if (!this.busy()) this.reworkTarget.set(null);
  }

  private blockIncompleteEstimate(): boolean {
    if (!this.canEditEstimate()) return false;
    this.tab.set('estimate');
    const valid = this.estimation?.validate() ?? false;
    this.estimateDraftValid.set(valid);
    this.error.set(valid
      ? 'Save the valid estimate before continuing to another workflow step.'
      : 'Complete the required estimation fields before continuing.');
    return true;
  }

  private async performTransition(target: StatusTransition): Promise<void> {
    const item = this.cr();
    if (!item) return;
    const updated = await this.crs.changeStatus(item.id, target.id);
    this.cr.set(updated);
    this.notice.set(this.crs.lastMessage() || `Status changed to ${target.label}.`);
    if (crTransitionKind(target.id) === 'clarification') {
      this.tab.set('comments');
      this.notice.set('Clarification requested. Add the message and required attachment below for the client.');
      return;
    }

    const currentStatus = this.statuses.getCurrentForCr(item.id);
    if (currentStatus?.accessedBy.toLowerCase() === 'admin' &&
        !this.hasCompleteEstimate(updated) &&
        normalizeStatusId(currentStatus.id) === CR_STATUS_IDS.acceptedCr) {
      this.tab.set('estimate');
      this.notice.set(`Status changed to ${target.label}. Complete the estimate below.`);
    }
  }

  private hasCompleteEstimate(item: ChangeRequest): boolean {
    return Number.isFinite(item.estimatedHours) && item.estimatedHours > 0 &&
      Number.isFinite(item.hourlyRate) && item.hourlyRate > 0 &&
      !!item.startDate && !!item.finishDate && item.finishDate >= item.startDate;
  }
}
