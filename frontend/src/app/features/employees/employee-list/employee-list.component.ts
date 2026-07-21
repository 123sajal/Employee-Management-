import {
  Component, OnInit, OnDestroy, signal,
} from '@angular/core';
import { CommonModule }      from '@angular/common';
import { RouterLink }        from '@angular/router';
import { FormsModule }       from '@angular/forms';
import { Subject }           from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { MatCardModule }     from '@angular/material/card';
import { MatTableModule }    from '@angular/material/table';
import { MatButtonModule }   from '@angular/material/button';
import { MatIconModule }     from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }    from '@angular/material/input';
import { MatSelectModule }   from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatMenuModule }     from '@angular/material/menu';
import { MatTooltipModule }  from '@angular/material/tooltip';
import { MatDialog }         from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { EmployeeService }  from '../../../core/services/employee.service';
import { DepartmentService } from '../../../core/services/department.service';
import { RoleService }       from '../../../core/services/role.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Employee, EmployeeFilter, Pagination } from '../../../core/models/employee.model';
import { Department } from '../../../core/models/department.model';
import { Role }       from '../../../core/models/role.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { FormatSalaryPipe }  from '../../../shared/pipes/format-salary.pipe';
import { InitialsPipe }      from '../../../shared/pipes/initials.pipe';
import { exportEmployeesToCSV } from '../../../shared/utils/csv-export.util';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector:   'app-employee-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatPaginatorModule, MatSortModule, MatMenuModule,
    MatTooltipModule, MatProgressBarModule,
    FormatSalaryPipe, InitialsPipe, LoadingSpinnerComponent,
  ],
  template: `
    <div class="employee-list">
      <div class="page-header">
        <div>
          <h1>Employees</h1>
          <p class="subtitle">{{ pagination()?.total ?? 0 }} total records</p>
        </div>
        <div class="header-actions">
          <button mat-stroked-button (click)="exportCSV()" [disabled]="loading()">
            <mat-icon>download</mat-icon> Export CSV
          </button>
          <a mat-flat-button color="primary" routerLink="/employees/new">
            <mat-icon>add</mat-icon> Add Employee
          </a>
        </div>
      </div>

      <mat-card class="filter-card">
        <mat-card-content>
          <div class="filter-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search employees…</mat-label>
              <input matInput [(ngModel)]="filter.search" (ngModelChange)="onSearchChange($event)" placeholder="Name, email, ID…" />
              <mat-icon matPrefix>search</mat-icon>
              <button *ngIf="filter.search" matSuffix mat-icon-button (click)="clearSearch()">
                <mat-icon>close</mat-icon>
              </button>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-select">
              <mat-label>Department</mat-label>
              <mat-select [(ngModel)]="filter.department" (ngModelChange)="applyFilter()">
                <mat-option value="">All Departments</mat-option>
                <mat-option *ngFor="let d of departments()" [value]="d.id">{{ d.name }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-select">
              <mat-label>Role</mat-label>
              <mat-select [(ngModel)]="filter.role" (ngModelChange)="applyFilter()">
                <mat-option value="">All Roles</mat-option>
                <mat-option *ngFor="let r of roles()" [value]="r.id">{{ r.title }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-select">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="filter.status" (ngModelChange)="applyFilter()">
                <mat-option value="">All Status</mat-option>
                <mat-option value="active">Active</mat-option>
                <mat-option value="inactive">Inactive</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-stroked-button (click)="resetFilters()" class="reset-btn">
              <mat-icon>filter_alt_off</mat-icon> Reset
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="table-card">
        <mat-progress-bar *ngIf="loading()" mode="indeterminate" />

        <mat-card-content class="no-pad">
          <div class="data-table-container">
            <table mat-table [dataSource]="employees()" matSort (matSortChange)="onSort($event)">

              <ng-container matColumnDef="employee">
                <th mat-header-cell *matHeaderCellDef mat-sort-header="first_name">Employee</th>
                <td mat-cell *matCellDef="let e">
                  <div class="emp-cell">
                    <div class="emp-avatar" *ngIf="!e.photo">
                      {{ e.first_name | initials:e.last_name }}
                    </div>
                    <img *ngIf="e.photo" [src]="apiBase + e.photo" class="emp-photo" [alt]="e.first_name" />
                    <div class="emp-info">
                      <p class="emp-name">{{ e.first_name }} {{ e.last_name }}</p>
                      <p class="emp-sub">{{ e.employee_id }} · {{ e.email }}</p>
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
                <th mat-header-cell *matHeaderCellDef mat-sort-header="salary">Salary</th>
                <td mat-cell *matCellDef="let e">{{ e.salary | formatSalary }}</td>
              </ng-container>

              <ng-container matColumnDef="joined">
                <th mat-header-cell *matHeaderCellDef mat-sort-header="date_of_joining">Joined</th>
                <td mat-cell *matCellDef="let e">
                  {{ e.date_of_joining | date:'mediumDate' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let e">
                  <span class="badge"
                    [class.badge-active]="e.status === 'active'"
                    [class.badge-inactive]="e.status === 'inactive'">
                    {{ e.status | titlecase }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="actions-col">Actions</th>
                <td mat-cell *matCellDef="let e" class="actions-col">
                  <a mat-icon-button [routerLink]="['/employees', e.id]" matTooltip="View details">
                    <mat-icon>visibility</mat-icon>
                  </a>
                  <a mat-icon-button color="primary" [routerLink]="['/employees', e.id, 'edit']" matTooltip="Edit">
                    <mat-icon>edit</mat-icon>
                  </a>
                  <button mat-icon-button color="warn" (click)="confirmDelete(e)" matTooltip="Delete">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedCols"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedCols"></tr>

              <tr class="mat-row" *matNoDataRow>
                <td [attr.colspan]="displayedCols.length">
                  <div class="empty-state">
                    <mat-icon>search_off</mat-icon>
                    <p>No employees found. Try adjusting your filters.</p>
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <mat-paginator
            *ngIf="pagination()"
            [length]="pagination()!.total"
            [pageSize]="filter.limit"
            [pageSizeOptions]="[5, 10, 25, 50]"
            (page)="onPage($event)"
            showFirstLastButtons />
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .employee-list { max-width: 1400px; }
    .header-actions { display: flex; gap: 12px; }
    .filter-card    { margin-bottom: 20px; }
    .filter-row     { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
    .search-field   { flex: 1; min-width: 200px; }
    .filter-select  { width: 170px; }
    .reset-btn      { height: 56px; }
    .table-card     { position: relative; overflow: hidden; }
    .no-pad mat-card-content { padding: 0 !important; }

    .emp-cell  { display: flex; align-items: center; gap: 12px; padding: 6px 0; }
    .emp-avatar {
      width: 38px; height: 38px; border-radius: 50%;
      background: linear-gradient(135deg, #3949ab, #42a5f5);
      color: #fff; font-size: 13px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .emp-photo  { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
    .emp-name   { margin: 0; font-weight: 600; font-size: 14px; color: #333; }
    .emp-sub    { margin: 2px 0 0; font-size: 11px; color: #aaa; }
    .emp-info   { min-width: 0; }

    .actions-col { width: 130px; text-align: right; }
  `],
})
export class EmployeeListComponent implements OnInit, OnDestroy {
  employees   = signal<Employee[]>([]);
  departments = signal<Department[]>([]);
  roles       = signal<Role[]>([]);
  pagination  = signal<Pagination | null>(null);
  loading     = signal(false);

  displayedCols = ['employee', 'department', 'role', 'salary', 'joined', 'status', 'actions'];

  filter: EmployeeFilter = {
    search: '', department: '', role: '', status: '',
    sortBy: 'created_at', sortOrder: 'DESC',
    page: 1, limit: 10,
  };

  apiBase = 'http://localhost:5000';

  private destroy$ = new Subject<void>();
  private search$  = new Subject<string>();

  constructor(
    private employeeService:  EmployeeService,
    private departmentService: DepartmentService,
    private roleService:       RoleService,
    private notification:      NotificationService,
    private dialog:            MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadDropdowns();
    this.loadEmployees();

    this.search$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => { this.filter.page = 1; this.loadEmployees(); });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEmployees(): void {
    this.loading.set(true);
    this.employeeService.getAll(this.filter).subscribe({
      next: (res) => {
        this.employees.set(res.data);
        this.pagination.set(res.pagination);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadDropdowns(): void {
    this.departmentService.getAll().subscribe((r) => this.departments.set(r.data ?? []));
    this.roleService.getAll().subscribe((r) => this.roles.set(r.data ?? []));
  }

  onSearchChange(val: string): void { this.search$.next(val); }
  clearSearch():  void { this.filter.search = ''; this.filter.page = 1; this.loadEmployees(); }
  applyFilter():  void { this.filter.page = 1; this.loadEmployees(); }

  resetFilters(): void {
    this.filter = { search: '', department: '', role: '', status: '', sortBy: 'created_at', sortOrder: 'DESC', page: 1, limit: 10 };
    this.loadEmployees();
  }

  onSort(sort: Sort): void {
    this.filter.sortBy    = sort.active;
    this.filter.sortOrder = sort.direction.toUpperCase() as 'ASC' | 'DESC' || 'DESC';
    this.filter.page      = 1;
    this.loadEmployees();
  }

  onPage(e: PageEvent): void {
    this.filter.page  = e.pageIndex + 1;
    this.filter.limit = e.pageSize;
    this.loadEmployees();
  }

  confirmDelete(emp: Employee): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '420px',
        data: {
          title:       'Delete Employee',
          message:     `Are you sure you want to delete ${emp.first_name} ${emp.last_name}? This action cannot be undone.`,
          confirmText: 'Delete',
          danger:      true,
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) this.deleteEmployee(emp.id);
      });
  }

  deleteEmployee(id: number): void {
    this.employeeService.delete(id).subscribe({
      next: () => {
        this.notification.success('Employee deleted successfully.');
        this.loadEmployees();
      },
      error: (err) => this.notification.error(err?.error?.message ?? 'Failed to delete employee.'),
    });
  }

  exportCSV(): void {
    this.employeeService.getAll({ ...this.filter, page: 1, limit: 9999 }).subscribe({
      next: (res) => {
        exportEmployeesToCSV(res.data);
        this.notification.success('CSV exported successfully.');
      },
      error: () => this.notification.error('Export failed.'),
    });
  }
}
