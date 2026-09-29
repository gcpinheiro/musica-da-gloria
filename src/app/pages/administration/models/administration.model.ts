export interface Parish { readonly id: string; readonly name: string; readonly slug: string; readonly city: string; readonly state: string; readonly timezone: string; readonly status: 'ACTIVE' | 'INACTIVE'; }
export type ParishInput = Pick<Parish, 'name' | 'slug' | 'city' | 'state' | 'timezone'>;
export interface LeaderInvitationInput { readonly name: string; readonly email: string; readonly parishId: string; }
export interface LeaderInvitation {
  readonly id: string;
  readonly parishId: string;
  readonly memberId: null;
  readonly name: string;
  readonly email: string;
  readonly role: 'LEADER';
  readonly status: 'PENDING';
  readonly expiresAt: string;
}
export interface LeaderInvitationWithLink extends LeaderInvitation {
  readonly acceptanceUrl: string;
}
