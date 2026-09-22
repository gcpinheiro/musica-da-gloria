import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { SchedulesService } from './schedules.service';

describe('SchedulesService', () => {
  let service: SchedulesService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(SchedulesService);
  });

  it('loads a schedule by id', async () => {
    const schedule = await firstValueFrom(service.getById('occ-001'));
    expect(schedule.title).toBe('Santa Missa');
  });

  it('creates a draft schedule', async () => {
    const schedule = await firstValueFrom(service.create({
      title: 'Celebração de teste',
      date: '2026-10-10',
      time: '18:00',
      location: 'Igreja Matriz',
      ministry: 'Magnificat',
      liturgicalTime: 'Tempo Comum',
      notes: '',
    }));
    expect(schedule.status).toBe('DRAFT');
  });
});
