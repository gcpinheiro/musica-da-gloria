import { provideZonelessChangeDetection } from '@angular/core';
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
});
