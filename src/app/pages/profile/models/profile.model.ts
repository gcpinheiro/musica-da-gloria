export interface Profile {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly initials: string;
  readonly photoUrl?: string;
}

export interface ProfileInput {
  readonly name: string;
  readonly phone: string;
}
