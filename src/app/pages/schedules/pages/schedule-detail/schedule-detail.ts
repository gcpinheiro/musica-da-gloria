import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SchedulesFacade } from '../../data-access/schedules.facade';
import { ScheduleMemberOption, ScheduleSongOption } from '../../models/schedule.model';
import { AuthFacade } from '../../../../core/auth/auth.facade';

@Component({ selector: 'app-schedule-detail', imports: [DatePipe, RouterLink], templateUrl: './schedule-detail.html', styleUrl: './schedule-detail.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class ScheduleDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  protected readonly facade = inject(SchedulesFacade);
  protected readonly authFacade = inject(AuthFacade);
  protected readonly memberPickerOpen = signal(false);
  protected readonly songPickerOpen = signal(false);
  ngOnInit(): void { this.facade.loadOne(this.route.snapshot.paramMap.get('id') ?? ''); }
  protected addMember(member: ScheduleMemberOption): void { this.facade.addMember(member); this.memberPickerOpen.set(false); }
  protected addSong(song: ScheduleSongOption): void { this.facade.addSong(song); this.songPickerOpen.set(false); }
  protected hasMember(id: string): boolean { return this.facade.selected()?.people.some((item) => item.id === id) ?? false; }
  protected hasSong(id: string): boolean { return this.facade.selected()?.songs.some((item) => item.songId === id) ?? false; }
}
