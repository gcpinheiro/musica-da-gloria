export type UserRole = 'ADMIN' | 'LEADER' | 'MEMBER';

export interface AuthUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;
  readonly initials: string;
  readonly memberId?: string;
}

export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
}
