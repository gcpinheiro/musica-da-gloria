import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MinistriesFacade } from '../../data-access/ministries.facade';
import { MinistryWeekday, MINISTRY_WEEKDAYS } from '../../models/ministry.model';

@Component({ selector: 'app-ministry-form', imports: [ReactiveFormsModule, RouterLink], providers: [MinistriesFacade], templateUrl: './ministry-form.html', styleUrl: './ministry-form.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class MinistryForm implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly patchedId = signal<string | null>(null);
  protected readonly facade = inject(MinistriesFacade);
  protected readonly id = this.route.snapshot.paramMap.get('id');
  protected readonly weekdays = MINISTRY_WEEKDAYS;
  protected readonly selectedMembers = signal<readonly string[]>([]);
  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    weekday: new FormControl<MinistryWeekday>('SUNDAY', { nonNullable: true, validators: [Validators.required] }),
    time: new FormControl('19:00', { nonNullable: true, validators: [Validators.required] }),
    celebrationTitle: new FormControl('Santa Missa', { nonNullable: true, validators: [Validators.required] }),
    location: new FormControl('Igreja Matriz', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() {
    effect(() => {
      const ministry = this.facade.selected();
      if (!ministry || this.patchedId() === ministry.id) return;
      this.patchedId.set(ministry.id);
      this.form.patchValue({ name: ministry.name, weekday: ministry.weekday, time: ministry.time, celebrationTitle: ministry.celebrationTitle, location: ministry.location });
      this.selectedMembers.set(ministry.participants.map((person) => person.id));
    });
  }
  ngOnInit(): void { this.facade.loadMemberOptions(); if (this.id) this.facade.loadOne(this.id); }
  protected toggleMember(id: string): void { this.selectedMembers.update((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]); }
  protected submit(): void {
    if (this.form.invalid || !this.selectedMembers().length) { this.form.markAllAsTouched(); return; }
    const participants = this.facade.memberOptions().filter((item) => this.selectedMembers().includes(item.id)).map(({ available: _available, confirmation: _confirmation, ...person }) => person);
    this.facade.save({ ...this.form.getRawValue(), participants }, this.id ?? undefined);
  }
}
