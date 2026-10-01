import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Optional } from '@angular/core';
import { delay, map, Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SchedulesService } from '../../schedules/data-access/schedules.service';
import {
  DashboardData,
  NewsInput,
  NewsItem,
  WeekSchedule,
} from '../models/dashboard.model';
import { NEWS_MOCK } from './dashboard.mock';

interface ApiNews {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly publishedAt: string;
  readonly author: { readonly name: string };
}

interface ApiDashboardOccurrence {
  readonly id: string;
  readonly title: string;
  readonly startsAt: string;
  readonly timezone: string;
  readonly location: string;
  readonly ministry?: string;
  readonly ministryId: string;
  readonly liturgicalTime?: string;
  readonly status: 'DRAFT' | 'PUBLISHED' | 'ATTENTION' | 'CANCELLED';
  readonly memberCount: number;
  readonly repertoireCount: number;
  readonly notes?: string;
  readonly myConfirmation?: 'CONFIRMED' | 'PENDING' | 'DECLINED';
}

interface ApiDashboard {
  readonly summary: DashboardData['summary'];
  readonly occurrences: readonly ApiDashboardOccurrence[];
  readonly news: readonly ApiNews[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly schedulesService = inject(SchedulesService);
  private news: NewsItem[] = NEWS_MOCK.map((item) => ({ ...item }));

  constructor(@Optional() private readonly http: HttpClient | null = null) {}

  getCalendar(month?: string): Observable<DashboardData> {
    if (this.usesApi()) {
      return this.http!
        .get<ApiDashboard>(`${environment.apiBaseUrl}/dashboard`, {
          ...this.options(),
          params: month ? { month } : undefined,
        })
        .pipe(
          map((data) => ({
            summary: data.summary,
            schedules: data.occurrences.map((item) =>
              this.fromApiOccurrence(item),
            ),
            news: data.news.map((item) => this.fromApi(item)),
          })),
        );
    }

    return this.schedulesService.list().pipe(
      map((schedules) => {
        const items: readonly WeekSchedule[] = schedules.map((schedule) => ({
          id: schedule.id,
          title: schedule.title,
          ministry: schedule.ministry,
          date: schedule.date,
          time: schedule.time,
          location: schedule.location,
          liturgicalTime: schedule.liturgicalTime,
          status:
            schedule.status === 'PUBLISHED'
              ? 'CONFIRMED'
              : schedule.status === 'DRAFT'
                ? 'PENDING'
                : 'ATTENTION',
          members: schedule.people.map((person) => ({
            id: person.id,
            name: person.name,
            initials: person.initials,
            role: person.role,
            confirmed: person.confirmation === 'CONFIRMED',
          })),
          totalMembers: schedule.people.length,
          repertoireCount: schedule.songs.length,
          alert:
            schedule.status === 'ATTENTION' ? schedule.notes : undefined,
        }));
        return {
          summary: this.summary(items),
          schedules: items,
          news: this.news.map((item) => ({ ...item })),
        };
      }),
    );
  }

  listNews(): Observable<readonly NewsItem[]> {
    if (this.usesApi()) {
      return this.http!
        .get<readonly ApiNews[]>(
          `${environment.apiBaseUrl}/news`,
          this.options(),
        )
        .pipe(map((items) => items.map((item) => this.fromApi(item))));
    }
    return of(this.news.map((item) => ({ ...item }))).pipe(delay(220));
  }

  saveNews(input: NewsInput, id?: string): Observable<NewsItem> {
    if (this.usesApi()) {
      const request = id
        ? this.http!.patch<ApiNews>(
            `${environment.apiBaseUrl}/news/${id}`,
            input,
            this.options(),
          )
        : this.http!.post<ApiNews>(
            `${environment.apiBaseUrl}/news`,
            input,
            this.options(),
          );
      return request.pipe(map((item) => this.fromApi(item)));
    }
    const current = id
      ? this.news.find((item) => item.id === id)
      : undefined;
    const item: NewsItem = current
      ? { ...current, ...input }
      : {
          ...input,
          id: `news-${Date.now()}`,
          publishedAt: new Date().toISOString(),
          author: 'Eury',
        };
    this.news = current
      ? this.news.map((news) => (news.id === id ? item : news))
      : [item, ...this.news];
    return of({ ...item }).pipe(delay(250));
  }

  deleteNews(id: string): Observable<void> {
    if (this.usesApi()) {
      return this.http!.delete<void>(
        `${environment.apiBaseUrl}/news/${id}`,
        this.options(),
      );
    }
    this.news = this.news.filter((item) => item.id !== id);
    return of(undefined).pipe(delay(180));
  }

  private fromApiOccurrence(item: ApiDashboardOccurrence): WeekSchedule {
    return {
      id: item.id,
      title: item.title,
      ministry: item.ministry ?? item.ministryId,
      date: item.startsAt,
      time: this.localTime(item.startsAt, item.timezone),
      location: item.location,
      liturgicalTime: item.liturgicalTime ?? '',
      status:
        item.myConfirmation === 'PENDING'
          ? 'PENDING'
          : item.myConfirmation === 'DECLINED'
            ? 'ATTENTION'
            : item.status === 'PUBLISHED'
              ? 'CONFIRMED'
              : item.status === 'DRAFT'
                ? 'PENDING'
                : 'ATTENTION',
      members: [],
      totalMembers: item.memberCount,
      repertoireCount: item.repertoireCount,
      alert: item.status === 'ATTENTION' ? item.notes : undefined,
      myConfirmation: item.myConfirmation,
    };
  }

  private fromApi(item: ApiNews): NewsItem {
    return {
      id: item.id,
      title: item.title,
      body: item.body,
      publishedAt: item.publishedAt,
      author: item.author.name,
    };
  }

  private summary(schedules: readonly WeekSchedule[]): DashboardData['summary'] {
    const members = schedules.flatMap((schedule) => schedule.members);
    return {
      celebrations: schedules.length,
      confirmedMembers: members.filter((member) => member.confirmed).length,
      pendingConfirmations: members.filter((member) => !member.confirmed).length,
      openPositions: schedules.filter(
        (schedule) => schedule.status === 'ATTENTION',
      ).length,
    };
  }

  private localTime(value: string, timezone: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: timezone,
    }).format(new Date(value));
  }

  private usesApi(): boolean {
    return Boolean(this.http) && !environment.useMocks;
  }

  private options() {
    return { withCredentials: true } as const;
  }
}
