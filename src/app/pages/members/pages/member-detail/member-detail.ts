import { DatePipe, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MembersFacade } from '../../data-access/members.facade';
import { AvailabilityLabelPipe } from '../../components/availability-label.pipe';
import { Avatar } from '../../../../shared/components/avatar/avatar';

@Component({
  selector: 'app-member-detail',
  imports: [RouterLink, AvailabilityLabelPipe, DatePipe, Avatar],
  templateUrl: './member-detail.html',
  styleUrl: './member-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);
  protected readonly facade = inject(MembersFacade);
  protected readonly memberId = this.route.snapshot.paramMap.get('id') ?? '';
  protected readonly copyMessage = signal<string | null>(null);

  ngOnInit(): void { this.facade.loadOne(this.memberId); }
  protected async copyInvitationLink(): Promise<void> {
    const link = this.facade.invitationLink();
    if (!link || !isPlatformBrowser(this.platformId) || !navigator.clipboard) { this.copyMessage.set('Selecione o link e copie manualmente.'); return; }
    try { await navigator.clipboard.writeText(link); this.copyMessage.set('Link copiado.'); } catch { this.copyMessage.set('Selecione o link e copie manualmente.'); }
  }
}
