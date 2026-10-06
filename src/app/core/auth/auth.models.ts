export type UserRole = 'SUPER_ADMIN' | 'LEADER' | 'MEMBER';

export interface AuthUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;
  readonly initials: string;
  readonly parishId: string | null;
  readonly memberId: string | null;
  readonly hasPhoto?: boolean;
  readonly photoUrl?: string;
}

export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
}

export interface InvitationAcceptance { readonly password: string; readonly passwordConfirmation: string; readonly whatsapp?: string; }

export interface InvitationValidation {
  readonly valid: true;
  readonly expiresAt: string;
}
