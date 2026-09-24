const CHROMATIC_NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'] as const;
const SHARP_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

const NOTE_INDEX: Readonly<Record<string, number>> = {
  C: 0,
  'B#': 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  'E#': 5,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
  Cb: 11,
};

const CHORD_PATTERN = /^([A-G](?:#|b)?)([^/\s]*)(?:\/([A-G](?:#|b)?))?$/;

export function transposeKey(key: string, semitones: number): string {
  const match = key.match(/^([A-G](?:#|b)?)(.*)$/);
  if (!match) return key;
  return `${transposeNote(match[1], semitones)}${match[2]}`;
}

export function transposeChordLine(line: string, semitones: number): string {
  if (semitones === 0) return line;
  return line
    .split(/(\s+)/)
    .map((part) => transposeChord(part, semitones))
    .join('');
}

export function isChordLine(line: string): boolean {
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  return tokens.length > 0 && tokens.every((token) => CHORD_PATTERN.test(token));
}

function transposeChord(chord: string, semitones: number): string {
  const match = chord.match(CHORD_PATTERN);
  if (!match) return chord;

  const [, root, quality, bass] = match;
  const transposedBass = bass ? `/${transposeNote(bass, semitones)}` : '';
  return `${transposeNote(root, semitones)}${quality}${transposedBass}`;
}

function transposeNote(note: string, semitones: number): string {
  const index = NOTE_INDEX[note];
  if (index === undefined) return note;
  const transposedIndex = (index + semitones + CHROMATIC_NOTES.length * 2) % CHROMATIC_NOTES.length;
  const noteNames = note.includes('#') ? SHARP_NOTES : note.includes('b') ? FLAT_NOTES : CHROMATIC_NOTES;
  return noteNames[transposedIndex];
}
