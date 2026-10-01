export type SongContentMode = 'INTERNAL' | 'EXTERNAL_EMBED';

export interface Song {
  readonly id: string;
  readonly title: string;
  readonly author: string;
  readonly defaultKey: string;
  readonly liturgicalMoments: readonly string[];
  readonly lyrics: string;
  readonly chords: string;
  readonly contentMode?: SongContentMode;
  readonly externalUrl?: string | null;
  readonly active: boolean;
}

export type SongInput = Omit<Song, 'id' | 'active'>;
