import { Component, Inject } from '@angular/core';
import { MatButtonModule }   from '@angular/material/button';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title:        string;
  message:      string;
  confirmText?: string;
  cancelText?:  string;
  danger?:      boolean;
}

@Component({
  selector:   'app-confirm-dialog',
  standalone: true,
  imports:    [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon [color]="data.danger ? 'warn' : 'primary'">
        {{ data.danger ? 'warning' : 'help_outline' }}
      </mat-icon>
      {{ data.title }}
    </h2>

    <mat-dialog-content>
      <p class="dialog-msg">{{ data.message }}</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button [mat-dialog-close]="false">
        {{ data.cancelText || 'Cancel' }}
      </button>
      <button
        mat-flat-button
        [color]="data.danger ? 'warn' : 'primary'"
        [mat-dialog-close]="true"
        cdkFocusInitial>
        {{ data.confirmText || 'Confirm' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title { display: flex; align-items: center; gap: 8px; font-size: 18px; }
    .dialog-msg   { font-size: 15px; color: #555; margin: 0; line-height: 1.6; }
    mat-dialog-actions { padding: 8px 0 !important; gap: 8px; }
  `],
})
export class ConfirmDialogComponent {
  constructor(
    public  dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
  ) {}
}
