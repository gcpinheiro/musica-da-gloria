import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { DashboardData, NewsInput, NewsItem } from '../models/dashboard.model';
import { DASHBOARD_MOCK, NEWS_MOCK } from './dashboard.mock';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private news: NewsItem[] = NEWS_MOCK.map((item) => ({ ...item }));
  getWeek(): Observable<DashboardData> {
    return of(DASHBOARD_MOCK).pipe(delay(350));
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
