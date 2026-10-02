import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MinistriesFacade } from '../../data-access/ministries.facade';
import { Avatar } from '../../../../shared/components/avatar/avatar';

@Component({ selector: 'app-ministry-detail', imports: [DatePipe, RouterLink, Avatar], providers: [MinistriesFacade], templateUrl: './ministry-detail.html', styleUrl: './ministry-detail.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class MinistryDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  protected readonly facade = inject(MinistriesFacade);
  protected readonly generationOpen = signal(false);
  protected readonly archiveConfirmationOpen = signal(false);
  protected readonly minDate = this.dateKey(new Date());
  protected readonly endDate = signal(this.defaultEndDate());
  ngOnInit(): void { this.facade.loadOne(this.route.snapshot.paramMap.get('id') ?? ''); }
  protected updateEndDate(event: Event): void { this.endDate.set((event.target as HTMLInputElement).value); }
  private defaultEndDate(): string { const date = new Date(); date.setMonth(date.getMonth() + 3); return this.dateKey(date); }
  private dateKey(date: Date): string { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
}
