import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Member, MemberInput, MemberStatus } from '../models/member.model';
import { MembersService } from './members.service';

@Injectable({ providedIn: 'root' })
export class MembersFacade {
  private readonly service = inject(MembersService);
  private readonly router = inject(Router);
  private readonly membersState = signal<readonly Member[]>([]);
  private readonly selectedState = signal<Member | null>(null);
  private readonly loadingState = signal(false);
  private readonly savingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly queryState = signal('');
  private readonly statusState = signal<MemberStatus | 'ALL'>('ALL');

  readonly members = this.membersState.asReadonly();
  readonly selectedMember = this.selectedState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly saving = this.savingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly query = this.queryState.asReadonly();
  readonly status = this.statusState.asReadonly();
  readonly filteredMembers = computed(() => {
    const query = this.queryState().trim().toLocaleLowerCase('pt-BR');
    return this.membersState().filter((member) => {
      const matchesStatus = this.statusState() === 'ALL' || member.status === this.statusState();
      const matchesQuery = !query || [member.name, member.email, ...member.talents, ...member.ministries]
        .some((value) => value.toLocaleLowerCase('pt-BR').includes(query));
      return matchesStatus && matchesQuery;
    });
  });
  readonly activeCount = computed(() => this.membersState().filter((member) => member.status === 'ACTIVE').length);

  load(): void {
    this.loadingState.set(true);
    this.errorState.set(null);
    this.service.list().pipe(finalize(() => this.loadingState.set(false))).subscribe({
      next: (members) => this.membersState.set(members),
      error: () => this.errorState.set('Não foi possível carregar os membros.'),
    });
  }

  loadOne(id: string): void {
    this.selectedState.set(null);
    this.loadingState.set(true);
    this.errorState.set(null);
    this.service.getById(id).pipe(finalize(() => this.loadingState.set(false))).subscribe({
      next: (member) => this.selectedState.set(member),
      error: () => this.errorState.set('Membro não encontrado.'),
    });
  }

  setQuery(query: string): void { this.queryState.set(query); }
  setStatus(status: MemberStatus | 'ALL'): void { this.statusState.set(status); }

  save(input: MemberInput, id?: string): void {
    this.savingState.set(true);
    this.errorState.set(null);
    const request = id ? this.service.update(id, input) : this.service.create(input);
    request.pipe(finalize(() => this.savingState.set(false))).subscribe({
      next: (member) => {
        this.selectedState.set(member);
        this.load();
        void this.router.navigate(['/membros', member.id]);
      },
      error: () => this.errorState.set('Não foi possível salvar o membro. Tente novamente.'),
    });
  }

  deactivate(id: string): void {
    this.service.deactivate(id).subscribe({
      next: () => this.load(),
      error: () => this.errorState.set('Não foi possível desativar o membro.'),
    });
  }
}
