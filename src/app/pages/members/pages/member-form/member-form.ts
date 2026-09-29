import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MembersFacade } from '../../data-access/members.facade';
import { TALENT_OPTIONS, WEEKDAY_OPTIONS } from '../../data-access/members.mock';
import { Weekday } from '../../models/member.model';

function timeRangeValidator(control: AbstractControl): ValidationErrors | null {
  const startTime = control.get('startTime')?.value as string | undefined;
  const endTime = control.get('endTime')?.value as string | undefined;
  return startTime && endTime && startTime >= endTime ? { invalidTimeRange: true } : null;
}

@Component({
  selector: 'app-member-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './member-form.html',
  styleUrl: './member-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberForm implements OnInit {
  private readonly route = inject(ActivatedRoute);
  protected readonly facade = inject(MembersFacade);
  protected readonly talents = TALENT_OPTIONS;
  protected readonly weekdays = WEEKDAY_OPTIONS;
  protected readonly memberId = this.route.snapshot.paramMap.get('id');
  protected readonly isEditing = this.memberId !== null;
  protected readonly photoError = signal<string | null>(null);
  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    phone: new FormControl('', { nonNullable: true }),
    photoUrl: new FormControl('', { nonNullable: true }),
    talents: new FormControl<string[]>([], { nonNullable: true, validators: [Validators.required] }),
    ministries: new FormControl<string[]>([], { nonNullable: true }),
    availability: new FormGroup({
      weekday: new FormControl<Weekday>('SUNDAY', { nonNullable: true, validators: [Validators.required] }),
      startTime: new FormControl('17:00', { nonNullable: true, validators: [Validators.required] }),
      endTime: new FormControl('21:00', { nonNullable: true, validators: [Validators.required] }),
    }, { validators: [timeRangeValidator] }),
    notes: new FormControl('', { nonNullable: true }),
  });
  private readonly syncMember = effect(() => {
    const member = this.facade.selectedMember();
    if (!member || member.id !== this.memberId) return;
    this.form.patchValue({
      name: member.name,
      email: member.email,
      phone: member.phone,
      photoUrl: member.photoUrl ?? '',
      talents: [...member.talents],
      ministries: [...(member.ministryIds ?? [])],
      availability: member.availability,
      notes: member.notes,
    });
  });

  ngOnInit(): void {
    this.facade.loadMinistryOptions();
    if (!this.memberId) return;
    this.facade.loadOne(this.memberId);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.facade.save(this.form.getRawValue(), this.memberId ?? undefined);
  }

  protected onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.photoError.set(null);
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      this.photoError.set('Escolha uma imagem JPG, PNG ou WebP.');
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.photoError.set('A foto deve ter no máximo 5 MB.');
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', () => this.form.controls.photoUrl.setValue(String(reader.result ?? '')), { once: true });
    reader.addEventListener('error', () => this.photoError.set('Não foi possível ler a foto selecionada.'), { once: true });
    reader.readAsDataURL(file);
  }
}
