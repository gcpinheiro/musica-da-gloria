import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SchedulesFacade } from '../../data-access/schedules.facade';

@Component({ selector: 'app-schedule-form', imports: [ReactiveFormsModule, RouterLink], templateUrl: './schedule-form.html', styleUrl: './schedule-form.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class ScheduleForm implements OnInit {
  protected readonly facade = inject(SchedulesFacade);
  protected readonly selectedMembers = signal<readonly string[]>([]);
  protected readonly selectedSongs = signal<readonly string[]>([]);
  protected readonly form = new FormGroup({
    title: new FormControl('Santa Missa', { nonNullable: true, validators: [Validators.required] }), date: new FormControl('', { nonNullable: true, validators: [Validators.required] }), time: new FormControl('19:00', { nonNullable: true, validators: [Validators.required] }), location: new FormControl('Igreja Matriz', { nonNullable: true, validators: [Validators.required] }), ministry: new FormControl('', { nonNullable: true, validators: [Validators.required] }), liturgicalTime: new FormControl('Tempo Comum', { nonNullable: true, validators: [Validators.required] }), notes: new FormControl('', { nonNullable: true }),
  });
  ngOnInit(): void { this.facade.loadOptions(); }
  protected toggleMember(id: string): void { this.selectedMembers.update((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]); }
  protected toggleSong(id: string): void { this.selectedSongs.update((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]); }
  protected submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const people = this.facade.memberOptions().filter((item) => this.selectedMembers().includes(item.id));
    const songs = this.facade.songOptions().filter((item) => this.selectedSongs().includes(item.songId)).map((item, index) => ({ ...item, id: `new-${index}-${item.songId}` }));
    this.facade.create({ ...this.form.getRawValue(), people, songs });
  }
}
