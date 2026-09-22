export type ScheduleStatus = 'CONFIRMED' | 'PENDING' | 'ATTENTION';

export interface DashboardSummary {
  readonly celebrations: number;
  readonly confirmedMembers: number;
  readonly pendingConfirmations: number;
  readonly openPositions: number;
}

export interface DashboardMember {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
  readonly role: string;
  readonly confirmed: boolean;
}

export interface WeekSchedule {
  readonly id: string;
  readonly title: string;
  readonly ministry: string;
  readonly date: string;
  readonly time: string;
  readonly location: string;
  readonly liturgicalTime: string;
  readonly status: ScheduleStatus;
  readonly members: readonly DashboardMember[];
  readonly totalMembers: number;
  readonly repertoireCount: number;
  readonly alert?: string;
}

export interface DashboardData {
  readonly weekLabel: string;
  readonly summary: DashboardSummary;
  readonly schedules: readonly WeekSchedule[];
}
