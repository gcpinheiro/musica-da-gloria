import { inject, Injectable } from '@angular/core';
import { delay, map, Observable, of } from 'rxjs';
import { SchedulesService } from '../../schedules/data-access/schedules.service';
import { DashboardData, NewsInput, NewsItem } from '../models/dashboard.model';
import { NEWS_MOCK } from './dashboard.mock';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly schedulesService = inject(SchedulesService);
  private news: NewsItem[] = NEWS_MOCK.map((item) => ({ ...item }));
  getCalendar(): Observable<DashboardData> {
    return this.schedulesService.list().pipe(map((schedules) => ({
      summary: { celebrations: 0, confirmedMembers: 0, pendingConfirmations: 0, openPositions: 0 },
      schedules: schedules.map((schedule) => ({
        id: schedule.id,
        title: schedule.title,
        ministry: schedule.ministry,
        date: schedule.date,
        time: schedule.time,
        location: schedule.location,
        liturgicalTime: schedule.liturgicalTime,
        status: schedule.status === 'PUBLISHED' ? 'CONFIRMED' as const : schedule.status === 'DRAFT' ? 'PENDING' as const : 'ATTENTION' as const,
        members: schedule.people.map((person) => ({ id: person.id, name: person.name, initials: person.initials, role: person.role, confirmed: person.confirmation === 'CONFIRMED' })),
        totalMembers: schedule.people.length,
        repertoireCount: schedule.songs.length,
        alert: schedule.status === 'ATTENTION' ? schedule.notes : undefined,
      })),
    })));
  }
  listNews(): Observable<readonly NewsItem[]> { return of(this.news.map((item) => ({ ...item }))).pipe(delay(220)); }
  saveNews(input: NewsInput, id?: string): Observable<NewsItem> {
    const current = id ? this.news.find((item) => item.id === id) : undefined;
    const item: NewsItem = current ? { ...current, ...input } : { ...input, id: `news-${Date.now()}`, publishedAt: new Date().toISOString(), author: 'Eury' };
    this.news = current ? this.news.map((news) => news.id === id ? item : news) : [item, ...this.news];
    return of({ ...item }).pipe(delay(250));
  }
  deleteNews(id: string): Observable<void> { this.news = this.news.filter((item) => item.id !== id); return of(undefined).pipe(delay(180)); }
}
