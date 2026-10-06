import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SchedulesFacade } from '../../data-access/schedules.facade';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import {
  ScheduledPerson,
  ScheduleMemberOption,
  ScheduleSongOption,
} from '../../models/schedule.model';

@Component({
  selector: 'app-schedule-form',
  imports: [ReactiveFormsModule, RouterLink, Avatar],
  templateUrl: './schedule-form.html',
  styleUrl: './schedule-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleForm implements OnInit, OnDestroy {
  private songSearchTimer?: ReturnType<typeof setTimeout>;
  private memberSearchTimer?: ReturnType<typeof setTimeout>;
  private slotSequence = 0;
  private lastSubmissionPayload = '';
  private lastIdempotencyKey = '';
  private readonly route = inject(ActivatedRoute);
  private editInitialized = false;

  protected readonly facade = inject(SchedulesFacade);
  protected readonly scheduleId = this.route.snapshot.paramMap.get('id');
  protected readonly editMode = Boolean(this.scheduleId);
  protected readonly selectedSongItems = signal<readonly ScheduleSongOption[]>([]);
  protected readonly selectedSongs = computed(() => this.selectedSongItems().map((item) => item.songId));
  protected readonly slotMembers = signal<ReadonlyMap<string, readonly ScheduledPerson[]>>(new Map());
  protected readonly slotError = signal<string | null>(null);
  protected readonly selectedMinistryId = signal('');
  protected readonly slots = new FormArray([this.createSlot()]);
  protected readonly activeSlotKey = signal(this.slots.controls[0].controls.key.value);
  protected readonly selectedMembers = computed(
    () => this.slotMembers().get(this.activeSlotKey()) ?? [],
  );
  protected readonly selectedMemberIds = computed(
    () => new Set(this.selectedMembers().map((member) => member.id)),
  );
  protected readonly selectedMinistry = computed(() => {
    const ministryId = this.selectedMinistryId();
    return this.facade.ministryOptions().find((ministry) => ministry.id === ministryId) ?? null;
  });
  protected readonly form = new FormGroup({
    title: new FormControl('Santa Missa', {
      nonNullable: true,
      validators: this.editMode ? [Validators.required] : [],
    }),
    date: new FormControl('', {
      nonNullable: true,
      validators: this.editMode ? [Validators.required] : [],
    }),
    time: new FormControl('19:00', {
      nonNullable: true,
      validators: this.editMode ? [Validators.required] : [],
    }),
    location: new FormControl('Igreja Matriz', {
      nonNullable: true,
      validators: this.editMode ? [Validators.required] : [],
    }),
    ministryId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    liturgicalTime: new FormControl('Tempo Comum', {
      nonNullable: true,
      validators: this.editMode ? [Validators.required] : [],
    }),
    notes: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    const firstSlotKey = this.slots.controls[0].controls.key.value;
    this.slotMembers.set(new Map([[firstSlotKey, []]]));
    effect(() => {
      const schedule = this.facade.selected();
      if (!this.editMode || !schedule || this.editInitialized) return;
      this.editInitialized = true;
      const localDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: schedule.timezone ?? 'America/Fortaleza',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date(schedule.date));
      this.form.setValue({
        title: schedule.title,
        date: localDate,
        time: schedule.time,
        location: schedule.location,
        ministryId: schedule.ministryId ?? '',
        liturgicalTime: schedule.liturgicalTime,
        notes: schedule.notes,
      });
      this.selectedMinistryId.set(schedule.ministryId ?? '');
      this.setMembersForSlot(firstSlotKey, schedule.people);
      this.selectedSongItems.set(schedule.songs.map(({ id: _id, ...song }) => song));
    });
  }

  ngOnInit(): void {
    if (this.scheduleId) this.facade.loadOne(this.scheduleId);
    else this.facade.loadOptions();
  }

  ngOnDestroy(): void {
    clearTimeout(this.songSearchTimer);
    clearTimeout(this.memberSearchTimer);
  }

  protected toggleMember(member: ScheduleMemberOption): void {
    if (!member.available) return;
    const current = this.selectedMembers();
    this.setMembersForSlot(
      this.activeSlotKey(),
      current.some((item) => item.id === member.id)
        ? current.filter((item) => item.id !== member.id)
        : [...current, member],
    );
  }

  protected removeSelectedMember(memberId: string): void {
    this.setMembersForSlot(
      this.activeSlotKey(),
      this.selectedMembers().filter((member) => member.id !== memberId),
    );
  }

  protected isHabitualMember(memberId: string): boolean {
    return this.selectedMinistry()?.participants.some((member) => member.id === memberId) ?? false;
  }

  protected searchMembers(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    clearTimeout(this.memberSearchTimer);
    this.memberSearchTimer = setTimeout(() => this.facade.loadMemberOptions(query, 1), 250);
  }

  protected changeMemberPage(page: number): void {
    if (page >= 1 && page <= this.facade.memberPageCount())
      this.facade.loadMemberOptions(this.facade.memberQuery(), page);
  }

  protected toggleSong(song: ScheduleSongOption): void {
    this.selectedSongItems.update((items) =>
      items.some((item) => item.songId === song.songId)
        ? items.filter((item) => item.songId !== song.songId)
        : [...items, song],
    );
  }

  protected searchSongs(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    clearTimeout(this.songSearchTimer);
    this.songSearchTimer = setTimeout(() => this.facade.loadSongOptions(query, 1), 250);
  }

  protected changeSongPage(page: number): void {
    if (page >= 1 && page <= this.facade.songPageCount())
      this.facade.loadSongOptions(this.facade.songQuery(), page);
  }

  protected moveSelectedSong(index: number, direction: -1 | 1): void {
    const target = index + direction;
    if (target < 0 || target >= this.selectedSongItems().length) return;
    this.selectedSongItems.update((items) => {
      const reordered = [...items];
      [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
      return reordered;
    });
  }

  protected applyMinistryPreset(event: Event): void {
    const ministryId = (event.target as HTMLSelectElement).value;
    this.selectedMinistryId.set(ministryId);
    const ministry = this.facade.ministryOptions().find((item) => item.id === ministryId);
    if (!ministry) return;
    if (this.editMode)
      this.form.patchValue({
        location: ministry.location,
        title: ministry.celebrationTitle,
      });
    const participants: ScheduledPerson[] = ministry.participants.map((person) => ({
      ...person,
      confirmation: 'PENDING',
    }));
    const updated = new Map<string, readonly ScheduledPerson[]>();
    for (const slot of this.slots.controls) {
      slot.controls.time.setValue(ministry.time);
      slot.controls.title.setValue(ministry.celebrationTitle);
      slot.controls.location.setValue(ministry.location);
      updated.set(slot.controls.key.value, participants.map((member) => ({ ...member })));
    }
    this.slotMembers.set(updated);
    this.slotError.set(null);
  }

  protected addSlot(): void {
    const ministry = this.selectedMinistry();
    const slot = this.createSlot(
      ministry?.time ?? '19:00',
      ministry?.celebrationTitle ?? 'Santa Missa',
      ministry?.location ?? 'Igreja Matriz',
    );
    this.slots.push(slot);
    const habitual = (this.selectedMinistry()?.participants ?? []).map(
      (member): ScheduledPerson => ({ ...member, confirmation: 'PENDING' }),
    );
    this.setMembersForSlot(slot.controls.key.value, habitual);
    this.activeSlotKey.set(slot.controls.key.value);
    this.slotError.set(null);
  }

  protected removeSlot(index: number): void {
    if (this.slots.length === 1) return;
    const key = this.slots.at(index).controls.key.value;
    this.slots.removeAt(index);
    this.slotMembers.update((current) => {
      const next = new Map(current);
      next.delete(key);
      return next;
    });
    if (this.activeSlotKey() === key)
      this.activeSlotKey.set(this.slots.controls[0].controls.key.value);
    this.slotError.set(null);
  }

  protected selectSlot(key: string): void {
    this.activeSlotKey.set(key);
  }

  protected copyActiveFormationToAll(): void {
    const selected = this.selectedMembers().map((member) => ({ ...member }));
    this.slotMembers.update(() =>
      new Map(
        this.slots.controls.map((slot) => [
          slot.controls.key.value,
          selected.map((member) => ({ ...member })),
        ]),
      ),
    );
  }

  protected slotDescription(slot: (typeof this.slots.controls)[number], index: number): string {
    const date = slot.controls.date.value;
    const formattedDate = date ? date.split('-').reverse().join('/') : `Data ${index + 1}`;
    return `${formattedDate} às ${slot.controls.time.value || '--:--'} · ${slot.controls.title.value}`;
  }

  protected submit(): void {
    this.slotError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const songs = this.selectedSongItems().map((item, index) => ({
      ...item,
      id: `new-${index}-${item.songId}`,
    }));
    if (this.editMode) {
      const selectedMinistry = this.selectedMinistry();
      const input = {
        title: this.form.controls.title.value,
        date: this.form.controls.date.value,
        time: this.form.controls.time.value,
        location: this.form.controls.location.value,
        ministry: selectedMinistry?.name ?? this.facade.selected()?.ministry ?? '',
        liturgicalTime: this.form.controls.liturgicalTime.value,
        notes: this.form.controls.notes.value,
        people: this.selectedMembers(),
        songs,
      };
      this.facade.updateOccurrence(input);
      return;
    }

    if (this.slots.invalid) {
      this.slots.markAllAsTouched();
      this.slotError.set('Preencha a data e o horário de todas as escalas.');
      return;
    }
    const slots = this.slots.controls.map((slot) => ({
      date: slot.controls.date.value,
      time: slot.controls.time.value,
      title: slot.controls.title.value,
      location: slot.controls.location.value,
      liturgicalTime: slot.controls.liturgicalTime.value,
      notes: slot.controls.notes.value,
      people: this.slotMembers().get(slot.controls.key.value) ?? [],
    }));
    const uniqueSlots = new Set(slots.map((slot) => `${slot.date}|${slot.time}`));
    if (uniqueSlots.size !== slots.length) {
      this.slotError.set('Não repita a mesma data e horário no lote.');
      return;
    }
    const input = {
      ministryId: this.form.controls.ministryId.value,
      slots,
      songs,
    };
    const payload = JSON.stringify(input);
    if (payload !== this.lastSubmissionPayload) {
      this.lastSubmissionPayload = payload;
      this.lastIdempotencyKey = globalThis.crypto.randomUUID();
    }
    this.facade.createBatch(input, this.lastIdempotencyKey);
  }

  private createSlot(
    time = '19:00',
    title = 'Santa Missa',
    location = 'Igreja Matriz',
  ) {
    return new FormGroup({
      key: new FormControl(`slot-${++this.slotSequence}`, { nonNullable: true }),
      date: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      time: new FormControl(time, { nonNullable: true, validators: [Validators.required] }),
      title: new FormControl(title, { nonNullable: true, validators: [Validators.required] }),
      location: new FormControl(location, { nonNullable: true, validators: [Validators.required] }),
      liturgicalTime: new FormControl('Tempo Comum', { nonNullable: true, validators: [Validators.required] }),
      notes: new FormControl('', { nonNullable: true }),
    });
  }

  private setMembersForSlot(key: string, members: readonly ScheduledPerson[]): void {
    this.slotMembers.update((current) => {
      const next = new Map(current);
      next.set(key, members.map((member) => ({ ...member })));
      return next;
    });
  }
}
