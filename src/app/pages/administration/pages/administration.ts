import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdministrationFacade } from '../data-access/administration.facade';

@Component({ selector: 'app-administration', imports: [ReactiveFormsModule], providers: [AdministrationFacade], templateUrl: './administration.html', styleUrl: './administration.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class Administration implements OnInit {
  protected readonly facade = inject(AdministrationFacade);
  protected readonly parishForm = new FormGroup({ name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }), slug: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)] }), city: new FormControl('', { nonNullable: true, validators: [Validators.required] }), state: new FormControl('CE', { nonNullable: true, validators: [Validators.required, Validators.minLength(2), Validators.maxLength(2)] }), timezone: new FormControl('America/Fortaleza', { nonNullable: true, validators: [Validators.required] }) });
  protected readonly leaderForm = new FormGroup({ name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }), email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }), parishId: new FormControl('', { nonNullable: true, validators: [Validators.required] }) });
  ngOnInit(): void { this.facade.load(); }
  protected createParish(): void { if (this.parishForm.invalid) { this.parishForm.markAllAsTouched(); return; } this.facade.createParish(this.parishForm.getRawValue()); }
  protected inviteLeader(): void { if (this.leaderForm.invalid) { this.leaderForm.markAllAsTouched(); return; } this.facade.inviteLeader(this.leaderForm.getRawValue()); }
}
