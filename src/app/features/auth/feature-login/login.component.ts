import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  showPassword = signal(false);
  error = signal('');
  submitting = signal(false);

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  async submit(): Promise<void> {
    this.error.set('');
    if (!this.email.trim()) {
      this.error.set('Email is required.');
      return;
    }
    if (!this.password) {
      this.error.set('Password is required.');
      return;
    }
    this.submitting.set(true);
    const ok = await this.auth.login(this.email, this.password);
    this.submitting.set(false);
    if (ok) {
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      void this.router.navigateByUrl(returnUrl?.startsWith('/') ? returnUrl : '/dashboard');
    } else {
      this.error.set(this.auth.loginError() || 'Invalid email or password.');
    }
  }
}
