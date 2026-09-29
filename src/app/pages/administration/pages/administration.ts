import { DatePipe, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdministrationFacade } from '../data-access/administration.facade';

@Component({ selector: 'app-administration', imports: [ReactiveFormsModule, DatePipe], providers: [AdministrationFacade], templateUrl: './administration.html', styleUrl: './administration.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class Administration implements OnInit {
  protected readonly facade = inject(AdministrationFacade);
  private readonly platformId = inject(PLATFORM_ID);
  protected readonly parishForm = new FormGroup({ name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }), slug: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)] }), city: new FormControl('', { nonNullable: true, validators: [Validators.required] }), state: new FormControl('CE', { nonNullable: true, validators: [Validators.required, Validators.minLength(2), Validators.maxLength(2)] }), timezone: new FormControl('America/Fortaleza', { nonNullable: true, validators: [Validators.required] }) });
  protected readonly leaderForm = new FormGroup({ name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }), email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }), parishId: new FormControl('', { nonNullable: true, validators: [Validators.required] }) });
  ngOnInit(): void { this.facade.load(); }
  protected createParish(): void { if (this.parishForm.invalid) { this.parishForm.markAllAsTouched(); return; } this.facade.createParish(this.parishForm.getRawValue()); }
  protected inviteLeader(): void { if (this.leaderForm.invalid) { this.leaderForm.markAllAsTouched(); return; } this.facade.inviteLeader(this.leaderForm.getRawValue()); }
  protected async copyInvitationLink(): Promise<void> {
    const link = this.facade.invitationLink();
    if (!link || !isPlatformBrowser(this.platformId) || !navigator.clipboard) { this.facade.copyFailed(); return; }
    try { await navigator.clipboard.writeText(link); this.facade.copied(); } catch { this.facade.copyFailed(); }
  }
}
