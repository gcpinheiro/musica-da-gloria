import { Schedule, ScheduleStatus } from '../models/schedule.model';

export type ScheduleAssignmentFilter = 'MINE' | 'ALL';

export function filterSchedules(
  schedules: readonly Schedule[],
  status: ScheduleStatus | 'ALL',
  assignment: ScheduleAssignmentFilter,
  memberId: string | null,
): readonly Schedule[] {
  return schedules.filter((schedule) => {
    const matchesStatus = status === 'ALL' || schedule.status === status;
    const matchesAssignment = assignment === 'ALL' || schedule.myConfirmation !== undefined || schedule.people.some((person) => person.id === memberId);
    return matchesStatus && matchesAssignment;
  });
}
