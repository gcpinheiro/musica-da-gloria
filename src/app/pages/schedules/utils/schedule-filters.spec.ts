import { Schedule } from '../models/schedule.model';
import { filterSchedules } from './schedule-filters';

describe('filterSchedules', () => {
  const schedule = (id: string, memberId: string, status: Schedule['status']): Schedule => ({
    id, status, title: 'Santa Missa', date: '2026-10-04', time: '19:00', location: 'Igreja Matriz', ministry: 'Ministério Santa Cecília', liturgicalTime: 'Tempo Comum', notes: '', songs: [],
    people: [{ id: memberId, name: 'Membro', initials: 'MM', role: 'Voz', confirmation: 'CONFIRMED' }],
  });

  it('shows only occurrences assigned to the authenticated member', () => {
    const schedules = [schedule('one', 'mem-002', 'PUBLISHED'), schedule('two', 'mem-004', 'PUBLISHED')];
    expect(filterSchedules(schedules, 'ALL', 'MINE', 'mem-002').map((item) => item.id)).toEqual(['one']);
  });

  it('combines assignment and status filters', () => {
    const schedules = [schedule('one', 'mem-002', 'PUBLISHED'), schedule('two', 'mem-002', 'DRAFT')];
    expect(filterSchedules(schedules, 'DRAFT', 'MINE', 'mem-002').map((item) => item.id)).toEqual(['two']);
  });
});
