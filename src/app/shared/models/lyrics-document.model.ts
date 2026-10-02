export type LyricVoice = 'WOMEN' | 'MEN' | 'ALL';

export interface LyricSegment {
  readonly text: string;
  readonly bold?: true;
  readonly italic?: true;
  readonly voice?: LyricVoice;
}

export interface LyricsDocument {
  readonly version: 1;
  readonly segments: readonly LyricSegment[];
}

export function plainLyricsDocument(text: string): LyricsDocument {
  return { version: 1, segments: [{ text }] };
}
