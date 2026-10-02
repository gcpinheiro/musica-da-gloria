import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, OnInit, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SchedulesFacade } from '../../data-access/schedules.facade';
import { ScheduleStatus } from '../../models/schedule.model';
import { AuthFacade } from '../../../../core/auth/auth.facade';

@Component({
  selector: 'app-schedule-list', imports: [DatePipe, RouterLink], templateUrl: './schedule-list.html', styleUrl: './schedule-list.scss', changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleList implements OnInit {
  protected readonly facade = inject(SchedulesFacade);
  protected readonly authFacade = inject(AuthFacade);
  protected readonly selectionMode = signal(false);
  protected readonly selectedIds = signal<readonly string[]>([]);
  protected readonly deleteDialogOpen = signal(false);
  private readonly cancelDelete = viewChild<ElementRef<HTMLButtonElement>>('cancelDelete');
  private readonly selectionTrigger = viewChild<ElementRef<HTMLButtonElement>>('selectionTrigger');
  ngOnInit(): void {
    const memberId = this.authFacade.user()?.memberId;
    if (this.authFacade.isMember() && memberId) this.facade.configureMemberFilter(memberId);
    this.facade.load();
  }
  protected filter(event: Event): void { this.facade.setStatus((event.target as HTMLSelectElement).value as ScheduleStatus | 'ALL'); }
  protected toggleSelectionMode(): void { this.selectionMode.update((enabled) => !enabled); this.selectedIds.set([]); }
  protected toggleSchedule(id: string): void { this.selectedIds.update((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]); }
  protected openDeleteDialog(): void { if (!this.selectedIds().length) return; this.deleteDialogOpen.set(true); queueMicrotask(() => this.cancelDelete()?.nativeElement.focus()); }
  protected closeDeleteDialog(): void { this.deleteDialogOpen.set(false); queueMicrotask(() => this.selectionTrigger()?.nativeElement.focus()); }
  protected confirmDelete(): void { const ids = this.selectedIds(); this.closeDeleteDialog(); this.facade.archiveMany(ids); this.selectedIds.set([]); this.selectionMode.set(false); }
  @HostListener('document:keydown.escape')
  protected closeDialogWithKeyboard(): void { if (this.deleteDialogOpen()) this.closeDeleteDialog(); }
}
