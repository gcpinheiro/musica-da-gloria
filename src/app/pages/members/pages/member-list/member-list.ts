import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MembersFacade } from '../../data-access/members.facade';
import { MemberStatus } from '../../models/member.model';
import { AvailabilityLabelPipe } from '../../components/availability-label.pipe';

@Component({
  selector: 'app-member-list',
  imports: [RouterLink, AvailabilityLabelPipe],
  templateUrl: './member-list.html',
  styleUrl: './member-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberList implements OnInit {
  protected readonly facade = inject(MembersFacade);

  ngOnInit(): void { this.facade.load(); }
  protected search(event: Event): void { this.facade.setQuery((event.target as HTMLInputElement).value); }
  protected filter(event: Event): void { this.facade.setStatus((event.target as HTMLSelectElement).value as MemberStatus | 'ALL'); }
  protected deactivate(id: string, name: string): void {
    if (globalThis.confirm?.(`Desativar ${name}? O histórico de escalas será preservado.`)) {
      this.facade.deactivate(id);
    }
  }
}
