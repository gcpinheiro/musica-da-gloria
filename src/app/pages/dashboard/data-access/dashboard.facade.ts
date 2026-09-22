import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { DashboardData } from '../models/dashboard.model';
import { DashboardService } from './dashboard.service';

@Injectable()
export class DashboardFacade {
  private readonly dashboardService = inject(DashboardService);
  private readonly dataState = signal<DashboardData | null>(null);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly data = this.dataState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly schedules = computed(() => this.dataState()?.schedules ?? []);

  load(): void {
    this.loadingState.set(true);
    this.errorState.set(null);
    this.dashboardService
      .getWeek()
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (data) => this.dataState.set(data),
        error: () => this.errorState.set('Não foi possível carregar a escala da semana.'),
      });
  }
}
