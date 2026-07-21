import { Component, OnInit, signal } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterLink }     from '@angular/router';
import { MatCardModule }  from '@angular/material/card';
import { MatIconModule }  from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule }  from '@angular/material/table';
import { MatChipsModule }  from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { EmployeeService } from '../../core/services/employee.service';
import { AuthService }     from '../../core/services/auth.service';
import { EmployeeStats }   from '../../core/models/employee.model';
import { FormatSalaryPipe } from '../../shared/pipes/format-salary.pipe';
import { InitialsPipe }     from '../../shared/pipes/initials.pipe';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

interface StatCard {
  label: string;
  value: number | string;
  icon:  string;
  color: string;
  bg:    string;
  route: string;
}

@Component({
  selector:   'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatIconModule, MatButtonModule,
    MatTableModule, MatChipsModule, MatProgressBarModule,
    FormatSalaryPipe, InitialsPipe, LoadingSpinnerComponent,
  ],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <div>
          <h1>Dashboard</h1>
          <p class="subtitle">Welcome back, {{ userName }}. Here's what's happening.</p>
        </div>
      </div>

      <app-loading-spinner *ngIf="loading()" message="Loading statistics..." />

      <ng-container *ngIf="!loading() && stats()">

        <div class="stat-grid">
          <mat-card class="stat-card" *ngFor="let card of statCards()" [routerLink]="card.route">
            <mat-card-content>
              <div class="stat-inner">
                <div class="stat-text">
                  <p class="stat-label">{{ card.label }}</p>
                  <h2 class="stat-value">{{ card.value }}</h2>
                </div>
                <div class="stat-icon-wrap" [style.background]="card.bg">
                  <mat-icon [style.color]="card.color">{{ card.icon }}</mat-icon>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="charts-row">

          <mat-card class="dept-chart-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>pie_chart</mat-icon> Employees by Department
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div
                *ngFor="let dept of stats()!.byDepartment"
                class="dept-bar-row">
                <div class="dept-bar-label">
                  <span class="dept-name">{{ dept.department }}</span>
                  <span class="dept-count">{{ dept.count }}</span>
                </div>
                <mat-progress-bar
                  mode="determinate"
                  [value]="getPercent(dept.count)"
                  color="primary" />
              </div>
              <div *ngIf="!stats()!.byDepartment.length" class="empty-small">
                No department data available.
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="status-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>donut_large</mat-icon> Employee Status
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="status-ring">
                <svg viewBox="0 0 120 120" width="160" height="160">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e8eaf6" stroke-width="14"/>
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke="#3949ab" stroke-width="14"
                    [attr.stroke-dasharray]="activeArc + ' ' + (314 - activeArc)"
                    stroke-dashoffset="78.5"
                    stroke-linecap="round"/>
                </svg>
                <div class="ring-label">
                  <span class="ring-pct">{{ activePercent }}%</span>
                  <span class="ring-sub">Active</span>
                </div>
              </div>
              <div class="status-legend">
                <div class="legend-item">
                  <span class="legend-dot active-dot"></span>
                  <span>Active — {{ stats()!.totals.active_employees }}</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot inactive-dot"></span>
                  <span>Inactive — {{ stats()!.totals.inactive_employees }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

        </div>

        <mat-card class="recent-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>schedule</mat-icon> Recently Added Employees
            </mat-card-title>
            <div class="card-header-action">
              <a mat-button color="primary" routerLink="/employees">View All</a>
            </div>
          </mat-card-header>
          <mat-card-content class="no-pad">
            <div class="data-table-container">
              <table mat-table [dataSource]="stats()!.recentEmployees">

                <ng-container matColumnDef="employee">
                  <th mat-header-cell *matHeaderCellDef>Employee</th>
                  <td mat-cell *matCellDef="let e">
                    <div class="emp-cell">
                      <div class="emp-avatar">
                        {{ e.first_name | initials:e.last_name }}
                      </div>
                      <div>
                        <p class="emp-name">{{ e.first_name }} {{ e.last_name }}</p>
                        <p class="emp-id">{{ e.employee_id }}</p>
                      </div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="department">
                  <th mat-header-cell *matHeaderCellDef>Department</th>
                  <td mat-cell *matCellDef="let e">{{ e.department_name || '—' }}</td>
                </ng-container>

                <ng-container matColumnDef="role">
                  <th mat-header-cell *matHeaderCellDef>Role</th>
                  <td mat-cell *matCellDef="let e">{{ e.role_title || '—' }}</td>
                </ng-container>

                <ng-container matColumnDef="salary">
                  <th mat-header-cell *matHeaderCellDef>Salary</th>
                  <td mat-cell *matCellDef="let e">{{ e.salary | formatSalary }}</td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let e">
                    <span class="badge" [class.badge-active]="e.status === 'active'" [class.badge-inactive]="e.status === 'inactive'">
                      {{ e.status | titlecase }}
                    </span>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="recentCols"></tr>
                <tr mat-row *matRowDef="let row; columns: recentCols"></tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>

      </ng-container>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1400px; }

    .stat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    .stat-card { cursor: pointer; transition: transform .18s, box-shadow .18s; }
    .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.1) !important; }
    .stat-inner   { display: flex; align-items: center; justify-content: space-between; }
    .stat-label   { margin: 0 0 4px; font-size: 12px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: .5px; }
    .stat-value   { margin: 0; font-size: 32px; font-weight: 800; color: #1a237e; }
    .stat-icon-wrap {
      width: 54px; height: 54px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
    }
    .stat-icon-wrap mat-icon { font-size: 26px; width: 26px; height: 26px; }

    .charts-row {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 20px;
      margin-bottom: 24px;
    }
    mat-card-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 16px !important; font-weight: 700 !important;
    }
    .card-header-action { margin-left: auto; }

    .dept-bar-row   { margin-bottom: 14px; }
    .dept-bar-label { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px; }
    .dept-name      { color: #444; font-weight: 500; }
    .dept-count     { color: #888; }
    .empty-small    { color: #bbb; font-size: 13px; text-align: center; padding: 20px; }

    .status-ring   { position: relative; width: 160px; height: 160px; margin: 0 auto 20px; }
    .ring-label    { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .ring-pct      { font-size: 28px; font-weight: 800; color: #1a237e; }
    .ring-sub      { font-size: 12px; color: #888; }
    .status-legend { display: flex; flex-direction: column; gap: 10px; padding: 0 12px; }
    .legend-item   { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #555; }
    .legend-dot    { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
    .active-dot    { background: #3949ab; }
    .inactive-dot  { background: #e8eaf6; border: 1px solid #c5cae9; }

    .recent-card .mat-mdc-card-header { padding-bottom: 0; }
    .no-pad .mat-mdc-card-content { padding: 0 !important; }
    .emp-cell    { display: flex; align-items: center; gap: 12px; padding: 4px 0; }
    .emp-avatar  {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, #3949ab, #1e88e5);
      color: #fff; font-size: 12px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .emp-name    { margin: 0; font-weight: 600; font-size: 14px; color: #333; }
    .emp-id      { margin: 2px 0 0; font-size: 11px; color: #aaa; }

    @media (max-width: 960px) {
      .charts-row { grid-template-columns: 1fr; }
    }
  `],
})
export class DashboardComponent implements OnInit {
  stats   = signal<EmployeeStats | null>(null);
  loading = signal(true);

  recentCols = ['employee', 'department', 'role', 'salary', 'status'];

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService,
  ) {}

  get userName(): string {
    return this.authService.currentUser()?.username ?? 'Admin';
  }

  ngOnInit(): void {
    this.employeeService.getStats().subscribe({
      next:  (res) => { this.stats.set(res.data ?? null); this.loading.set(false); },
      error: ()    => this.loading.set(false),
    });
  }

  statCards(): StatCard[] {
    const t = this.stats()!.totals;
    return [
      { label: 'Total Employees',   value: t.total_employees,   icon: 'people',       color: '#3949ab', bg: '#e8eaf6', route: '/employees'   },
      { label: 'Active Employees',  value: t.active_employees,  icon: 'person_check', color: '#2e7d32', bg: '#e8f5e9', route: '/employees'   },
      { label: 'Total Departments', value: t.total_departments, icon: 'business',     color: '#f57c00', bg: '#fff3e0', route: '/departments' },
      { label: 'Total Roles',       value: t.total_roles,       icon: 'work',         color: '#7b1fa2', bg: '#f3e5f5', route: '/roles'       },
      { label: 'Avg. Salary',       value: `$${Number(t.avg_salary ?? 0).toLocaleString()}`, icon: 'attach_money', color: '#00838f', bg: '#e0f7fa', route: '/employees' },
    ];
  }

  getPercent(count: number): number {
    const total = this.stats()!.totals.total_employees || 1;
    return Math.round((count / total) * 100);
  }

  get activePercent(): number {
    const t = this.stats()!.totals;
    if (!t.total_employees) return 0;
    return Math.round((t.active_employees / t.total_employees) * 100);
  }

  get activeArc(): number {
    return Math.round((this.activePercent / 100) * 314);
  }
}
