import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  beforeEach(() => { TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] }); service = TestBed.inject(DashboardService); });
  it('allows Eury to manage the news feed', async () => {
    const item = await firstValueFrom(service.saveNews({ title: 'Aviso', body: 'Novo comunicado' }));
    expect(item.author).toBe('Eury');
    expect((await firstValueFrom(service.listNews())).some((news) => news.id === item.id)).toBeTrue();
    await firstValueFrom(service.deleteNews(item.id));
    expect((await firstValueFrom(service.listNews())).some((news) => news.id === item.id)).toBeFalse();
  });

  it('provides previous and future recurring occurrences for the monthly calendar', async () => {
    const data = await firstValueFrom(service.getCalendar());
    const now = Date.now();
    expect(data.schedules.some((item) => new Date(item.date).getTime() < now)).toBeTrue();
    expect(data.schedules.some((item) => new Date(item.date).getTime() > now + 1000 * 60 * 60 * 24 * 30)).toBeTrue();
  });
});

describe('DashboardService API integration', () => {
  let service: DashboardService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(DashboardService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });

  it('maps summary, occurrences and news from the dashboard endpoint', async () => {
    const resultPromise = firstValueFrom(service.getCalendar('2026-09'));
    const request = http.expectOne((candidate) =>
      candidate.url.endsWith('/dashboard') &&
      candidate.params.get('month') === '2026-09',
    );
    expect(request.request.withCredentials).toBeTrue();
    request.flush({
      summary: {
        celebrations: 3,
        confirmedMembers: 8,
        pendingConfirmations: 2,
        openPositions: 1,
      },
      occurrences: [
        {
          id: 'occurrence-id',
          title: 'Santa Missa',
          startsAt: '2026-09-06T21:30:00.000Z',
          timezone: 'America/Fortaleza',
          location: 'Igreja Matriz',
          ministry: 'Ministério Santa Cecília',
          ministryId: 'ministry-id',
          status: 'DRAFT',
          memberCount: 4,
          repertoireCount: 6,
        },
      ],
      news: [
        {
          id: 'news-id',
          title: 'Ensaio',
          body: 'Ensaio no sábado.',
          publishedAt: '2026-09-01T12:00:00.000Z',
          author: { name: 'Eury' },
        },
      ],
    });

    const data = await resultPromise;
    expect(data.summary.confirmedMembers).toBe(8);
    expect(data.schedules[0].ministry).toBe('Ministério Santa Cecília');
    expect(data.schedules[0].time).toBe('18:30');
    expect(data.news[0].author).toBe('Eury');
  });
});
