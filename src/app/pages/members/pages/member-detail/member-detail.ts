import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MembersFacade } from '../../data-access/members.facade';
import { AvailabilityLabelPipe } from '../../components/availability-label.pipe';

@Component({
  selector: 'app-member-detail',
  imports: [RouterLink, AvailabilityLabelPipe],
  templateUrl: './member-detail.html',
  styleUrl: './member-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  protected readonly facade = inject(MembersFacade);
  protected readonly memberId = this.route.snapshot.paramMap.get('id') ?? '';

  ngOnInit(): void { this.facade.loadOne(this.memberId); }
}
