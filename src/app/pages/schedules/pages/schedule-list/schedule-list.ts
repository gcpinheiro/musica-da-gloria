import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ScheduleAssignmentFilter, SchedulesFacade } from '../../data-access/schedules.facade';
import { ScheduleStatus } from '../../models/schedule.model';
import { AuthFacade } from '../../../../core/auth/auth.facade';

@Component({
  selector: 'app-schedule-list', imports: [DatePipe, RouterLink], templateUrl: './schedule-list.html', styleUrl: './schedule-list.scss', changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleList implements OnInit {
  protected readonly facade = inject(SchedulesFacade);
  protected readonly authFacade = inject(AuthFacade);
  ngOnInit(): void {
    const memberId = this.authFacade.user()?.memberId;
    if (this.authFacade.isMember() && memberId) this.facade.configureMemberFilter(memberId);
    this.facade.load();
  }
  protected filter(event: Event): void { this.facade.setStatus((event.target as HTMLSelectElement).value as ScheduleStatus | 'ALL'); }
  protected filterAssignment(event: Event): void { this.facade.setAssignmentFilter((event.target as HTMLSelectElement).value as ScheduleAssignmentFilter); }
}
