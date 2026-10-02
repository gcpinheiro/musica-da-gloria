import { environment } from '../../../environments/environment';

export function memberPhotoUrl(memberId: string, hasPhoto?: boolean, inlinePhoto?: string | null): string | undefined {
  if (inlinePhoto) return inlinePhoto;
  return hasPhoto ? `${environment.apiBaseUrl}/members/${encodeURIComponent(memberId)}/photo` : undefined;
}
