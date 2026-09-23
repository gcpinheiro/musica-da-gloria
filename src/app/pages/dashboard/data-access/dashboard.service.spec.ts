import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  beforeEach(() => { TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] }); service = TestBed.inject(DashboardService); });
  it('allows Gabriel to manage the news feed', async () => {
    const item = await firstValueFrom(service.saveNews({ title: 'Aviso', body: 'Novo comunicado' }));
    expect(item.author).toBe('Gabriel');
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
