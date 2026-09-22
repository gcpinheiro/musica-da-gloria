import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';
import { DashboardData, NewsInput, NewsItem } from '../models/dashboard.model';
import { DashboardService } from './dashboard.service';

interface CalendarDay {
  readonly key: string;
  readonly date: string;
  readonly count: number;
  readonly outsideMonth: boolean;
  readonly today: boolean;
  readonly attention: boolean;
}

@Injectable()
export class DashboardFacade {
  private readonly service = inject(DashboardService);
  private readonly dataState = signal<DashboardData | null>(null);
  private readonly newsState = signal<readonly NewsItem[]>([]);
  private readonly selectedDateState = signal(this.dateKey(new Date()));
  private readonly monthCursorState = signal(this.firstDayOfMonth(new Date()));
  private readonly loadingState = signal(false);
  private readonly newsSavingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly data = this.dataState.asReadonly();
  readonly news = this.newsState.asReadonly();
  readonly selectedDate = this.selectedDateState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly newsSaving = this.newsSavingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly schedules = computed(() => this.dataState()?.schedules ?? []);
  readonly monthLabel = computed(() => {
    const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(this.monthCursorState());
    return label.charAt(0).toUpperCase() + label.slice(1);
  });
  readonly monthSchedules = computed(() => {
    const cursor = this.monthCursorState();
    return this.schedules().filter((item) => {
      const date = new Date(item.date);
      return date.getFullYear() === cursor.getFullYear() && date.getMonth() === cursor.getMonth();
    });
  });
  readonly monthSummary = computed(() => {
    const schedules = this.monthSchedules();
    const members = schedules.flatMap((schedule) => schedule.members);
    return {
      celebrations: schedules.length,
      confirmedMembers: members.filter((member) => member.confirmed).length,
      pendingConfirmations: members.filter((member) => !member.confirmed).length,
      openPositions: schedules.filter((schedule) => schedule.status === 'ATTENTION').length,
    };
  });
  readonly calendarDays = computed<readonly CalendarDay[]>(() => {
    const cursor = this.monthCursorState();
    const gridStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1, 12);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());
    const todayKey = this.dateKey(new Date());
    return Array.from({ length: 42 }, (_, offset) => {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + offset);
      const key = this.dateKey(day);
      const schedules = this.schedules().filter((item) => item.date.slice(0, 10) === key);
      return { key, date: day.toISOString(), count: schedules.length, outsideMonth: day.getMonth() !== cursor.getMonth(), today: key === todayKey, attention: schedules.some((item) => item.status === 'ATTENTION') };
    });
  });
  readonly selectedSchedules = computed(() => this.schedules().filter((item) => item.date.slice(0, 10) === this.selectedDateState()));

  load(): void {
    this.loadingState.set(true);
    this.errorState.set(null);
    forkJoin({ data: this.service.getCalendar(), news: this.service.listNews() })
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: ({ data, news }) => { this.dataState.set(data); this.newsState.set(news); },
        error: () => this.errorState.set('Não foi possível carregar a visão geral.'),
      });
  }
  selectDate(date: string): void {
    this.selectedDateState.set(date);
    const selected = new Date(`${date}T12:00:00`);
    if (selected.getMonth() !== this.monthCursorState().getMonth() || selected.getFullYear() !== this.monthCursorState().getFullYear()) this.monthCursorState.set(this.firstDayOfMonth(selected));
  }
  previousMonth(): void { this.changeMonth(-1); }
  nextMonth(): void { this.changeMonth(1); }
  currentMonth(): void { const today = new Date(); this.monthCursorState.set(this.firstDayOfMonth(today)); this.selectedDateState.set(this.dateKey(today)); }
  saveNews(input: NewsInput, id?: string): void { this.newsSavingState.set(true); this.service.saveNews(input, id).pipe(finalize(() => this.newsSavingState.set(false))).subscribe({ next: () => this.refreshNews(), error: () => this.errorState.set('Não foi possível salvar a notícia.') }); }
  deleteNews(id: string): void { this.service.deleteNews(id).subscribe({ next: () => this.refreshNews(), error: () => this.errorState.set('Não foi possível excluir a notícia.') }); }

  private changeMonth(offset: number): void {
    const cursor = this.monthCursorState();
    const target = new Date(cursor.getFullYear(), cursor.getMonth() + offset, 1, 12);
    this.monthCursorState.set(target);
    const firstSchedule = this.schedules().find((item) => { const date = new Date(item.date); return date.getFullYear() === target.getFullYear() && date.getMonth() === target.getMonth(); });
    this.selectedDateState.set(firstSchedule?.date.slice(0, 10) ?? this.dateKey(target));
  }
  private firstDayOfMonth(date: Date): Date { return new Date(date.getFullYear(), date.getMonth(), 1, 12); }
  private dateKey(date: Date): string { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
  private refreshNews(): void { this.service.listNews().subscribe((items) => this.newsState.set(items)); }
}
