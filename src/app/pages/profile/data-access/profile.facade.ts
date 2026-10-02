import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { AuthFacade } from '../../../core/auth/auth.facade';
import { Profile, ProfileInput } from '../models/profile.model';
import { ProfileService } from './profile.service';

@Injectable({ providedIn: 'root' })
export class ProfileFacade {
  private readonly service = inject(ProfileService);
  private readonly auth = inject(AuthFacade);
  private readonly profileState = signal<Profile | null>(null);
  private readonly loadingState = signal(false);
  private readonly savingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly messageState = signal<string | null>(null);
  readonly profile = this.profileState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly saving = this.savingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly message = this.messageState.asReadonly();

  load(): void {
    this.loadingState.set(true); this.errorState.set(null);
    this.service.get().pipe(finalize(() => this.loadingState.set(false))).subscribe({
      next: (profile) => this.profileState.set(profile),
      error: () => this.errorState.set('Não foi possível carregar seu perfil.'),
    });
  }
  save(input: ProfileInput): void {
    this.savingState.set(true); this.errorState.set(null); this.messageState.set(null);
    this.service.update(input).pipe(finalize(() => this.savingState.set(false))).subscribe({
      next: (profile) => { this.profileState.set(profile); this.auth.updateProfileIdentity(profile.name, profile.photoUrl); this.messageState.set('Perfil atualizado com sucesso.'); },
      error: () => this.errorState.set('Não foi possível atualizar seu perfil.'),
    });
  }
  uploadPhoto(file: File): void {
    this.savingState.set(true); this.errorState.set(null); this.messageState.set(null);
    this.service.uploadPhoto(file).pipe(finalize(() => this.savingState.set(false))).subscribe({
      next: (photoUrl) => { const current = this.profileState(); if (!current) return; const profile = { ...current, photoUrl }; this.profileState.set(profile); this.auth.updateProfileIdentity(profile.name, photoUrl); this.messageState.set('Foto atualizada com sucesso.'); },
      error: () => this.errorState.set('Não foi possível atualizar a foto.'),
    });
  }
  removePhoto(): void {
    this.savingState.set(true); this.errorState.set(null); this.messageState.set(null);
    this.service.removePhoto().pipe(finalize(() => this.savingState.set(false))).subscribe({
      next: () => { const current = this.profileState(); if (!current) return; const profile = { ...current, photoUrl: undefined }; this.profileState.set(profile); this.auth.updateProfileIdentity(profile.name); this.messageState.set('Foto removida.'); },
      error: () => this.errorState.set('Não foi possível remover a foto.'),
    });
  }
}
