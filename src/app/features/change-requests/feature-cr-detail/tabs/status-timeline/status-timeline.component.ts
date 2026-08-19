import { Component, Input, OnInit, inject } from '@angular/core';
import { StatusesService } from '@/features/change-requests/data-access/statuses.service';
import { StatusHistoryEntry } from '@/features/change-requests/data-access/status.model';
import { StepItem, StepperComponent } from '@/shared/ui/stepper/stepper.component';
import { formatDate } from '@/shared/util/formatters';

@Component({
  selector: 'app-cr-status-timeline-tab',
  standalone: true,
  imports: [StepperComponent],
  templateUrl: './status-timeline.component.html',
})
export class CrStatusTimelineTabComponent implements OnInit {
  @Input({ required: true }) crId!: string;
  private statuses = inject(StatusesService);

  history: StatusHistoryEntry[] = [];
  steps: StepItem[] = [];

  ngOnInit(): void {
    this.history = this.statuses.getByCrId(this.crId);
    this.steps = this.history.map((h, i) => ({
      label: `${h.status} — ${formatDate(h.changedAt)} by ${h.changedBy}`,
      done: i < this.history.length - 1,
      current: i === this.history.length - 1,
    }));
  }
}
