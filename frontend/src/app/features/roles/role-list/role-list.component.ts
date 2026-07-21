import { Component, OnInit, signal } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule }     from '@angular/material/card';
import { MatTableModule }    from '@angular/material/table';
import { MatButtonModule }   from '@angular/material/button';
import { MatIconModule }     from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }    from '@angular/material/input';
import { MatSelectModule }   from '@angular/material/select';
import { MatTooltipModule }  from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog }         from '@angular/material/dialog';

import { RoleService }       from '../../../core/services/role.service';
import { DepartmentService } from '../../../core/services/department.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Role }       from '../../../core/models/role.model';
import { Department } from '../../../core/models/department.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector:   'app-role-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatTooltipModule, MatProgressBarModule,
    LoadingSpinnerComponent,
  ],
  template: `
    <div class="roles-page">
      <div class="page-header">
        <div>
          <h1>Roles</h1>
          <p class="subtitle">{{ roles().length }} roles defined.</p>
        </div>
        <button mat-flat-button color="primary" (click)="openForm()">
          <mat-icon>add</mat-icon> Add Role
        </button>
      </div>

      <div class="roles-layout" [class.with-form]="showForm()">
        <mat-card class="table-card">
          <mat-progress-bar *ngIf="loading()" mode="indeterminate" />
          <mat-card-content class="no-pad">
            <div class="data-table-container">
              <table mat-table [dataSource]="roles()">

                <ng-container matColumnDef="title">
                  <th mat-header-cell *matHeaderCellDef>Role Title</th>
                  <td mat-cell *matCellDef="let r">
                    <div class="role-cell">
                      <div class="role-icon-wrap">
                        <mat-icon>work_outline</mat-icon>
                      </div>
                      <div>
                        <p class="role-title">{{ r.title }}</p>
                        <p class="role-desc">{{ r.description || 'No description' }}</p>
                      </div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="department">
                  <th mat-header-cell *matHeaderCellDef>Department</th>
                  <td mat-cell *matCellDef="let r">
                    <span *ngIf="r.department_name" class="dept-tag">{{ r.department_name }}</span>
                    <span *ngIf="!r.department_name" class="no-dept">—</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="employees">
                  <th mat-header-cell *matHeaderCellDef>Employees</th>
                  <td mat-cell *matCellDef="let r">
                    <span class="emp-count">{{ r.employee_count ?? 0 }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let r">
                    <span class="badge" [class.badge-active]="r.is_active" [class.badge-inactive]="!r.is_active">
                      {{ r.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="created">
                  <th mat-header-cell *matHeaderCellDef>Created</th>
                  <td mat-cell *matCellDef="let r">{{ r.created_at | date:'mediumDate' }}</td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef class="actions-col">Actions</th>
                  <td mat-cell *matCellDef="let r" class="actions-col">
                    <button mat-icon-button color="primary" (click)="openForm(r)" matTooltip="Edit">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="confirmDelete(r)" matTooltip="Delete">
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
                      <mat-icon>work</mat-icon>
                      <p>No roles yet. Add one to get started.</p>
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
              {{ editing() ? 'Edit Role' : 'New Role' }}
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="roleForm" (ngSubmit)="saveForm()" novalidate>
              <mat-form-field appearance="outline" class="w-100">
                <mat-label>Role Title</mat-label>
                <input matInput formControlName="title" placeholder="Software Engineer" />
                <mat-error *ngIf="roleForm.get('title')?.hasError('required')">Title is required.</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-100">
                <mat-label>Department (optional)</mat-label>
                <mat-select formControlName="department_id">
                  <mat-option [value]="null">— None —</mat-option>
                  <mat-option *ngFor="let d of departments()" [value]="d.id">{{ d.name }}</mat-option>
                </mat-select>
                <mat-icon matPrefix>business</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-100">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="3"
                  placeholder="Brief description of this role…"></textarea>
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
    .roles-page  { max-width: 1200px; }
    .roles-layout { display: grid; grid-template-columns: 1fr; gap: 20px; }
    .roles-layout.with-form { grid-template-columns: 1fr 360px; }
    .table-card  { position: relative; overflow: hidden; }
    .no-pad mat-card-content { padding: 0 !important; }
    .actions-col { width: 110px; text-align: right; }

    .role-cell   { display: flex; align-items: center; gap: 14px; padding: 6px 0; }
    .role-icon-wrap {
      width: 40px; height: 40px; border-radius: 10px;
      background: #f3e5f5; display: flex;
      align-items: center; justify-content: center; flex-shrink: 0;
    }
    .role-icon-wrap mat-icon { color: #7b1fa2; }
    .role-title  { margin: 0; font-weight: 600; font-size: 14px; color: #333; }
    .role-desc   { margin: 2px 0 0; font-size: 12px; color: #aaa; }

    .dept-tag    {
      background: #e8eaf6; color: #3949ab;
      padding: 2px 10px; border-radius: 10px;
      font-size: 12px; font-weight: 600;
    }
    .no-dept     { color: #ccc; }
    .emp-count   {
      background: #f3e5f5; color: #7b1fa2;
      padding: 2px 10px; border-radius: 10px;
      font-size: 13px; font-weight: 700;
    }
    .selected-row { background: #fdf5ff !important; }

    mat-card-title      { display: flex; align-items: center; gap: 8px; font-size: 15px !important; }
    .w-100              { width: 100%; }
    .form-panel-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }

    @media (max-width: 900px) {
      .roles-layout.with-form { grid-template-columns: 1fr; }
    }
  `],
})
export class RoleListComponent implements OnInit {
  roles       = signal<Role[]>([]);
  departments = signal<Department[]>([]);
  loading     = signal(false);
  saving      = signal(false);
  showForm    = signal(false);
  editing     = signal<Role | null>(null);

  displayedCols = ['title', 'department', 'employees', 'status', 'created', 'actions'];

  roleForm!: FormGroup;

  constructor(
    private roleService:  RoleService,
    private deptService:  DepartmentService,
    private notification: NotificationService,
    private dialog:       MatDialog,
    private fb:           FormBuilder,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadRoles();
    this.deptService.getAll().subscribe((r) => this.departments.set(r.data ?? []));
  }

  buildForm(): void {
    this.roleForm = this.fb.group({
      title:         ['', Validators.required],
      description:   [''],
      department_id: [null],
    });
  }

  loadRoles(): void {
    this.loading.set(true);
    this.roleService.getAll().subscribe({
      next: (r) => { this.roles.set(r.data ?? []); this.loading.set(false); },
      error: ()  => this.loading.set(false),
    });
  }

  openForm(role?: Role): void {
    this.editing.set(role ?? null);
    this.roleForm.reset({
      title:         role?.title         ?? '',
      description:   role?.description   ?? '',
      department_id: role?.department_id ?? null,
    });
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editing.set(null);
    this.roleForm.reset();
  }

  saveForm(): void {
    if (this.roleForm.invalid) { this.roleForm.markAllAsTouched(); return; }
    this.saving.set(true);

    const data    = this.roleForm.value;
    const editing = this.editing();

    const request$ = editing
      ? this.roleService.update(editing.id, data)
      : this.roleService.create(data);

    request$.subscribe({
      next: () => {
        this.notification.success(editing ? 'Role updated.' : 'Role created.');
        this.saving.set(false);
        this.closeForm();
        this.loadRoles();
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err?.error?.message ?? 'Operation failed.');
      },
    });
  }

  confirmDelete(role: Role): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '420px',
        data: {
          title:       'Delete Role',
          message:     `Delete "${role.title}"? Employees with this role will be unassigned.`,
          confirmText: 'Delete',
          danger:      true,
        },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        this.roleService.delete(role.id).subscribe({
          next: () => {
            this.notification.success('Role deleted.');
            this.loadRoles();
          },
          error: (err) => this.notification.error(err?.error?.message ?? 'Delete failed.'),
        });
      });
  }
}
