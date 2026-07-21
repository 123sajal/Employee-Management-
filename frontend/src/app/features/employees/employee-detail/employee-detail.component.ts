import { Component, OnInit, signal } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule }  from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule }  from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog }      from '@angular/material/dialog';
import { EmployeeService } from '../../../core/services/employee.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Employee }        from '../../../core/models/employee.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { FormatSalaryPipe }  from '../../../shared/pipes/format-salary.pipe';
import { InitialsPipe }      from '../../../shared/pipes/initials.pipe';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector:   'app-employee-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatDividerModule,
    FormatSalaryPipe, InitialsPipe, LoadingSpinnerComponent,
    ConfirmDialogComponent,
  ],
  template: `
    <div class="detail-page">
      <div class="page-header">
        <div>
          <h1>Employee Details</h1>
          <p class="subtitle">Full profile and employment information.</p>
        </div>
        <div class="header-actions">
          <a mat-stroked-button routerLink="/employees">
            <mat-icon>arrow_back</mat-icon> Back
          </a>
          <a
            *ngIf="employee()"
            mat-flat-button color="primary"
            [routerLink]="['/employees', employee()!.id, 'edit']">
            <mat-icon>edit</mat-icon> Edit
          </a>
          <button
            *ngIf="employee()"
            mat-flat-button color="warn"
            (click)="confirmDelete()">
            <mat-icon>delete</mat-icon> Delete
          </button>
        </div>
      </div>

      <app-loading-spinner *ngIf="loading()" message="Loading employee…" />

      <ng-container *ngIf="!loading() && employee() as e">
        <div class="detail-grid">

          <mat-card class="profile-card">
            <mat-card-content>
              <div class="profile-hero">
                <div class="profile-photo-wrap">
                  <img *ngIf="e.photo" [src]="'http://localhost:5000' + e.photo" class="profile-photo" [alt]="e.first_name" />
                  <div *ngIf="!e.photo" class="profile-avatar">
                    {{ e.first_name | initials:e.last_name }}
                  </div>
                </div>
                <h2 class="profile-name">{{ e.first_name }} {{ e.last_name }}</h2>
                <p class="profile-role">{{ e.role_title || 'No role assigned' }}</p>
                <p class="profile-dept">{{ e.department_name || 'No department' }}</p>
                <span
                  class="badge profile-badge"
                  [class.badge-active]="e.status === 'active'"
                  [class.badge-inactive]="e.status === 'inactive'">
                  {{ e.status | titlecase }}
                </span>
              </div>

              <mat-divider />

              <div class="profile-meta">
                <div class="meta-item">
                  <mat-icon>badge</mat-icon>
                  <div>
                    <p class="meta-label">Employee ID</p>
                    <p class="meta-value">{{ e.employee_id }}</p>
                  </div>
                </div>
                <div class="meta-item">
                  <mat-icon>attach_money</mat-icon>
                  <div>
                    <p class="meta-label">Salary</p>
                    <p class="meta-value salary-val">{{ e.salary | formatSalary }}</p>
                  </div>
                </div>
                <div class="meta-item">
                  <mat-icon>event</mat-icon>
                  <div>
                    <p class="meta-label">Joined On</p>
                    <p class="meta-value">{{ e.date_of_joining | date:'longDate' }}</p>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <div class="details-col">
            <mat-card class="info-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>contact_mail</mat-icon> Contact Information
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="info-row">
                  <mat-icon>email</mat-icon>
                  <div>
                    <p class="info-label">Email</p>
                    <p class="info-value"><a [href]="'mailto:' + e.email">{{ e.email }}</a></p>
                  </div>
                </div>
                <mat-divider />
                <div class="info-row">
                  <mat-icon>phone</mat-icon>
                  <div>
                    <p class="info-label">Phone</p>
                    <p class="info-value">{{ e.phone || '—' }}</p>
                  </div>
                </div>
                <mat-divider />
                <div class="info-row">
                  <mat-icon>location_on</mat-icon>
                  <div>
                    <p class="info-label">Address</p>
                    <p class="info-value">{{ e.address || '—' }}</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="info-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>work_history</mat-icon> Employment Details
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="info-row">
                  <mat-icon>business</mat-icon>
                  <div>
                    <p class="info-label">Department</p>
                    <p class="info-value">{{ e.department_name || '—' }}</p>
                  </div>
                </div>
                <mat-divider />
                <div class="info-row">
                  <mat-icon>work_outline</mat-icon>
                  <div>
                    <p class="info-label">Role</p>
                    <p class="info-value">{{ e.role_title || '—' }}</p>
                  </div>
                </div>
                <mat-divider />
                <div class="info-row">
                  <mat-icon>calendar_today</mat-icon>
                  <div>
                    <p class="info-label">Record Created</p>
                    <p class="info-value">{{ e.created_at | date:'medium' }}</p>
                  </div>
                </div>
                <mat-divider />
                <div class="info-row">
                  <mat-icon>update</mat-icon>
                  <div>
                    <p class="info-label">Last Updated</p>
                    <p class="info-value">{{ e.updated_at | date:'medium' }}</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

        </div>
      </ng-container>

      <div *ngIf="!loading() && !employee()" class="empty-state">
        <mat-icon>person_off</mat-icon>
        <p>Employee not found.</p>
        <a mat-flat-button color="primary" routerLink="/employees">Go back</a>
      </div>
    </div>
  `,
  styles: [`
    .detail-page   { max-width: 1200px; }
    .header-actions { display: flex; gap: 10px; }

    .detail-grid {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 20px;
      align-items: start;
    }

    .profile-hero   { text-align: center; padding: 12px 0 20px; }
    .profile-photo-wrap { margin-bottom: 16px; }
    .profile-photo  { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid #e8eaf6; }
    .profile-avatar {
      width: 100px; height: 100px; border-radius: 50%;
      background: linear-gradient(135deg, #3949ab, #42a5f5);
      color: #fff; font-size: 28px; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto;
    }
    .profile-name   { margin: 0 0 4px; font-size: 20px; font-weight: 700; color: #1a237e; }
    .profile-role   { margin: 0 0 2px; font-size: 14px; color: #555; }
    .profile-dept   { margin: 0 0 12px; font-size: 13px; color: #888; }
    .profile-badge  { font-size: 13px; padding: 4px 14px; }

    .profile-meta   { padding: 16px 0 4px; display: flex; flex-direction: column; gap: 16px; }
    .meta-item      { display: flex; align-items: flex-start; gap: 12px; }
    .meta-item mat-icon { color: #7986cb; margin-top: 2px; }
    .meta-label     { margin: 0; font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: .5px; }
    .meta-value     { margin: 2px 0 0; font-size: 15px; font-weight: 600; color: #333; }
    .salary-val     { color: #2e7d32; }

    .details-col    { display: flex; flex-direction: column; gap: 20px; }
    .info-card mat-card-title { display: flex; align-items: center; gap: 8px; font-size: 15px !important; }
    .info-row       { display: flex; align-items: flex-start; gap: 14px; padding: 14px 0; }
    .info-row mat-icon { color: #7986cb; flex-shrink: 0; }
    .info-label     { margin: 0; font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: .5px; }
    .info-value     { margin: 3px 0 0; font-size: 14px; color: #333; }
    .info-value a   { color: #3949ab; text-decoration: none; }
    .info-value a:hover { text-decoration: underline; }

    @media (max-width: 900px) {
      .detail-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class EmployeeDetailComponent implements OnInit {
  employee = signal<Employee | null>(null);
  loading  = signal(true);

  constructor(
    private route:        ActivatedRoute,
    private router:       Router,
    private empService:   EmployeeService,
    private notification: NotificationService,
    private dialog:       MatDialog,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/employees']); return; }

    this.empService.getById(+id).subscribe({
      next: (res) => { this.employee.set(res.data ?? null); this.loading.set(false); },
      error: ()   => { this.loading.set(false); },
    });
  }

  confirmDelete(): void {
    const e = this.employee()!;
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '420px',
        data: {
          title:       'Delete Employee',
          message:     `Delete ${e.first_name} ${e.last_name}? This cannot be undone.`,
          confirmText: 'Delete',
          danger:      true,
        },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        this.empService.delete(e.id).subscribe({
          next: () => {
            this.notification.success('Employee deleted.');
            this.router.navigate(['/employees']);
          },
          error: (err) => this.notification.error(err?.error?.message ?? 'Delete failed.'),
        });
      });
  }
}
