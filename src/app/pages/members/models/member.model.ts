export type MemberStatus = 'ACTIVE' | 'INACTIVE';
export type Weekday = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface AvailabilityRule {
  readonly weekday: Weekday;
  readonly startTime: string;
  readonly endTime: string;
}

export interface Member {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly initials: string;
  readonly talents: readonly string[];
  readonly ministries: readonly string[];
  readonly availability: AvailabilityRule;
  readonly status: MemberStatus;
  readonly notes: string;
}

export interface MemberInput {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly talents: readonly string[];
  readonly ministries: readonly string[];
  readonly availability: AvailabilityRule;
  readonly notes: string;
}
