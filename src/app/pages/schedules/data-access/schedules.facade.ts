import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Schedule, ScheduleInput, ScheduleStatus } from '../models/schedule.model';
import { SchedulesService } from './schedules.service';

@Injectable({ providedIn: 'root' })
export class SchedulesFacade {
  private readonly service = inject(SchedulesService);
  private readonly router = inject(Router);
  private readonly schedulesState = signal<readonly Schedule[]>([]);
  private readonly selectedState = signal<Schedule | null>(null);
  private readonly loadingState = signal(false);
  private readonly savingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly statusState = signal<ScheduleStatus | 'ALL'>('ALL');

  readonly schedules = this.schedulesState.asReadonly();
  readonly selected = this.selectedState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly saving = this.savingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly status = this.statusState.asReadonly();
  readonly filtered = computed(() => this.schedulesState().filter((item) => this.statusState() === 'ALL' || item.status === this.statusState()));

  load(): void {
    this.loadingState.set(true);
    this.errorState.set(null);
    this.service.list().pipe(finalize(() => this.loadingState.set(false))).subscribe({
      next: (schedules) => this.schedulesState.set(schedules),
      error: () => this.errorState.set('Não foi possível carregar as escalas.'),
    });
  }

  loadOne(id: string): void {
    this.selectedState.set(null);
    this.loadingState.set(true);
    this.errorState.set(null);
    this.service.getById(id).pipe(finalize(() => this.loadingState.set(false))).subscribe({
      next: (schedule) => this.selectedState.set(schedule),
      error: () => this.errorState.set('Escala não encontrada.'),
    });
  }

  setStatus(status: ScheduleStatus | 'ALL'): void { this.statusState.set(status); }

  create(input: ScheduleInput): void {
    this.savingState.set(true);
    this.service.create(input).pipe(finalize(() => this.savingState.set(false))).subscribe({
      next: (schedule) => void this.router.navigate(['/escalas', schedule.id]),
      error: () => this.errorState.set('Não foi possível criar a escala.'),
    });
  }
}
