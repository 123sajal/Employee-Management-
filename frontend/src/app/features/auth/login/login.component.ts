import { Component, signal } from '@angular/core';
import { CommonModule }       from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router }             from '@angular/router';
import { MatCardModule }      from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatButtonModule }    from '@angular/material/button';
import { MatIconModule }      from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService }        from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector:   'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-page">
      <div class="login-left" aria-hidden="true">
        <div class="brand-hero">
          <div class="hero-icon">
            <mat-icon>corporate_fare</mat-icon>
          </div>
          <h1 class="hero-title">Employee Management System</h1>
          <p class="hero-sub">Streamline your workforce, one dashboard at a time.</p>
          <div class="hero-features">
            <div class="feature-item" *ngFor="let f of features">
              <mat-icon class="feature-icon">{{ f.icon }}</mat-icon>
              <span>{{ f.text }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="login-right">
        <div class="login-form-wrap">
          <div class="form-header">
            <div class="form-logo">
              <mat-icon>lock_person</mat-icon>
            </div>
            <h2>Welcome back</h2>
            <p>Sign in to your admin account</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate>
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Email Address</mat-label>
              <input
                matInput
                type="email"
                formControlName="email"
                placeholder="admin@ems.com"
                autocomplete="email" />
              <mat-icon matPrefix class="field-icon">email</mat-icon>
              <mat-error *ngIf="f['email'].hasError('required')">Email is required.</mat-error>
              <mat-error *ngIf="f['email'].hasError('email')">Enter a valid email.</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Password</mat-label>
              <input
                matInput
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="password"
                placeholder="Enter your password"
                autocomplete="current-password" />
              <mat-icon matPrefix class="field-icon">lock</mat-icon>
              <button
                matSuffix
                mat-icon-button
                type="button"
                (click)="showPassword.set(!showPassword())"
                [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'">
                <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="f['password'].hasError('required')">Password is required.</mat-error>
            </mat-form-field>

            <div class="error-alert" *ngIf="serverError()">
              <mat-icon>error_outline</mat-icon>
              <span>{{ serverError() }}</span>
            </div>

            <button
              mat-flat-button
              color="primary"
              type="submit"
              class="login-btn"
              [disabled]="loading()">
              <mat-spinner *ngIf="loading()" diameter="20" color="accent" />
              <span *ngIf="!loading()">Sign In</span>
            </button>
          </form>

          <p class="demo-hint">
            <mat-icon>info_outline</mat-icon>
            Demo: <strong>admin&#64;ems.com</strong> / <strong>Admin&#64;123</strong>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      display: flex;
      min-height: 100vh;
    }

    .login-left {
      flex: 1;
      background: linear-gradient(145deg, #1a237e 0%, #283593 50%, #3949ab 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }
    .brand-hero { max-width: 420px; }
    .hero-icon {
      width: 72px; height: 72px;
      background: rgba(255,255,255,.15);
      border-radius: 18px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 28px;
    }
    .hero-icon mat-icon { font-size: 40px; width: 40px; height: 40px; color: #fff; }
    .hero-title {
      font-size: 32px; font-weight: 800;
      color: #fff; margin: 0 0 12px;
      line-height: 1.2;
    }
    .hero-sub {
      font-size: 16px; color: rgba(255,255,255,.7);
      margin: 0 0 36px; line-height: 1.6;
    }
    .hero-features { display: flex; flex-direction: column; gap: 16px; }
    .feature-item {
      display: flex; align-items: center; gap: 12px;
      color: rgba(255,255,255,.85); font-size: 14px;
    }
    .feature-icon { color: #82b1ff; font-size: 20px; }

    .login-right {
      width: 460px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 32px;
      background: #fff;
    }
    .login-form-wrap { width: 100%; max-width: 380px; }

    .form-header { text-align: center; margin-bottom: 32px; }
    .form-logo {
      width: 56px; height: 56px;
      background: #e8eaf6;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
    }
    .form-logo mat-icon { color: #3949ab; font-size: 28px; }
    .form-header h2 { margin: 0; font-size: 24px; font-weight: 700; color: #1a237e; }
    .form-header p  { margin: 6px 0 0; color: #888; font-size: 14px; }

    .field-icon { font-size: 18px; color: #9e9e9e; margin-right: 4px; }
    .w-100      { width: 100%; }

    .error-alert {
      display: flex; align-items: center; gap: 8px;
      background: #fce4ec; border: 1px solid #f8bbd0;
      color: #c62828; border-radius: 8px;
      padding: 10px 14px; margin-bottom: 16px;
      font-size: 13px;
    }
    .error-alert mat-icon { font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; }

    .login-btn {
      width: 100%; height: 48px;
      font-size: 15px; font-weight: 600;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      gap: 8px;
      margin-top: 8px;
    }

    .demo-hint {
      display: flex; align-items: center; gap: 6px; justify-content: center;
      font-size: 12px; color: #aaa; margin-top: 20px;
    }
    .demo-hint mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .demo-hint strong   { color: #666; }

    @media (max-width: 768px) {
      .login-left  { display: none; }
      .login-right { width: 100%; padding: 32px 24px; }
    }
  `],
})
export class LoginComponent {
  loginForm:   FormGroup;
  loading      = signal(false);
  showPassword = signal(false);
  serverError  = signal('');

  features = [
    { icon: 'people',    text: 'Manage employees across all departments' },
    { icon: 'business',  text: 'Organise departments and job roles'       },
    { icon: 'bar_chart', text: 'Real-time analytics and statistics'       },
    { icon: 'security',  text: 'Secure JWT-based authentication'          },
  ];

  constructor(
    private fb:           FormBuilder,
    private authService:  AuthService,
    private notification: NotificationService,
    private router:       Router,
  ) {
    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.serverError.set('');

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.notification.success('Welcome back!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message ?? 'Login failed. Please try again.';
        this.serverError.set(msg);
      },
    });
  }
}
