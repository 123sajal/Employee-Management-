import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector:   'app-loading-spinner',
  standalone: true,
  imports:    [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="spinner-overlay" [class.inline]="inline">
      <mat-spinner [diameter]="diameter" color="primary" />
      <p *ngIf="message" class="spinner-msg">{{ message }}</p>
    </div>
  `,
  styles: [`
    .spinner-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      gap: 16px;
    }
    .spinner-overlay.inline {
      padding: 0;
    }
    .spinner-msg {
      margin: 0;
      font-size: 13px;
      color: #888;
    }
  `],
})
export class LoadingSpinnerComponent {
  @Input() diameter = 48;
  @Input() message  = '';
  @Input() inline   = false;
}
