import { Component, inject, OnInit } from '@angular/core';
import { ClientsService } from '@/features/clients/data-access/clients.service';
import { DataTableComponent } from '@/shared/ui/data-table/data-table.component';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [DataTableComponent],
  templateUrl: './client-list.component.html',
})
export class ClientListComponent implements OnInit {
  private clientsService = inject(ClientsService);
  readonly clients = this.clientsService.clients;

  ngOnInit(): void {
    void this.clientsService.loadAll();
  }
}
