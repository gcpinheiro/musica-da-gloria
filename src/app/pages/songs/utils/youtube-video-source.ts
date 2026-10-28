const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'youtu.be']);

export interface YoutubeVideoSource {
  readonly videoId: string;
  readonly watchUrl: string;
  readonly embedUrl: string;
}

export function youtubeVideoSource(value: string | null | undefined): YoutubeVideoSource | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (
      url.protocol !== 'https:' ||
      url.port ||
      url.username ||
      url.password ||
      !YOUTUBE_HOSTS.has(host)
    ) return null;

    const videoId = host === 'youtu.be'
      ? url.pathname.split('/').filter(Boolean)[0]
      : url.pathname === '/watch'
        ? url.searchParams.get('v')
        : null;
    if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) return null;

    return {
      videoId,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`,
    };
  } catch {
    return null;
  }
}
