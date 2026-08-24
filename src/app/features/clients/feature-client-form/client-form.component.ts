import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { apiErrorMessage } from '@/core/http/api-contract';
import { ClientsService } from '@/features/clients/data-access/clients.service';

@Component({ selector: 'app-client-form', standalone: true, imports: [FormsModule, RouterLink], templateUrl: './client-form.component.html' })
export class ClientFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  readonly clients = inject(ClientsService);
  private router = inject(Router);
  clientId = '';
  name = '';
  email = '';
  contactInfo = '';
  description = '';
  address = '';
  defaultContactId: string | null = null;
  readonly loading = signal(false);
  readonly notFound = signal(false);
  readonly submitting = signal(false);
  readonly attempted = signal(false);
  readonly error = signal('');
  readonly updatesAvailable = this.clients.updatesAvailable;
  readonly updateUnavailableMessage = this.clients.updateUnavailableMessage;

  async ngOnInit(): Promise<void> {
    this.clientId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.clientId) return;
    this.loading.set(true);
    try {
      const client = await this.clients.loadById(this.clientId);
      if (!client) { this.notFound.set(true); return; }
      this.name = client.name;
      this.email = client.email;
      this.contactInfo = client.contactInfo;
      this.description = client.description;
      this.address = client.address;
      this.defaultContactId = client.defaultContactId;
    } catch {
      this.error.set(this.clients.error());
    } finally {
      this.loading.set(false);
    }
  }

  async submit(): Promise<void> {
    if (this.submitting()) return;
    if (this.clientId && !this.updatesAvailable) {
      this.error.set(this.updateUnavailableMessage);
      return;
    }
    this.attempted.set(true);
    this.error.set('');
    if (!this.name.trim() || !this.email.trim() || !this.contactInfo.trim()) return;
    if (!/^\S+@\S+\.\S+$/.test(this.email.trim())) return;
    this.submitting.set(true);
    try {
      const dto = { name: this.name.trim(), email: this.email.trim(), contactInfo: this.contactInfo.trim(), description: this.description.trim() || null, address: this.address.trim() || null, defaultContactID: this.defaultContactId };
      if (this.clientId) await this.clients.update(this.clientId, dto);
      else await this.clients.create(dto);
      await this.router.navigate(['/clients'], { state: { notice: this.clients.lastMessage() || 'Client saved successfully.' } });
    } catch (error) {
      this.error.set(apiErrorMessage(error, 'Unable to save this client. Please verify the entered details and try again.'));
    } finally {
      this.submitting.set(false);
    }
  }

  emailInvalid(): boolean {
    return !/^\S+@\S+\.\S+$/.test(this.email.trim());
  }
}
