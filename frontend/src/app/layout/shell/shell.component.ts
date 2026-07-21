import { Component, ViewChild, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent }  from '../navbar/navbar.component';

@Component({
  selector:   'app-shell',
  standalone: true,
  imports:    [RouterOutlet, MatSidenavModule, SidebarComponent, NavbarComponent],
  template: `
    <mat-sidenav-container class="shell-container">

      <mat-sidenav
        #sidenav
        [mode]="sidenavMode()"
        [opened]="sidenavOpen()"
        (openedChange)="sidenavOpen.set($event)"
        class="app-sidenav">
        <app-sidebar (navItemClicked)="onNavItemClicked()" />
      </mat-sidenav>

      <mat-sidenav-content class="main-sidenav-content">
        <app-navbar (menuToggle)="sidenav.toggle()" />
        <div class="content-area">
          <router-outlet />
        </div>
      </mat-sidenav-content>

    </mat-sidenav-container>
  `,
  styles: [`
    .shell-container        { height: 100vh; }
    .app-sidenav            { width: 255px; border-right: none; }
    .main-sidenav-content   { display: flex; flex-direction: column; height: 100vh; }
    .content-area           { flex: 1; overflow-y: auto; padding: 24px; background: #f4f6f9; }

    @media (max-width: 768px) {
      .content-area { padding: 16px; }
    }
  `],
})
export class ShellComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  sidenavOpen = signal(true);
  sidenavMode = signal<'over' | 'side'>('side');

  constructor(private breakpoints: BreakpointObserver) {
    this.breakpoints
      .observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
      .subscribe((result) => {
        if (result.matches) {
          this.sidenavMode.set('over');
          this.sidenavOpen.set(false);
        } else {
          this.sidenavMode.set('side');
          this.sidenavOpen.set(true);
        }
      });
  }

  onNavItemClicked(): void {
    if (this.sidenavMode() === 'over') {
      this.sidenavOpen.set(false);
    }
  }
}
