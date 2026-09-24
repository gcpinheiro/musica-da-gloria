import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SongsFacade } from '../../data-access/songs.facade';
import { AuthFacade } from '../../../../core/auth/auth.facade';
@Component({ selector: 'app-song-list', imports: [RouterLink], templateUrl: './song-list.html', styleUrl: './song-list.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class SongList implements OnInit { protected readonly facade = inject(SongsFacade); protected readonly authFacade = inject(AuthFacade); ngOnInit(): void { this.facade.load(); } protected search(event: Event): void { this.facade.setQuery((event.target as HTMLInputElement).value); } }
