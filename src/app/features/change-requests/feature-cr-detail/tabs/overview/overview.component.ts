import { Component, Input } from '@angular/core';
import { ChangeRequest } from '@/features/change-requests/data-access/cr.model';
import { formatCurrency, formatDate } from '@/shared/util/formatters';

@Component({
  selector: 'app-cr-overview-tab',
  standalone: true,
  templateUrl: './overview.component.html',
})
export class CrOverviewTabComponent {
  @Input({ required: true }) cr!: ChangeRequest;
  readonly formatCurrency = formatCurrency;
  readonly formatDate = formatDate;
}
