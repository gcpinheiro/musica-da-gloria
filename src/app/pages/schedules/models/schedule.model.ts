export type ScheduleStatus = 'DRAFT' | 'PUBLISHED' | 'ATTENTION';

export interface ScheduledPerson {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
  readonly role: string;
  readonly confirmation: 'CONFIRMED' | 'PENDING' | 'DECLINED';
}

export interface Schedule {
  readonly id: string;
  readonly title: string;
  readonly date: string;
  readonly time: string;
  readonly location: string;
  readonly ministry: string;
  readonly status: ScheduleStatus;
  readonly liturgicalTime: string;
  readonly people: readonly ScheduledPerson[];
  readonly songs: readonly string[];
  readonly notes: string;
}

export interface ScheduleInput {
  readonly title: string;
  readonly date: string;
  readonly time: string;
  readonly location: string;
  readonly ministry: string;
  readonly liturgicalTime: string;
  readonly notes: string;
}
