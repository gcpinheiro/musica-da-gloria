import { HttpClient } from '@angular/common/http';
import { Injectable, Optional } from '@angular/core';
import { delay, map, Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { memberPhotoUrl } from '../../../shared/utils/member-photo-url';
import { Profile, ProfileInput } from '../models/profile.model';

interface ApiProfile {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string | null;
  readonly initials: string;
  readonly photoUrl?: string | null;
  readonly hasPhoto?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private mock: Profile = { id: 'mem-001', name: 'Eury', email: 'lider@musicadagloria.org.br', phone: '+5585999999999', initials: 'E' };
  constructor(@Optional() private readonly http: HttpClient | null = null) {}

  get(): Observable<Profile> {
    if (this.usesApi()) return this.http!.get<ApiProfile>(`${environment.apiBaseUrl}/profile`, this.options()).pipe(map((profile) => this.fromApi(profile)));
    return of({ ...this.mock }).pipe(delay(180));
  }

  update(input: ProfileInput): Observable<Profile> {
    const body = { name: input.name.trim(), phone: this.normalizePhone(input.phone) };
    if (this.usesApi()) return this.http!.patch<ApiProfile>(`${environment.apiBaseUrl}/profile`, body, this.options()).pipe(map((profile) => this.fromApi(profile)));
    this.mock = { ...this.mock, ...body, initials: this.initials(body.name) };
    return of({ ...this.mock }).pipe(delay(250));
  }

  uploadPhoto(file: File): Observable<string> {
    const form = new FormData();
    form.append('file', file, file.name);
    if (this.usesApi()) return this.http!.put<{ photoUrl: string }>(`${environment.apiBaseUrl}/profile/photo`, form, this.options()).pipe(map(({ photoUrl }) => photoUrl));
    return new Observable<string>((subscriber) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => { subscriber.next(String(reader.result)); subscriber.complete(); }, { once: true });
      reader.addEventListener('error', () => subscriber.error(new Error('PHOTO_READ_FAILED')), { once: true });
      reader.readAsDataURL(file);
    });
  }

  removePhoto(): Observable<void> {
    if (this.usesApi()) return this.http!.delete<void>(`${environment.apiBaseUrl}/profile/photo`, this.options());
    this.mock = { ...this.mock, photoUrl: undefined };
    return of(undefined).pipe(delay(180));
  }

  private fromApi(profile: ApiProfile): Profile {
    return { ...profile, phone: profile.phone ?? '', photoUrl: memberPhotoUrl(profile.id, profile.hasPhoto, profile.photoUrl) };
  }
  private usesApi(): boolean { return Boolean(this.http) && !environment.useMocks; }
  private options() { return { withCredentials: true } as const; }
  private normalizePhone(value: string): string { let digits = value.replace(/\D/g, ''); if (digits.length === 10 || digits.length === 11) digits = `55${digits}`; return `+${digits}`; }
  private initials(name: string): string { return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join(''); }
}
