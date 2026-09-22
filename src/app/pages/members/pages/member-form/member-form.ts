import { ChangeDetectionStrategy, Component, effect, inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MembersFacade } from '../../data-access/members.facade';
import { MINISTRY_OPTIONS, TALENT_OPTIONS, WEEKDAY_OPTIONS } from '../../data-access/members.mock';
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
  protected readonly ministries = MINISTRY_OPTIONS;
  protected readonly weekdays = WEEKDAY_OPTIONS;
  protected readonly memberId = this.route.snapshot.paramMap.get('id');
  protected readonly isEditing = this.memberId !== null;
  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
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
      talents: [...member.talents],
      ministries: [...member.ministries],
      availability: member.availability,
      notes: member.notes,
    });
  });

  ngOnInit(): void {
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
}
