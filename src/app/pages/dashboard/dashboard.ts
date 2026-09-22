import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardFacade } from './data-access/dashboard.facade';
import { AuthFacade } from '../../core/auth/auth.facade';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, RouterLink],
  providers: [DashboardFacade],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  protected readonly facade = inject(DashboardFacade);
  protected readonly authFacade = inject(AuthFacade);

  ngOnInit(): void {
    this.facade.load();
  }
}
