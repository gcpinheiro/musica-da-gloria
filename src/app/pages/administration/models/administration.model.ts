export interface Parish { readonly id: string; readonly name: string; readonly slug: string; readonly city: string; readonly state: string; readonly timezone: string; readonly status: 'ACTIVE' | 'INACTIVE'; }
export type ParishInput = Pick<Parish, 'name' | 'slug' | 'city' | 'state' | 'timezone'>;
export interface LeaderInvitationInput { readonly name: string; readonly email: string; readonly parishId: string; }
