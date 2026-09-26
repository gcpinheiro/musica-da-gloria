import { SCHEDULE_MEMBER_OPTIONS } from '../../schedules/data-access/schedules.mock';
import { Ministry } from '../models/ministry.model';

export const MINISTRIES_MOCK: readonly Ministry[] = [
  { id: 'min-santa-cecilia', name: 'Ministério Santa Cecília', participants: [SCHEDULE_MEMBER_OPTIONS[0], SCHEDULE_MEMBER_OPTIONS[1], SCHEDULE_MEMBER_OPTIONS[2]], weekday: 'SUNDAY', time: '19:00', celebrationTitle: 'Santa Missa Dominical', location: 'Igreja Matriz', active: true },
  { id: 'min-gregorio', name: 'Ministério São Gregório Magno', participants: [SCHEDULE_MEMBER_OPTIONS[3], SCHEDULE_MEMBER_OPTIONS[4]], weekday: 'THURSDAY', time: '19:30', celebrationTitle: 'Adoração ao Santíssimo', location: 'Capela do Santíssimo', active: true },
  { id: 'min-gloria', name: 'Ministério Nossa Senhora da Glória', participants: [SCHEDULE_MEMBER_OPTIONS[5], SCHEDULE_MEMBER_OPTIONS[2]], weekday: 'SUNDAY', time: '09:00', celebrationTitle: 'Santa Missa Dominical', location: 'Igreja Matriz', active: true },
];
