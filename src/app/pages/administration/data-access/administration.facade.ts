import { Injectable, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { LeaderInvitationInput, Parish, ParishInput } from '../models/administration.model';
import { AdministrationService } from './administration.service';

@Injectable()
export class AdministrationFacade {
  private readonly service = inject(AdministrationService);
  private readonly parishesState = signal<readonly Parish[]>([]); private readonly loadingState = signal(false); private readonly errorState = signal<string | null>(null); private readonly messageState = signal<string | null>(null);
  readonly parishes = this.parishesState.asReadonly(); readonly loading = this.loadingState.asReadonly(); readonly error = this.errorState.asReadonly(); readonly message = this.messageState.asReadonly();
  load(): void { this.loadingState.set(true); this.service.listParishes().pipe(finalize(() => this.loadingState.set(false))).subscribe({ next: (items) => this.parishesState.set(items), error: () => this.errorState.set('Não foi possível carregar as paróquias.') }); }
  createParish(input: ParishInput): void { this.begin(); this.service.createParish(input).pipe(finalize(() => this.loadingState.set(false))).subscribe({ next: (item) => { this.parishesState.update((items) => [...items, item]); this.messageState.set('Paróquia criada com sucesso.'); }, error: () => this.errorState.set('Não foi possível criar a paróquia.') }); }
  inviteLeader(input: LeaderInvitationInput): void { this.begin(); this.service.inviteLeader(input).pipe(finalize(() => this.loadingState.set(false))).subscribe({ next: () => this.messageState.set('Convite de líder enviado para a fila de e-mails.'), error: () => this.errorState.set('Não foi possível criar o convite de líder.') }); }
  private begin(): void { this.loadingState.set(true); this.errorState.set(null); this.messageState.set(null); }
}
