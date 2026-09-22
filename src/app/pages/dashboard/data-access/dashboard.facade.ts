import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';
import { DashboardData, NewsInput, NewsItem } from '../models/dashboard.model';
import { DashboardService } from './dashboard.service';

@Injectable()
export class DashboardFacade {
  private readonly service = inject(DashboardService);
  private readonly dataState = signal<DashboardData | null>(null);
  private readonly newsState = signal<readonly NewsItem[]>([]);
  private readonly selectedDateState = signal('');
  private readonly loadingState = signal(false);
  private readonly newsSavingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  readonly data = this.dataState.asReadonly(); readonly news = this.newsState.asReadonly(); readonly selectedDate = this.selectedDateState.asReadonly(); readonly loading = this.loadingState.asReadonly(); readonly newsSaving = this.newsSavingState.asReadonly(); readonly error = this.errorState.asReadonly();
  readonly schedules = computed(() => this.dataState()?.schedules ?? []);
  readonly calendarDays = computed(() => {
    const base = new Date(); base.setHours(12, 0, 0, 0);
    return Array.from({ length: 7 }, (_, offset) => { const day = new Date(base); day.setDate(base.getDate() + offset); const key = day.toISOString().slice(0, 10); return { key, date: day.toISOString(), count: this.schedules().filter((item) => item.date.slice(0, 10) === key).length }; });
  });
  readonly selectedSchedules = computed(() => this.schedules().filter((item) => item.date.slice(0, 10) === this.selectedDateState()));
  load(): void {
    this.loadingState.set(true); this.errorState.set(null);
    forkJoin({ data: this.service.getWeek(), news: this.service.listNews() }).pipe(finalize(() => this.loadingState.set(false))).subscribe({ next: ({ data, news }) => { this.dataState.set(data); this.newsState.set(news); this.selectedDateState.set(this.calendarDays().find((day) => day.count > 0)?.key ?? this.calendarDays()[0]?.key ?? ''); }, error: () => this.errorState.set('Não foi possível carregar a visão geral.') });
  }
  selectDate(date: string): void { this.selectedDateState.set(date); }
  saveNews(input: NewsInput, id?: string): void { this.newsSavingState.set(true); this.service.saveNews(input, id).pipe(finalize(() => this.newsSavingState.set(false))).subscribe({ next: () => this.refreshNews(), error: () => this.errorState.set('Não foi possível salvar a notícia.') }); }
  deleteNews(id: string): void { this.service.deleteNews(id).subscribe({ next: () => this.refreshNews(), error: () => this.errorState.set('Não foi possível excluir a notícia.') }); }
  private refreshNews(): void { this.service.listNews().subscribe((items) => this.newsState.set(items)); }
}
