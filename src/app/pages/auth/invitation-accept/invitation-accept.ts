import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthFacade } from '../../../core/auth/auth.facade';

function normalizeWhatsapp(value: string): string | undefined {
  if (!value.trim()) return undefined;
  let digits = value.replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
  return /^\d{8,15}$/.test(digits) ? `+${digits}` : undefined;
}

function whatsappValidator(control: AbstractControl<string>): ValidationErrors | null {
  return !control.value.trim() || normalizeWhatsapp(control.value) ? null : { whatsappFormat: true };
}

@Component({ selector: 'app-invitation-accept', imports: [ReactiveFormsModule], templateUrl: './invitation-accept.html', styleUrl: './invitation-accept.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class InvitationAccept {
  private readonly route = inject(ActivatedRoute);
  protected readonly authFacade = inject(AuthFacade);
  protected readonly form = new FormGroup({
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
    passwordConfirmation: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
    whatsapp: new FormControl('', { nonNullable: true, validators: [whatsappValidator] }),
  });
  protected submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    if (value.password !== value.passwordConfirmation) { this.form.controls.passwordConfirmation.setErrors({ mismatch: true }); return; }
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) { this.authFacade.invalidInvitation(); return; }
    this.authFacade.acceptInvitation(token, { ...value, whatsapp: normalizeWhatsapp(value.whatsapp) });
  }
}
