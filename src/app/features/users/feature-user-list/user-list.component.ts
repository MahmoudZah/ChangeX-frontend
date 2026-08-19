import { Component, inject, OnInit } from '@angular/core';
import { UsersService } from '@/features/users/data-access/users.service';
import { DataTableComponent } from '@/shared/ui/data-table/data-table.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [DataTableComponent],
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit {
  private usersService = inject(UsersService);
  readonly users = this.usersService.users;

  ngOnInit(): void {
    void this.usersService.loadAll();
  }
}
