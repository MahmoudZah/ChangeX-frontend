import { Component, inject } from '@angular/core';
import { AuthService } from '@/core/auth/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  templateUrl: './account.component.html',
})
export class AccountComponent {
  readonly auth = inject(AuthService);
}
