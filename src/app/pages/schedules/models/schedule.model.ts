export type ScheduleStatus = 'DRAFT' | 'PUBLISHED' | 'ATTENTION';

export interface ScheduledPerson {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
  readonly role: string;
  readonly confirmation: 'CONFIRMED' | 'PENDING' | 'DECLINED';
}

export interface ScheduledSong {
  readonly id: string;
  readonly songId: string;
  readonly title: string;
  readonly key: string;
  readonly liturgicalMoment: string;
}

export interface ScheduleMemberOption extends ScheduledPerson { readonly available: boolean; }
export type ScheduleSongOption = Omit<ScheduledSong, 'id'>;

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
  readonly songs: readonly ScheduledSong[];
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
  readonly people: readonly ScheduledPerson[];
  readonly songs: readonly ScheduledSong[];
}
