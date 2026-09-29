import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthFacade } from '../../../core/auth/auth.facade';

@Component({ selector: 'app-invitation-accept', imports: [ReactiveFormsModule], templateUrl: './invitation-accept.html', styleUrl: './invitation-accept.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class InvitationAccept {
  private readonly route = inject(ActivatedRoute);
  protected readonly authFacade = inject(AuthFacade);
  protected readonly form = new FormGroup({
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
    passwordConfirmation: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
    whatsapp: new FormControl('', { nonNullable: true, validators: [Validators.pattern(/^\+[1-9]\d{7,14}$/)] }),
  });
  protected submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    if (value.password !== value.passwordConfirmation) { this.form.controls.passwordConfirmation.setErrors({ mismatch: true }); return; }
    this.authFacade.acceptInvitation(this.route.snapshot.paramMap.get('token') ?? '', { ...value, whatsapp: value.whatsapp || undefined });
  }
}
