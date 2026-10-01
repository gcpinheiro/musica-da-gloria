const ALLOWED_EXTERNAL_SONG_HOSTS = new Map([
  ['cifrascatolicas.com.br', 'Cifras Católicas'],
  ['www.cifraclub.com.br', 'Cifra Club'],
  ['cifraclub.com.br', 'Cifra Club'],
]);

export interface ExternalSongSource {
  readonly url: string;
  readonly name: string;
}

export function externalSongSource(value: string | null | undefined): ExternalSongSource | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const name = ALLOWED_EXTERNAL_SONG_HOSTS.get(url.hostname.toLowerCase());
    if (url.protocol !== 'https:' || url.port || url.username || url.password || !name) return null;
    return { url: url.toString(), name };
  } catch {
    return null;
  }
}
