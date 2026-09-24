import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthFacade } from '../../../core/auth/auth.facade';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  protected readonly authFacade = inject(AuthFacade);
  protected readonly form = new FormGroup({
    email: new FormControl('membro@musicadagloria.org.br', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('gloria2026', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  protected selectDemo(profile: 'LEADER' | 'MEMBER'): void {
    this.form.setValue({
      email: profile === 'LEADER' ? 'lider@musicadagloria.org.br' : 'membro@musicadagloria.org.br',
      password: 'gloria2026',
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authFacade.login(this.form.getRawValue());
  }
}
