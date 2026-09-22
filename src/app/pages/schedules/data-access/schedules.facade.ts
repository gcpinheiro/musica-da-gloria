import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { Schedule, ScheduleInput, ScheduledPerson, ScheduleSongOption, ScheduleStatus, ScheduleMemberOption } from '../models/schedule.model';
import { SchedulesService } from './schedules.service';

@Injectable({ providedIn: 'root' })
export class SchedulesFacade {
  private readonly service = inject(SchedulesService);
  private readonly router = inject(Router);
  private readonly schedulesState = signal<readonly Schedule[]>([]);
  private readonly selectedState = signal<Schedule | null>(null);
  private readonly memberOptionsState = signal<readonly ScheduleMemberOption[]>([]);
  private readonly songOptionsState = signal<readonly ScheduleSongOption[]>([]);
  private readonly loadingState = signal(false);
  private readonly savingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly statusState = signal<ScheduleStatus | 'ALL'>('ALL');

  readonly schedules = this.schedulesState.asReadonly();
  readonly selected = this.selectedState.asReadonly();
  readonly memberOptions = this.memberOptionsState.asReadonly();
  readonly songOptions = this.songOptionsState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly saving = this.savingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly status = this.statusState.asReadonly();
  readonly filtered = computed(() => this.schedulesState().filter((item) => this.statusState() === 'ALL' || item.status === this.statusState()));

  load(): void {
    this.loadingState.set(true);
    this.errorState.set(null);
    this.service.list().pipe(finalize(() => this.loadingState.set(false))).subscribe({ next: (items) => this.schedulesState.set(items), error: () => this.errorState.set('Não foi possível carregar as escalas.') });
  }
  loadOne(id: string): void {
    this.selectedState.set(null);
    this.loadingState.set(true);
    this.errorState.set(null);
    this.service.getById(id).pipe(finalize(() => this.loadingState.set(false))).subscribe({ next: (item) => this.selectedState.set(item), error: () => this.errorState.set('Escala não encontrada.') });
    this.loadOptions();
  }
  loadOptions(): void {
    this.service.listMemberOptions().subscribe((items) => this.memberOptionsState.set(items));
    this.service.listSongOptions().subscribe((items) => this.songOptionsState.set(items));
  }
  setStatus(status: ScheduleStatus | 'ALL'): void { this.statusState.set(status); }
  create(input: ScheduleInput): void {
    this.savingState.set(true);
    this.errorState.set(null);
    this.service.create(input).pipe(finalize(() => this.savingState.set(false))).subscribe({ next: (item) => void this.router.navigate(['/escalas', item.id]), error: () => this.errorState.set('Não foi possível criar a escala.') });
  }
  addMember(member: ScheduledPerson): void { this.updateSelected(this.service.addMember(this.selectedState()?.id ?? '', member)); }
  removeMember(memberId: string): void { this.updateSelected(this.service.removeMember(this.selectedState()?.id ?? '', memberId)); }
  addSong(song: ScheduleSongOption): void { this.updateSelected(this.service.addSong(this.selectedState()?.id ?? '', { ...song, id: `item-${Date.now()}` })); }
  removeSong(itemId: string): void { this.updateSelected(this.service.removeSong(this.selectedState()?.id ?? '', itemId)); }
  private updateSelected(request: Observable<Schedule>): void {
    this.savingState.set(true);
    this.errorState.set(null);
    request.pipe(finalize(() => this.savingState.set(false))).subscribe({ next: (item) => this.selectedState.set(item), error: () => this.errorState.set('Não foi possível atualizar esta escala.') });
  }
}
