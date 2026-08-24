import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { apiErrorMessage } from '@/core/http/api-contract';
import { ClientsService } from '@/features/clients/data-access/clients.service';
import { UsersService } from '@/features/users/data-access/users.service';
import { FormFieldComponent } from '@/shared/ui/form-field/form-field.component';

@Component({ selector: 'app-user-form', standalone: true, imports: [FormsModule, RouterLink, FormFieldComponent], templateUrl: './user-form.component.html' })
export class UserFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private usersService = inject(UsersService);
  private clientsService = inject(ClientsService);
  readonly clients = this.clientsService.clients;
  readonly id = this.route.snapshot.paramMap.get('id');
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly submitting = signal(false);
  readonly attempted = signal(false);
  readonly error = signal('');
  name = '';
  email = '';
  phoneNumber = '';
  password = '';
  systemRole = false;
  clientId = '';

  async ngOnInit(): Promise<void> {
    await this.clientsService.loadAll();
    this.clientId = this.clients()[0]?.id ?? '';
    if (this.id) {
      try {
        const user = await this.usersService.loadById(this.id);
        if (!user) this.notFound.set(true);
        else { this.name = user.name; this.email = user.email; this.phoneNumber = user.phoneNumber; this.systemRole = user.systemRole; this.clientId = user.clientId; }
      } catch (error) { this.error.set(apiErrorMessage(error, 'The user could not be loaded.')); }
    }
    this.loading.set(false);
  }

  async submit(): Promise<void> {
    if (this.submitting()) return;
    this.attempted.set(true); this.error.set('');
    if (!this.name.trim() || !/^\S+@\S+\.\S+$/.test(this.email.trim()) || !this.phoneNumber.trim() || !this.password || !this.clientId) return;
    this.submitting.set(true);
    try {
      const dto = { name: this.name.trim(), email: this.email.trim(), password: this.password, phoneNumber: this.phoneNumber.trim(), systemRole: this.systemRole, clientID: this.clientId };
      if (this.id) await this.usersService.update(this.id, dto); else await this.usersService.create(dto);
      await this.router.navigate(['/users'], { state: { notice: this.usersService.lastMessage() || 'User saved successfully.' } });
    } catch (error) { this.error.set(apiErrorMessage(error, 'We could not save this user.')); }
    finally { this.submitting.set(false); }
  }

  emailInvalid(): boolean {
    return !/^\S+@\S+\.\S+$/.test(this.email.trim());
  }
}
