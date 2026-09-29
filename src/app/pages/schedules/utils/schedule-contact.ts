import { Schedule } from '../models/schedule.model';

export function canMemberViewScheduleContacts(
  schedule: Schedule,
  memberId: string | undefined,
): boolean {
  return !!memberId && schedule.people.some((person) => person.id === memberId);
}
