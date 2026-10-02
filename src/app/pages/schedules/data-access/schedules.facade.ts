import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { ConfirmationStatus, Schedule, ScheduleInput, ScheduledPerson, ScheduledSong, ScheduleSongOption, ScheduleStatus, ScheduleMemberOption } from '../models/schedule.model';
import { SchedulesService } from './schedules.service';
import { MinistriesService } from '../../ministries/data-access/ministries.service';
import { Ministry } from '../../ministries/models/ministry.model';
import { filterSchedules, ScheduleAssignmentFilter } from '../utils/schedule-filters';
import { AuthFacade } from '../../../core/auth/auth.facade';
export type { ScheduleAssignmentFilter } from '../utils/schedule-filters';

@Injectable({ providedIn: 'root' })
export class SchedulesFacade {
  private readonly service = inject(SchedulesService);
  private readonly ministriesService = inject(MinistriesService);
  private readonly router = inject(Router);
  private readonly authFacade = inject(AuthFacade);
  private readonly schedulesState = signal<readonly Schedule[]>([]);
  private readonly selectedState = signal<Schedule | null>(null);
  private readonly memberOptionsState = signal<readonly ScheduleMemberOption[]>([]);
  private readonly songOptionsState = signal<readonly ScheduleSongOption[]>([]);
  private readonly songPageState = signal(1);
  private readonly songPageSizeState = signal(8);
  private readonly songTotalState = signal(0);
  private readonly songQueryState = signal('');
  private readonly songOptionsLoadingState = signal(false);
  private readonly ministryOptionsState = signal<readonly Ministry[]>([]);
  private readonly loadingState = signal(false);
  private readonly savingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly messageState = signal<string | null>(null);
  private readonly statusState = signal<ScheduleStatus | 'ALL'>('ALL');
  private readonly assignmentFilterState = signal<ScheduleAssignmentFilter>('ALL');
  private readonly currentMemberIdState = signal<string | null>(null);

  readonly schedules = this.schedulesState.asReadonly();
  readonly selected = this.selectedState.asReadonly();
  readonly memberOptions = this.memberOptionsState.asReadonly();
  readonly songOptions = this.songOptionsState.asReadonly();
  readonly songPage = this.songPageState.asReadonly();
  readonly songPageSize = this.songPageSizeState.asReadonly();
  readonly songTotal = this.songTotalState.asReadonly();
  readonly songQuery = this.songQueryState.asReadonly();
  readonly songOptionsLoading = this.songOptionsLoadingState.asReadonly();
  readonly songPageCount = computed(() => Math.max(1, Math.ceil(this.songTotalState() / this.songPageSizeState())));
  readonly ministryOptions = this.ministryOptionsState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly saving = this.savingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly message = this.messageState.asReadonly();
  readonly status = this.statusState.asReadonly();
  readonly assignmentFilter = this.assignmentFilterState.asReadonly();
  readonly filtered = computed(() => filterSchedules(this.schedulesState(), this.statusState(), this.assignmentFilterState(), this.currentMemberIdState()));
  readonly myParticipation = computed(() => {
    const memberId = this.authFacade.user()?.memberId;
    return memberId ? this.selectedState()?.people.find((person) => person.id === memberId) ?? null : null;
  });

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
    this.loadSongOptions('', 1);
    if (this.authFacade.canManage()) {
      this.service.listMemberOptions().subscribe((items) => this.memberOptionsState.set(items));
      this.ministriesService.list().subscribe((items) => this.ministryOptionsState.set(items.filter((item) => item.active)));
    }
  }
  loadSongOptions(query = this.songQueryState(), page = 1): void {
    this.songQueryState.set(query);
    this.songOptionsLoadingState.set(true);
    this.service.listSongOptions(query, page, this.songPageSizeState()).pipe(finalize(() => this.songOptionsLoadingState.set(false))).subscribe({
      next: (result) => { this.songOptionsState.set(result.items); this.songPageState.set(result.page); this.songTotalState.set(result.total); },
      error: () => this.errorState.set('Não foi possível carregar as músicas.'),
    });
  }
  setStatus(status: ScheduleStatus | 'ALL'): void { this.statusState.set(status); }
  configureMemberFilter(memberId: string): void { this.currentMemberIdState.set(memberId); this.assignmentFilterState.set('MINE'); }
  setAssignmentFilter(filter: ScheduleAssignmentFilter): void { this.assignmentFilterState.set(filter); }
  create(input: ScheduleInput): void {
    this.savingState.set(true);
    this.errorState.set(null);
    const ministryId = this.ministryOptionsState().find((item) => item.name === input.ministry)?.id;
    this.service.create(input, ministryId).pipe(finalize(() => this.savingState.set(false))).subscribe({ next: (item) => void this.router.navigate(['/escalas', item.id]), error: () => this.errorState.set('Não foi possível criar a escala.') });
  }
  addMember(member: ScheduledPerson): void { this.updateSelected(this.service.addMember(this.selectedState()?.id ?? '', member)); }
  removeMember(memberId: string): void { this.updateSelected(this.service.removeMember(this.selectedState()?.id ?? '', memberId)); }
  addSong(song: ScheduleSongOption): void { this.updateSelected(this.service.addSong(this.selectedState()?.id ?? '', { ...song, id: `item-${Date.now()}` })); }
  removeSong(itemId: string): void { this.updateSelected(this.service.removeSong(this.selectedState()?.id ?? '', itemId)); }
  moveSong(itemId: string, direction: -1 | 1): void {
    const schedule = this.selectedState();
    if (!schedule) return;
    const current = schedule.songs.findIndex((item) => item.id === itemId);
    const target = current + direction;
    if (current < 0 || target < 0 || target >= schedule.songs.length) return;
    const songs: ScheduledSong[] = [...schedule.songs];
    [songs[current], songs[target]] = [songs[target], songs[current]];
    this.updateSelected(this.service.reorderSongs(schedule.id, songs), 'Ordem do repertório atualizada.');
  }
  publish(): void { this.updateSelected(this.service.publish(this.selectedState()?.id ?? ''), 'Escala publicada. Os membros escalados já podem responder.'); }
  archive(): void {
    const id = this.selectedState()?.id;
    if (!id) return;
    this.savingState.set(true);
    this.errorState.set(null);
    this.service.archive(id).pipe(finalize(() => this.savingState.set(false))).subscribe({
      next: () => { this.selectedState.set(null); void this.router.navigate(['/escalas']); },
      error: () => this.errorState.set('Não foi possível excluir esta escala.'),
    });
  }
  archiveMany(ids: readonly string[]): void {
    if (!ids.length) return;
    this.savingState.set(true);
    this.errorState.set(null);
    this.messageState.set(null);
    this.service.archiveMany(ids).pipe(finalize(() => this.savingState.set(false))).subscribe({
      next: () => { const removed = new Set(ids); this.schedulesState.update((items) => items.filter((item) => !removed.has(item.id))); this.messageState.set(`${ids.length} escala(s) excluída(s).`); },
      error: () => this.errorState.set('Não foi possível excluir as escalas selecionadas.'),
    });
  }
  respond(confirmation: Exclude<ConfirmationStatus, 'PENDING'>): void {
    const scheduleId = this.selectedState()?.id;
    const memberId = this.authFacade.user()?.memberId;
    if (!scheduleId || !memberId) return;
    this.updateSelected(this.service.updateConfirmation(scheduleId, memberId, confirmation), confirmation === 'CONFIRMED' ? 'Presença confirmada.' : 'Resposta registrada: você não poderá participar.');
  }
  private updateSelected(request: Observable<Schedule>, successMessage?: string): void {
    this.savingState.set(true);
    this.errorState.set(null);
    this.messageState.set(null);
    request.pipe(finalize(() => this.savingState.set(false))).subscribe({ next: (item) => { this.selectedState.set(item); if (successMessage) this.messageState.set(successMessage); }, error: () => this.errorState.set('Não foi possível atualizar esta escala.') });
  }
}
