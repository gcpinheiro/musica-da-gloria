import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SchedulesFacade } from '../../data-access/schedules.facade';

@Component({ selector: 'app-schedule-detail', imports: [DatePipe, RouterLink], templateUrl: './schedule-detail.html', styleUrl: './schedule-detail.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class ScheduleDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  protected readonly facade = inject(SchedulesFacade);
  ngOnInit(): void { this.facade.loadOne(this.route.snapshot.paramMap.get('id') ?? ''); }
}
