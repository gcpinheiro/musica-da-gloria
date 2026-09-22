export interface Song {
  readonly id: string;
  readonly title: string;
  readonly author: string;
  readonly defaultKey: string;
  readonly liturgicalMoments: readonly string[];
  readonly lyrics: string;
  readonly chords: string;
  readonly active: boolean;
}

export type SongInput = Omit<Song, 'id' | 'active'>;
