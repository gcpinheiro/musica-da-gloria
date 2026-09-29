import { Injectable, inject, signal } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';
import { LeaderInvitation, LeaderInvitationInput, Parish, ParishInput } from '../models/administration.model';
import { AdministrationService } from './administration.service';

@Injectable()
export class AdministrationFacade {
  private readonly service = inject(AdministrationService);
  private readonly parishesState = signal<readonly Parish[]>([]); private readonly invitationsState = signal<readonly LeaderInvitation[]>([]); private readonly invitationLinkState = signal<string | null>(null); private readonly loadingState = signal(false); private readonly errorState = signal<string | null>(null); private readonly messageState = signal<string | null>(null);
  readonly parishes = this.parishesState.asReadonly(); readonly invitations = this.invitationsState.asReadonly(); readonly invitationLink = this.invitationLinkState.asReadonly(); readonly loading = this.loadingState.asReadonly(); readonly error = this.errorState.asReadonly(); readonly message = this.messageState.asReadonly();
  load(): void { this.loadingState.set(true); forkJoin({ parishes: this.service.listParishes(), invitations: this.service.listLeaderInvitations() }).pipe(finalize(() => this.loadingState.set(false))).subscribe({ next: ({ parishes, invitations }) => { this.parishesState.set(parishes); this.invitationsState.set(invitations); }, error: () => this.errorState.set('Não foi possível carregar a administração.') }); }
  createParish(input: ParishInput): void { this.begin(); this.service.createParish(input).pipe(finalize(() => this.loadingState.set(false))).subscribe({ next: (item) => { this.parishesState.update((items) => [...items, item]); this.messageState.set('Paróquia criada com sucesso.'); }, error: () => this.errorState.set('Não foi possível criar a paróquia.') }); }
  inviteLeader(input: LeaderInvitationInput): void { this.begin(); this.service.inviteLeader(input).pipe(finalize(() => this.loadingState.set(false))).subscribe({ next: (invitation) => { this.invitationsState.update((items) => [invitation, ...items]); this.invitationLinkState.set(invitation.acceptanceUrl); this.messageState.set('Convite criado. Copie o link e envie para a pessoa convidada.'); }, error: () => this.errorState.set('Não foi possível criar o convite de líder.') }); }
  obtainInvitationLink(invitationId: string): void { this.begin(); this.service.obtainInvitationLink(invitationId).pipe(finalize(() => this.loadingState.set(false))).subscribe({ next: (invitation) => { this.invitationLinkState.set(invitation.acceptanceUrl); this.messageState.set('Novo link gerado. O link anterior deste convite foi invalidado.'); }, error: () => this.errorState.set('Não foi possível obter o link. O convite pode ter expirado ou já ter sido utilizado.') }); }
  copied(): void { this.messageState.set('Link copiado. Envie-o por um canal privado.'); }
  copyFailed(): void { this.errorState.set('Não foi possível copiar automaticamente. Selecione o link e copie manualmente.'); }
  private begin(): void { this.loadingState.set(true); this.errorState.set(null); this.messageState.set(null); this.invitationLinkState.set(null); }
}
