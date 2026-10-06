export type ScheduleStatus = 'DRAFT' | 'PUBLISHED' | 'ATTENTION' | 'CANCELLED';
export type ConfirmationStatus = 'CONFIRMED' | 'PENDING' | 'DECLINED';

export interface ScheduledPerson {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
  readonly photoUrl?: string;
  readonly whatsapp: string;
  readonly role: string;
  readonly confirmation: ConfirmationStatus;
}

export interface ScheduledSong {
  readonly id: string;
  readonly songId: string;
  readonly title: string;
  readonly key: string;
  readonly liturgicalMoment: string;
  readonly lyricsSnapshot?: string;
  readonly formattedLyrics?: LyricsDocument | null;
}

export interface ScheduleMemberOption extends ScheduledPerson { readonly available: boolean; }
export interface ScheduleMemberPage {
  readonly items: readonly ScheduleMemberOption[];
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
}
export type ScheduleSongOption = Omit<ScheduledSong, 'id'>;
export interface ScheduleSongPage {
  readonly items: readonly ScheduleSongOption[];
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
}

export interface Schedule {
  readonly id: string;
  readonly title: string;
  readonly date: string;
  readonly time: string;
  readonly location: string;
  readonly ministry: string;
  readonly ministryId?: string;
  readonly timezone?: string;
  readonly version?: number;
  readonly canEdit?: boolean;
  readonly status: ScheduleStatus;
  readonly liturgicalTime: string;
  readonly people: readonly ScheduledPerson[];
  readonly songs: readonly ScheduledSong[];
  readonly notes: string;
  readonly myConfirmation?: ConfirmationStatus;
  readonly memberCount?: number;
  readonly repertoireCount?: number;
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

export interface ScheduleBatchSlotInput {
  readonly date: string;
  readonly time: string;
  readonly title: string;
  readonly location: string;
  readonly liturgicalTime: string;
  readonly notes: string;
  readonly people: readonly ScheduledPerson[];
  readonly songs: readonly ScheduledSong[];
}

export interface ScheduleBatchInput {
  readonly ministryId: string;
  readonly slots: readonly ScheduleBatchSlotInput[];
}

export interface ScheduleBatchResult {
  readonly batchId: string;
  readonly createdCount: number;
  readonly replayed: boolean;
  readonly occurrenceIds: readonly string[];
}

export interface GeneratedScheduleInput extends ScheduleInput {
  readonly id: string;
  readonly sourceMinistryId: string;
}
import { LyricsDocument } from '../../../shared/models/lyrics-document.model';
