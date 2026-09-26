import { GeneratedScheduleInput } from '../../schedules/models/schedule.model';
import { Ministry, MINISTRY_WEEKDAYS } from '../models/ministry.model';

export function buildMinistryOccurrences(ministry: Ministry, endDate: string, startDate = new Date()): readonly GeneratedScheduleInput[] {
  const weekday = MINISTRY_WEEKDAYS.find((item) => item.value === ministry.weekday)?.day ?? 0;
  const current = new Date(startDate);
  current.setHours(12, 0, 0, 0);
  const end = new Date(`${endDate}T12:00:00`);
  while (current.getDay() !== weekday) current.setDate(current.getDate() + 1);
  const occurrences: GeneratedScheduleInput[] = [];
  while (current <= end) {
    const dateKey = localDateKey(current);
    occurrences.push({
      id: `occ-${ministry.id}-${dateKey}`,
      sourceMinistryId: ministry.id,
      title: ministry.celebrationTitle,
      date: current.toISOString(),
      time: ministry.time,
      location: ministry.location,
      ministry: ministry.name,
      liturgicalTime: 'Tempo Comum',
      notes: 'Escala gerada a partir da formação habitual. Alterações valem somente para esta data.',
      people: ministry.participants.map((person) => ({ ...person, confirmation: 'PENDING' as const })),
      songs: [],
    });
    current.setDate(current.getDate() + 7);
  }
  return occurrences;
}

function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
