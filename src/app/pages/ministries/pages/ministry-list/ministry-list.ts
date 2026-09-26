import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MinistriesFacade } from '../../data-access/ministries.facade';

@Component({ selector: 'app-ministry-list', imports: [RouterLink], providers: [MinistriesFacade], templateUrl: './ministry-list.html', styleUrl: './ministry-list.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class MinistryList implements OnInit {
  protected readonly facade = inject(MinistriesFacade);
  ngOnInit(): void { this.facade.load(); }
}
