import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@/core/auth/auth.service';
import { FormFieldComponent } from '@/shared/ui/form-field/form-field.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, FormFieldComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = 'sarah.jenkins@acme.com';
  password = '';
  showPassword = signal(false);
  error = signal('');

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  submit(): void {
    this.error.set('');
    if (!this.email.trim()) {
      this.error.set('Email is required.');
      return;
    }
    const ok = this.auth.login(this.email, this.password);
    if (ok) {
      void this.router.navigate(['/dashboard']);
    } else {
      this.error.set('Invalid credentials.');
    }
  }
}
