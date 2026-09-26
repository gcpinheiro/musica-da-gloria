import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { SchedulesService } from '../../schedules/data-access/schedules.service';
import { ScheduleMemberOption } from '../../schedules/models/schedule.model';
import { Ministry, MinistryInput, MINISTRY_WEEKDAYS } from '../models/ministry.model';
import { buildMinistryOccurrences } from '../utils/ministry-occurrences';
import { MinistriesService } from './ministries.service';

@Injectable()
export class MinistriesFacade {
  private readonly service = inject(MinistriesService);
  private readonly schedulesService = inject(SchedulesService);
  private readonly router = inject(Router);
  private readonly ministriesState = signal<readonly Ministry[]>([]);
  private readonly selectedState = signal<Ministry | null>(null);
  private readonly memberOptionsState = signal<readonly ScheduleMemberOption[]>([]);
  private readonly loadingState = signal(false);
  private readonly savingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly generationMessageState = signal<string | null>(null);

  readonly ministries = this.ministriesState.asReadonly();
  readonly selected = this.selectedState.asReadonly();
  readonly memberOptions = this.memberOptionsState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly saving = this.savingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly generationMessage = this.generationMessageState.asReadonly();
  readonly activeCount = computed(() => this.ministriesState().filter((item) => item.active).length);

  load(): void {
    this.loadingState.set(true);
    this.errorState.set(null);
    this.service.list().pipe(finalize(() => this.loadingState.set(false))).subscribe({ next: (items) => this.ministriesState.set(items), error: () => this.errorState.set('Não foi possível carregar os ministérios.') });
  }
  loadOne(id: string): void {
    this.loadingState.set(true);
    this.errorState.set(null);
    forkJoin({ ministry: this.service.getById(id), members: this.schedulesService.listMemberOptions() })
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({ next: ({ ministry, members }) => { this.selectedState.set(ministry); this.memberOptionsState.set(members); }, error: () => this.errorState.set('Ministério não encontrado.') });
  }
  loadMemberOptions(): void { this.schedulesService.listMemberOptions().subscribe((items) => this.memberOptionsState.set(items)); }
  save(input: MinistryInput, id?: string): void {
    this.savingState.set(true);
    this.errorState.set(null);
    const request = id ? this.service.update(id, input) : this.service.create(input);
    request.pipe(finalize(() => this.savingState.set(false))).subscribe({ next: (item) => void this.router.navigate(['/ministerios', item.id]), error: () => this.errorState.set('Não foi possível salvar o ministério.') });
  }
  archive(id: string): void { this.service.archive(id).subscribe({ next: () => void this.router.navigate(['/ministerios']), error: () => this.errorState.set('Não foi possível arquivar o ministério.') }); }
  generateUntil(endDate: string): void {
    const ministry = this.selectedState();
    if (!ministry || !endDate) return;
    const inputs = buildMinistryOccurrences(ministry, endDate);
    this.savingState.set(true);
    this.errorState.set(null);
    this.schedulesService.generate(inputs).subscribe({
      next: (generated) => this.service.markGenerated(ministry.id, endDate).pipe(finalize(() => this.savingState.set(false))).subscribe((updated) => {
        this.selectedState.set(updated);
        this.generationMessageState.set(`${generated.length} ${generated.length === 1 ? 'escala criada' : 'escalas criadas'} até ${this.formatDate(endDate)}.`);
      }),
      error: () => { this.savingState.set(false); this.errorState.set('Não foi possível gerar as escalas recorrentes.'); },
    });
  }
  weekdayLabel(value: Ministry['weekday']): string { return MINISTRY_WEEKDAYS.find((item) => item.value === value)?.label ?? value; }

  private formatDate(value: string): string { const [year, month, day] = value.split('-'); return `${day}/${month}/${year}`; }
}
