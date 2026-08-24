import { Component, inject } from '@angular/core';
import { InvoicesService } from '@/features/change-requests/data-access/invoices.service';
import { AuthService } from '@/core/auth/auth.service';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  templateUrl: './invoice-list.component.html',
})
export class InvoiceListComponent {
  private invoicesService = inject(InvoicesService);
  private auth = inject(AuthService);
  readonly isAdmin = this.auth.isAdmin;
  readonly unavailableMessage = this.invoicesService.unavailableMessage;
}
