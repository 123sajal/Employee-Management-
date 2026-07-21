import { Component, Output, EventEmitter } from '@angular/core';
import { Router }             from '@angular/router';
import { CommonModule }       from '@angular/common';
import { MatToolbarModule }   from '@angular/material/toolbar';
import { MatIconModule }      from '@angular/material/icon';
import { MatButtonModule }    from '@angular/material/button';
import { MatMenuModule }      from '@angular/material/menu';
import { MatDividerModule }   from '@angular/material/divider';
import { MatTooltipModule }   from '@angular/material/tooltip';
import { AuthService }        from '../../core/services/auth.service';

@Component({
  selector:   'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule, MatIconModule, MatButtonModule,
    MatMenuModule, MatDividerModule, MatTooltipModule,
  ],
  template: `
    <mat-toolbar class="app-navbar">

      <button
        mat-icon-button
        (click)="menuToggle.emit()"
        matTooltip="Toggle sidebar"
        aria-label="Toggle navigation sidebar"
        class="menu-btn">
        <mat-icon>menu</mat-icon>
      </button>

      <span class="app-title">Employee Management System</span>

      <span class="spacer"></span>

      <button
        mat-button
        [matMenuTriggerFor]="userMenu"
        class="user-pill"
        aria-label="User menu">
        <span class="avatar-circle">{{ initials }}</span>
        <span class="username-text">{{ user?.username | titlecase }}</span>
        <mat-icon class="chevron">expand_more</mat-icon>
      </button>

      <mat-menu #userMenu="matMenu" xPosition="before" class="user-dropdown">
        <div class="dropdown-header" (click)="$event.stopPropagation()">
          <span class="avatar-circle avatar-lg">{{ initials }}</span>
          <div class="dropdown-user-info">
            <p class="dropdown-username">{{ user?.username | titlecase }}</p>
            <p class="dropdown-email">{{ user?.email }}</p>
            <span class="role-badge">{{ user?.role | titlecase }}</span>
          </div>
        </div>

        <mat-divider />

        <button mat-menu-item (click)="logout()" class="logout-item">
          <mat-icon color="warn">logout</mat-icon>
          <span>Sign Out</span>
        </button>
      </mat-menu>

    </mat-toolbar>
  `,
  styles: [`
    .app-navbar {
      background: #ffffff;
      border-bottom: 1px solid #e8eaf6;
      height: 64px;
      padding: 0 20px;
      box-shadow: 0 1px 6px rgba(0,0,0,.06);
      position: sticky;
      top: 0;
      z-index: 200;
      gap: 8px;
    }

    .menu-btn { color: #5c6bc0; flex-shrink: 0; }

    .app-title {
      font-size: 15px;
      font-weight: 700;
      color: #1a237e;
      letter-spacing: .2px;
      white-space: nowrap;
    }

    .spacer { flex: 1 1 auto; }

    .user-pill {
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
      height: 42px !important;
      padding: 0 12px 0 6px !important;
      border-radius: 24px !important;
      border: 1.5px solid #e8eaf6 !important;
      background: #f8f9ff !important;
      transition: background .18s, border-color .18s !important;
      min-width: unset !important;
    }
    .user-pill:hover {
      background: #e8eaf6 !important;
      border-color: #c5cae9 !important;
    }

    .avatar-circle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3949ab 0%, #1e88e5 100%);
      color: #ffffff;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: .5px;
      flex-shrink: 0;
      line-height: 1;
    }
    .avatar-lg {
      width: 46px;
      height: 46px;
      font-size: 18px;
    }

    .username-text {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      line-height: 1;
    }

    .chevron {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      color: #9e9e9e;
      margin-left: -4px;
    }

    .dropdown-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 18px;
      min-width: 240px;
      cursor: default;
    }

    .dropdown-user-info { display: flex; flex-direction: column; gap: 2px; }
    .dropdown-username  { margin: 0; font-size: 15px; font-weight: 700; color: #1a237e; }
    .dropdown-email     { margin: 0; font-size: 12px; color: #888; }

    .role-badge {
      display: inline-block;
      margin-top: 4px;
      padding: 2px 10px;
      background: #e8eaf6;
      color: #3949ab;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;
      width: fit-content;
    }

    .logout-item { color: #c62828; }
  `],
})
export class NavbarComponent {
  @Output() menuToggle = new EventEmitter<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  get user()    { return this.authService.currentUser(); }

  get initials(): string {
    const u = this.user;
    if (!u) return 'AD';
    const parts = u.username.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return u.username.slice(0, 2).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
