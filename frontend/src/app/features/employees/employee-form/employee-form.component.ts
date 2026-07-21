import { Component, OnInit, signal } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule }     from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }    from '@angular/material/input';
import { MatSelectModule }   from '@angular/material/select';
import { MatButtonModule }   from '@angular/material/button';
import { MatIconModule }     from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule }    from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule }  from '@angular/material/divider';

import { EmployeeService }   from '../../../core/services/employee.service';
import { DepartmentService } from '../../../core/services/department.service';
import { RoleService }       from '../../../core/services/role.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Department } from '../../../core/models/department.model';
import { Role }       from '../../../core/models/role.model';

@Component({
  selector:   'app-employee-form',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule,
    MatDatepickerModule, MatNativeDateModule, MatRadioModule,
    MatProgressSpinnerModule, MatDividerModule,
  ],
  template: `
    <div class="employee-form-page">
      <div class="page-header">
        <div>
          <h1>{{ isEdit ? 'Edit Employee' : 'Add New Employee' }}</h1>
          <p class="subtitle">{{ isEdit ? 'Update the employee details below.' : 'Fill in the details to create a new employee record.' }}</p>
        </div>
        <a mat-stroked-button routerLink="/employees">
          <mat-icon>arrow_back</mat-icon> Back to List
        </a>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
        <mat-card class="form-section-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>person</mat-icon> Personal Information
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="first_name" placeholder="John" />
                <mat-error *ngIf="f['first_name'].hasError('required')">First name is required.</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="last_name" placeholder="Doe" />
                <mat-error *ngIf="f['last_name'].hasError('required')">Last name is required.</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email Address</mat-label>
                <input matInput type="email" formControlName="email" placeholder="john.doe@company.com" />
                <mat-icon matPrefix>email</mat-icon>
                <mat-error *ngIf="f['email'].hasError('required')">Email is required.</mat-error>
                <mat-error *ngIf="f['email'].hasError('email')">Enter a valid email.</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Phone Number</mat-label>
                <input matInput formControlName="phone" placeholder="555-0100" />
                <mat-icon matPrefix>phone</mat-icon>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Address</mat-label>
              <textarea matInput formControlName="address" rows="2" placeholder="Street, City, State, ZIP"></textarea>
              <mat-icon matPrefix>location_on</mat-icon>
            </mat-form-field>
          </mat-card-content>
        </mat-card>

        <mat-card class="form-section-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>work</mat-icon> Employment Details
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Department</mat-label>
                <mat-select formControlName="department_id">
                  <mat-option [value]="null">— None —</mat-option>
                  <mat-option *ngFor="let d of departments()" [value]="d.id">{{ d.name }}</mat-option>
                </mat-select>
                <mat-icon matPrefix>business</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Role / Job Title</mat-label>
                <mat-select formControlName="role_id">
                  <mat-option [value]="null">— None —</mat-option>
                  <mat-option *ngFor="let r of roles()" [value]="r.id">{{ r.title }}</mat-option>
                </mat-select>
                <mat-icon matPrefix>badge</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Salary (USD)</mat-label>
                <input matInput type="number" formControlName="salary" placeholder="75000" min="0" />
                <span matPrefix>$&nbsp;</span>
                <mat-error *ngIf="f['salary'].hasError('required')">Salary is required.</mat-error>
                <mat-error *ngIf="f['salary'].hasError('min')">Salary cannot be negative.</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Date of Joining</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="date_of_joining" />
                <mat-datepicker-toggle matSuffix [for]="picker" />
                <mat-datepicker #picker />
                <mat-error *ngIf="f['date_of_joining'].hasError('required')">Date is required.</mat-error>
              </mat-form-field>
            </div>

            <div class="status-row">
              <label class="status-label">Status</label>
              <mat-radio-group formControlName="status" class="status-group">
                <mat-radio-button value="active"   color="primary">Active</mat-radio-button>
                <mat-radio-button value="inactive" color="warn">Inactive</mat-radio-button>
              </mat-radio-group>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="form-section-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>photo_camera</mat-icon> Profile Photo (Optional)
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="photo-upload-area">
              <div class="photo-preview" *ngIf="photoPreview()">
                <img [src]="photoPreview()!" alt="Preview" />
                <button mat-icon-button class="remove-photo" (click)="removePhoto()" type="button">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
              <div class="photo-placeholder" *ngIf="!photoPreview()" (click)="photoInput.click()">
                <mat-icon>add_photo_alternate</mat-icon>
                <span>Click to upload photo</span>
                <span class="photo-hint">JPG, PNG, GIF up to 5MB</span>
              </div>
              <input
                #photoInput
                type="file"
                accept="image/*"
                hidden
                (change)="onPhotoChange($event)" />
            </div>
          </mat-card-content>
        </mat-card>

        <div class="form-actions">
          <a mat-stroked-button routerLink="/employees">Cancel</a>
          <button mat-flat-button color="primary" type="submit" [disabled]="saving()">
            <mat-spinner *ngIf="saving()" diameter="20" />
            <mat-icon *ngIf="!saving()">{{ isEdit ? 'save' : 'person_add' }}</mat-icon>
            {{ isEdit ? 'Save Changes' : 'Create Employee' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .employee-form-page { max-width: 900px; }
    .form-section-card  { margin-bottom: 20px; }
    mat-card-title      { display: flex; align-items: center; gap: 8px; font-size: 15px !important; }
    .w-100              { width: 100%; }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 0 20px;
    }

    .status-row   { display: flex; align-items: center; gap: 20px; margin-top: 8px; }
    .status-label { font-size: 13px; color: #666; font-weight: 500; }
    .status-group { display: flex; gap: 24px; }

    .photo-upload-area  { display: flex; align-items: center; gap: 20px; }
    .photo-placeholder  {
      width: 140px; height: 140px; border-radius: 12px;
      border: 2px dashed #c5cae9; background: #f5f7ff;
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 6px; cursor: pointer;
      color: #9fa8da; font-size: 12px; transition: border-color .18s;
    }
    .photo-placeholder:hover { border-color: #3949ab; color: #3949ab; }
    .photo-placeholder mat-icon { font-size: 36px; width: 36px; height: 36px; }
    .photo-hint { font-size: 10px; color: #bbb; }
    .photo-preview {
      position: relative; width: 140px; height: 140px;
    }
    .photo-preview img {
      width: 140px; height: 140px; border-radius: 12px;
      object-fit: cover; border: 2px solid #e8eaf6;
    }
    .remove-photo {
      position: absolute; top: -8px; right: -8px;
      background: #fff; border: 1px solid #ddd;
      width: 28px; height: 28px; min-width: unset;
    }
    .remove-photo mat-icon { font-size: 16px; }

    .form-actions {
      display: flex; justify-content: flex-end; gap: 12px;
      padding: 8px 0 24px;
    }
    .form-actions button mat-spinner { display: inline-flex; }
  `],
})
export class EmployeeFormComponent implements OnInit {
  form!:       FormGroup;
  isEdit       = false;
  empId:       number | null = null;
  saving       = signal(false);
  photoPreview = signal<string | null>(null);
  photoFile:   File | null = null;

  departments = signal<Department[]>([]);
  roles       = signal<Role[]>([]);

  constructor(
    private fb:           FormBuilder,
    private route:        ActivatedRoute,
    private router:       Router,
    private empService:   EmployeeService,
    private deptService:  DepartmentService,
    private roleService:  RoleService,
    private notification: NotificationService,
  ) {}

  get f() { return this.form.controls; }

  ngOnInit(): void {
    this.buildForm();
    this.loadDropdowns();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.empId  = +id;
      this.loadEmployee(+id);
    }
  }

  buildForm(): void {
    this.form = this.fb.group({
      first_name:      ['', Validators.required],
      last_name:       ['', Validators.required],
      email:           ['', [Validators.required, Validators.email]],
      phone:           [''],
      department_id:   [null],
      role_id:         [null],
      salary:          [0, [Validators.required, Validators.min(0)]],
      date_of_joining: ['', Validators.required],
      address:         [''],
      status:          ['active', Validators.required],
    });
  }

  loadDropdowns(): void {
    this.deptService.getAll().subscribe((r) => this.departments.set(r.data ?? []));
    this.roleService.getAll().subscribe((r) => this.roles.set(r.data ?? []));
  }

  loadEmployee(id: number): void {
    this.empService.getById(id).subscribe({
      next: (res) => {
        const e = res.data!;
        this.form.patchValue({
          ...e,
          date_of_joining: e.date_of_joining ? new Date(e.date_of_joining) : '',
        });
        if (e.photo) this.photoPreview.set(`http://localhost:5000${e.photo}`);
      },
      error: () => this.router.navigate(['/employees']),
    });
  }

  onPhotoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.photoFile = file;
    const reader  = new FileReader();
    reader.onload = (e) => this.photoPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  removePhoto(): void {
    this.photoFile = null;
    this.photoPreview.set(null);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.saving.set(true);

    const raw = this.form.value;
    const fd  = new FormData();

    Object.entries(raw).forEach(([key, val]) => {
      if (val instanceof Date) {
        fd.append(key, val.toISOString().split('T')[0]);
      } else if (val !== null && val !== undefined) {
        fd.append(key, String(val));
      }
    });

    if (this.photoFile) fd.append('photo', this.photoFile);

    const request$ = this.isEdit
      ? this.empService.update(this.empId!, fd)
      : this.empService.create(fd);

    request$.subscribe({
      next: () => {
        this.notification.success(
          this.isEdit ? 'Employee updated successfully.' : 'Employee created successfully.'
        );
        this.router.navigate(['/employees']);
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err?.error?.message ?? 'Operation failed.');
      },
    });
  }
}
