import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Avatar } from '../../shared/components/avatar/avatar';
import { ProfileFacade } from './data-access/profile.facade';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, Avatar],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage implements OnInit {
  protected readonly facade = inject(ProfileFacade);
  protected readonly photoError = signal<string | null>(null);
  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^(?:\+?55)?\s*\(?\d{2}\)?\s*\d{4,5}[-\s]?\d{4}$/)] }),
  });
  private readonly populate = effect(() => {
    const profile = this.facade.profile();
    if (profile) this.form.setValue({ name: profile.name, phone: profile.phone });
  });

  ngOnInit(): void { this.facade.load(); }

  protected submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.facade.save(this.form.getRawValue());
  }

  protected selectPhoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.photoError.set(null);
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      this.photoError.set('Escolha uma imagem JPG, PNG ou WebP.');
    } else if (file.size > 5 * 1024 * 1024) {
      this.photoError.set('A foto deve ter no máximo 5 MB.');
    } else {
      this.facade.uploadPhoto(file);
    }
    input.value = '';
  }
}
