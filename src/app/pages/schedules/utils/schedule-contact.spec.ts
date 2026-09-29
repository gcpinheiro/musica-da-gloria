import { Schedule } from '../models/schedule.model';
import { canMemberViewScheduleContacts } from './schedule-contact';

describe('canMemberViewScheduleContacts', () => {
  const schedule: Schedule = {
    id: 'occ-1',
    title: 'Santa Missa',
    date: '2026-10-04T12:00:00.000Z',
    time: '19:00',
    location: 'Igreja Matriz',
    ministry: 'Ministério Santa Cecília',
    status: 'PUBLISHED',
    liturgicalTime: 'Tempo Comum',
    notes: '',
    songs: [],
    people: [{ id: 'mem-1', name: 'Membro', initials: 'MM', whatsapp: '+5585999999999', role: 'Voz', confirmation: 'CONFIRMED' }],
  };

  it('allows an assigned member regardless of the occurrence date', () => {
    expect(canMemberViewScheduleContacts(schedule, 'mem-1')).toBeTrue();
  });

  it('does not expose contacts to a member outside that occurrence', () => {
    expect(canMemberViewScheduleContacts(schedule, 'mem-2')).toBeFalse();
  });
});
