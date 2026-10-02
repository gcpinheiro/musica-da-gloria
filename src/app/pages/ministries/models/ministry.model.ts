export type MinistryWeekday = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface MinistryParticipant {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
  readonly photoUrl?: string;
  readonly whatsapp: string;
  readonly role: string;
}

export interface Ministry {
  readonly id: string;
  readonly name: string;
  readonly participants: readonly MinistryParticipant[];
  readonly weekday: MinistryWeekday;
  readonly time: string;
  readonly celebrationTitle: string;
  readonly location: string;
  readonly active: boolean;
  readonly seriesId?: string;
  readonly generatedThrough?: string;
}

export type MinistryInput = Omit<Ministry, 'id' | 'active' | 'generatedThrough'>;

export const MINISTRY_WEEKDAYS = [
  { value: 'MONDAY', label: 'Segunda-feira', day: 1 },
  { value: 'TUESDAY', label: 'Terça-feira', day: 2 },
  { value: 'WEDNESDAY', label: 'Quarta-feira', day: 3 },
  { value: 'THURSDAY', label: 'Quinta-feira', day: 4 },
  { value: 'FRIDAY', label: 'Sexta-feira', day: 5 },
  { value: 'SATURDAY', label: 'Sábado', day: 6 },
  { value: 'SUNDAY', label: 'Domingo', day: 0 },
] as const;
