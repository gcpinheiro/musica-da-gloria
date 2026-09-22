import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SchedulesFacade } from '../../data-access/schedules.facade';

@Component({ selector: 'app-schedule-form', imports: [ReactiveFormsModule, RouterLink], templateUrl: './schedule-form.html', styleUrl: './schedule-form.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class ScheduleForm {
  protected readonly facade = inject(SchedulesFacade);
  protected readonly form = new FormGroup({
    title: new FormControl('Santa Missa', { nonNullable: true, validators: [Validators.required] }),
    date: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    time: new FormControl('19:00', { nonNullable: true, validators: [Validators.required] }),
    location: new FormControl('Igreja Matriz', { nonNullable: true, validators: [Validators.required] }),
    ministry: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    liturgicalTime: new FormControl('Tempo Comum', { nonNullable: true, validators: [Validators.required] }),
    notes: new FormControl('', { nonNullable: true }),
  });
  protected submit(): void { if (this.form.invalid) { this.form.markAllAsTouched(); return; } this.facade.create(this.form.getRawValue()); }
}
