import { ChangeDetectionStrategy, Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SchedulesFacade } from '../../data-access/schedules.facade';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { ScheduleSongOption } from '../../models/schedule.model';

@Component({ selector: 'app-schedule-form', imports: [ReactiveFormsModule, RouterLink, Avatar], templateUrl: './schedule-form.html', styleUrl: './schedule-form.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class ScheduleForm implements OnInit, OnDestroy {
  private songSearchTimer?: ReturnType<typeof setTimeout>;
  private readonly route = inject(ActivatedRoute);
  private editInitialized = false;
  protected readonly facade = inject(SchedulesFacade);
  protected readonly scheduleId = this.route.snapshot.paramMap.get('id');
  protected readonly editMode = Boolean(this.scheduleId);
  protected readonly selectedMembers = signal<readonly string[]>([]);
  protected readonly selectedSongItems = signal<readonly ScheduleSongOption[]>([]);
  protected readonly selectedSongs = computed(() => this.selectedSongItems().map((item) => item.songId));
  protected readonly form = new FormGroup({
    title: new FormControl('Santa Missa', { nonNullable: true, validators: [Validators.required] }), date: new FormControl('', { nonNullable: true, validators: [Validators.required] }), time: new FormControl('19:00', { nonNullable: true, validators: [Validators.required] }), location: new FormControl('Igreja Matriz', { nonNullable: true, validators: [Validators.required] }), ministry: new FormControl('', { nonNullable: true, validators: [Validators.required] }), liturgicalTime: new FormControl('Tempo Comum', { nonNullable: true, validators: [Validators.required] }), notes: new FormControl('', { nonNullable: true }),
  });
  constructor() {
    effect(() => {
      const schedule = this.facade.selected();
      if (!this.editMode || !schedule || this.editInitialized) return;
      this.editInitialized = true;
      const localDate = new Intl.DateTimeFormat('en-CA', { timeZone: schedule.timezone ?? 'America/Fortaleza', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(schedule.date));
      this.form.setValue({ title: schedule.title, date: localDate, time: schedule.time, location: schedule.location, ministry: schedule.ministry, liturgicalTime: schedule.liturgicalTime, notes: schedule.notes });
      this.selectedMembers.set(schedule.people.map((person) => person.id));
      this.selectedSongItems.set(schedule.songs.map(({ id: _id, ...song }) => song));
    });
  }
  ngOnInit(): void { if (this.scheduleId) this.facade.loadOne(this.scheduleId); else this.facade.loadOptions(); }
  ngOnDestroy(): void { clearTimeout(this.songSearchTimer); }
  protected toggleMember(id: string): void { this.selectedMembers.update((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]); }
  protected toggleSong(song: ScheduleSongOption): void { this.selectedSongItems.update((items) => items.some((item) => item.songId === song.songId) ? items.filter((item) => item.songId !== song.songId) : [...items, song]); }
  protected searchSongs(event: Event): void { const query = (event.target as HTMLInputElement).value; clearTimeout(this.songSearchTimer); this.songSearchTimer = setTimeout(() => this.facade.loadSongOptions(query, 1), 250); }
  protected changeSongPage(page: number): void { if (page >= 1 && page <= this.facade.songPageCount()) this.facade.loadSongOptions(this.facade.songQuery(), page); }
  protected moveSelectedSong(index: number, direction: -1 | 1): void {
    const target = index + direction;
    if (target < 0 || target >= this.selectedSongItems().length) return;
    this.selectedSongItems.update((items) => { const reordered = [...items]; [reordered[index], reordered[target]] = [reordered[target], reordered[index]]; return reordered; });
  }
  protected applyMinistryPreset(event: Event): void {
    const name = (event.target as HTMLSelectElement).value;
    const ministry = this.facade.ministryOptions().find((item) => item.name === name);
    if (!ministry) return;
    this.form.patchValue({ time: ministry.time, location: ministry.location, title: ministry.celebrationTitle });
    this.selectedMembers.set(ministry.participants.map((person) => person.id));
  }
  protected submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const people = this.facade.memberOptions().filter((item) => this.selectedMembers().includes(item.id));
    const songs = this.selectedSongItems().map((item, index) => ({ ...item, id: `new-${index}-${item.songId}` }));
    const input = { ...this.form.getRawValue(), people, songs };
    if (this.editMode) this.facade.updateOccurrence(input); else this.facade.create(input);
  }
}
