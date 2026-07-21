import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule }                    from '@angular/common';
import { RouterLink, RouterLinkActive }    from '@angular/router';
import { MatIconModule }    from '@angular/material/icon';
import { MatRippleModule }  from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';

interface NavItem {
  label: string;
  icon:  string;
  route: string;
}

@Component({
  selector:   'app-sidebar',
  standalone: true,
  imports:    [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatRippleModule, MatTooltipModule],
  template: `
    <div class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon">
          <mat-icon>corporate_fare</mat-icon>
        </div>
        <div class="brand-text">
          <span class="brand-name">EMS</span>
          <span class="brand-sub">Admin Portal</span>
        </div>
      </div>

      <div class="sidebar-divider"></div>

      <nav class="sidebar-nav">
        <p class="nav-section-label">MAIN MENU</p>

        <a
          *ngFor="let item of navItems"
          [routerLink]="item.route"
          routerLinkActive="active"
          class="nav-item"
          matRipple
          [matTooltip]="item.label"
          matTooltipPosition="right"
          (click)="navItemClicked.emit()">
          <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
          <span class="nav-label">{{ item.label }}</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <p class="version-label">v1.0.0</p>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 255px;
      height: 100%;
      background: linear-gradient(175deg, #1a237e 0%, #283593 60%, #3949ab 100%);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px 20px 20px;
    }
    .brand-icon {
      width: 42px; height: 42px;
      background: rgba(255,255,255,.15);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
    }
    .brand-icon mat-icon { color: #fff; font-size: 22px; }
    .brand-text   { display: flex; flex-direction: column; }
    .brand-name   { font-size: 18px; font-weight: 700; color: #fff; line-height: 1.2; }
    .brand-sub    { font-size: 11px; color: rgba(255,255,255,.6); }

    .sidebar-divider { height: 1px; background: rgba(255,255,255,.12); margin: 0 20px; }

    .sidebar-nav { flex: 1; padding: 16px 12px; overflow-y: auto; }
    .nav-section-label {
      font-size: 10px; font-weight: 700;
      color: rgba(255,255,255,.4);
      letter-spacing: 1.2px;
      padding: 0 8px;
      margin: 0 0 8px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 10px;
      margin-bottom: 4px;
      color: rgba(255,255,255,.75);
      text-decoration: none;
      transition: background .18s, color .18s;
      font-size: 14px;
      font-weight: 500;
    }
    .nav-item:hover {
      background: rgba(255,255,255,.1);
      color: #fff;
    }
    .nav-item.active {
      background: rgba(255,255,255,.18);
      color: #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,.15);
    }
    .nav-item.active .nav-icon { color: #82b1ff; }
    .nav-icon { font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; }
    .nav-label { white-space: nowrap; }

    .sidebar-footer {
      padding: 12px 20px;
      border-top: 1px solid rgba(255,255,255,.1);
    }
    .version-label { margin: 0; font-size: 11px; color: rgba(255,255,255,.3); }
  `],
})
export class SidebarComponent {
  @Output() navItemClicked = new EventEmitter<void>();

  navItems: NavItem[] = [
    { label: 'Dashboard',   icon: 'dashboard',   route: '/dashboard'   },
    { label: 'Employees',   icon: 'people',       route: '/employees'   },
    { label: 'Departments', icon: 'business',     route: '/departments' },
    { label: 'Roles',       icon: 'work_outline', route: '/roles'       },
  ];
}
