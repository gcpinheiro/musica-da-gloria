import { Ministry } from '../models/ministry.model';
import { buildMinistryOccurrences } from './ministry-occurrences';

describe('buildMinistryOccurrences', () => {
  it('creates one independent occurrence for every configured weekday up to the limit', () => {
    const ministry: Ministry = { id: 'min-test', name: 'Ministério São José', weekday: 'SUNDAY', time: '19:00', celebrationTitle: 'Santa Missa', location: 'Igreja Matriz', active: true, participants: [{ id: 'mem-1', name: 'Rafael', initials: 'RL', role: 'Violão' }] };
    const occurrences = buildMinistryOccurrences(ministry, '2026-10-25', new Date('2026-10-05T12:00:00'));

    expect(occurrences.length).toBe(3);
    expect(occurrences.map((item) => item.date.slice(0, 10))).toEqual(['2026-10-11', '2026-10-18', '2026-10-25']);
    expect(occurrences[0].people[0].confirmation).toBe('PENDING');
  });
});
