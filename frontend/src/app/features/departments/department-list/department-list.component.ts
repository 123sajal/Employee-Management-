import { Component, OnInit, signal } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule }     from '@angular/material/card';
import { MatTableModule }    from '@angular/material/table';
import { MatButtonModule }   from '@angular/material/button';
import { MatIconModule }     from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }    from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule }  from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule }    from '@angular/material/chips';

import { DepartmentService } from '../../../core/services/department.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Department }  from '../../../core/models/department.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector:   'app-department-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatDialogModule,
    MatTooltipModule, MatProgressBarModule, MatChipsModule,
    LoadingSpinnerComponent,
  ],
  template: `
    <div class="dept-page">
      <div class="page-header">
        <div>
          <h1>Departments</h1>
          <p class="subtitle">{{ departments().length }} departments configured.</p>
        </div>
        <button mat-flat-button color="primary" (click)="openForm()">
          <mat-icon>add</mat-icon> Add Department
        </button>
      </div>

      <div class="dept-layout">
        <mat-card class="table-card">
          <mat-progress-bar *ngIf="loading()" mode="indeterminate" />
          <mat-card-content class="no-pad">
            <div class="data-table-container">
              <table mat-table [dataSource]="departments()">

                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Department Name</th>
                  <td mat-cell *matCellDef="let d">
                    <div class="dept-cell">
                      <div class="dept-icon-wrap">
                        <mat-icon>business</mat-icon>
                      </div>
                      <div>
                        <p class="dept-name">{{ d.name }}</p>
                        <p class="dept-desc">{{ d.description || 'No description' }}</p>
                      </div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="employees">
                  <th mat-header-cell *matHeaderCellDef>Employees</th>
                  <td mat-cell *matCellDef="let d">
                    <span class="emp-count">{{ d.employee_count ?? 0 }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let d">
                    <span class="badge" [class.badge-active]="d.is_active" [class.badge-inactive]="!d.is_active">
                      {{ d.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="created">
                  <th mat-header-cell *matHeaderCellDef>Created</th>
                  <td mat-cell *matCellDef="let d">{{ d.created_at | date:'mediumDate' }}</td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef class="actions-col">Actions</th>
                  <td mat-cell *matCellDef="let d" class="actions-col">
                    <button mat-icon-button color="primary" (click)="openForm(d)" matTooltip="Edit">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="confirmDelete(d)" matTooltip="Delete">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedCols"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedCols"
                    [class.selected-row]="editing()?.id === row.id"></tr>

                <tr class="mat-row" *matNoDataRow>
                  <td [attr.colspan]="displayedCols.length">
                    <div class="empty-state">
                      <mat-icon>business</mat-icon>
                      <p>No departments yet. Add one to get started.</p>
                    </div>
                  </td>
                </tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="form-panel" *ngIf="showForm()">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>{{ editing() ? 'edit' : 'add_circle' }}</mat-icon>
              {{ editing() ? 'Edit Department' : 'New Department' }}
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="deptForm" (ngSubmit)="saveForm()" novalidate>
              <mat-form-field appearance="outline" class="w-100">
                <mat-label>Department Name</mat-label>
                <input matInput formControlName="name" placeholder="Engineering" />
                <mat-error *ngIf="deptForm.get('name')?.hasError('required')">Name is required.</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-100">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="3"
                  placeholder="Brief description of this department…"></textarea>
              </mat-form-field>

              <div class="form-panel-actions">
                <button mat-stroked-button type="button" (click)="closeForm()">Cancel</button>
                <button mat-flat-button color="primary" type="submit" [disabled]="saving()">
                  {{ saving() ? 'Saving…' : (editing() ? 'Save Changes' : 'Create') }}
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dept-page   { max-width: 1200px; }
    .dept-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
    }
    .dept-layout:has(.form-panel) {
      grid-template-columns: 1fr 360px;
    }
    .table-card  { position: relative; overflow: hidden; }
    .no-pad mat-card-content { padding: 0 !important; }
    .actions-col { width: 110px; text-align: right; }

    .dept-cell  { display: flex; align-items: center; gap: 14px; padding: 6px 0; }
    .dept-icon-wrap {
      width: 40px; height: 40px; border-radius: 10px;
      background: #e8eaf6; display: flex;
      align-items: center; justify-content: center; flex-shrink: 0;
    }
    .dept-icon-wrap mat-icon { color: #3949ab; }
    .dept-name  { margin: 0; font-weight: 600; font-size: 14px; color: #333; }
    .dept-desc  { margin: 2px 0 0; font-size: 12px; color: #aaa; }

    .emp-count  {
      background: #e8eaf6; color: #3949ab;
      padding: 2px 10px; border-radius: 10px;
      font-size: 13px; font-weight: 700;
    }
    .selected-row { background: #f5f7ff !important; }

    mat-card-title      { display: flex; align-items: center; gap: 8px; font-size: 15px !important; }
    .w-100              { width: 100%; }
    .form-panel-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }

    @media (max-width: 900px) {
      .dept-layout:has(.form-panel) { grid-template-columns: 1fr; }
    }
  `],
})
export class DepartmentListComponent implements OnInit {
  departments = signal<Department[]>([]);
  loading     = signal(false);
  saving      = signal(false);
  showForm    = signal(false);
  editing     = signal<Department | null>(null);

  displayedCols = ['name', 'employees', 'status', 'created', 'actions'];

  deptForm!: FormGroup;

  constructor(
    private deptService:  DepartmentService,
    private notification: NotificationService,
    private dialog:       MatDialog,
    private fb:           FormBuilder,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadDepartments();
  }

  buildForm(): void {
    this.deptForm = this.fb.group({
      name:        ['', Validators.required],
      description: [''],
    });
  }

  loadDepartments(): void {
    this.loading.set(true);
    this.deptService.getAll().subscribe({
      next: (r) => { this.departments.set(r.data ?? []); this.loading.set(false); },
      error: ()  => this.loading.set(false),
    });
  }

  openForm(dept?: Department): void {
    this.editing.set(dept ?? null);
    this.deptForm.reset({
      name:        dept?.name        ?? '',
      description: dept?.description ?? '',
    });
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editing.set(null);
    this.deptForm.reset();
  }

  saveForm(): void {
    if (this.deptForm.invalid) { this.deptForm.markAllAsTouched(); return; }
    this.saving.set(true);

    const data    = this.deptForm.value;
    const editing = this.editing();

    const request$ = editing
      ? this.deptService.update(editing.id, data)
      : this.deptService.create(data);

    request$.subscribe({
      next: () => {
        this.notification.success(editing ? 'Department updated.' : 'Department created.');
        this.saving.set(false);
        this.closeForm();
        this.loadDepartments();
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err?.error?.message ?? 'Operation failed.');
      },
    });
  }

  confirmDelete(dept: Department): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '420px',
        data: {
          title:       'Delete Department',
          message:     `Delete "${dept.name}"? Employees in this department will be unassigned.`,
          confirmText: 'Delete',
          danger:      true,
        },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        this.deptService.delete(dept.id).subscribe({
          next: () => {
            this.notification.success('Department deleted.');
            this.loadDepartments();
          },
          error: (err) => this.notification.error(err?.error?.message ?? 'Delete failed.'),
        });
      });
  }
}
