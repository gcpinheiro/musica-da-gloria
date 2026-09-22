import { Pipe, PipeTransform } from '@angular/core';
import { AvailabilityRule, Weekday } from '../models/member.model';

const WEEKDAY_LABELS: Readonly<Record<Weekday, string>> = {
  MONDAY: 'Segunda-feira',
  TUESDAY: 'Terça-feira',
  WEDNESDAY: 'Quarta-feira',
  THURSDAY: 'Quinta-feira',
  FRIDAY: 'Sexta-feira',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
};

@Pipe({ name: 'availabilityLabel', standalone: true })
export class AvailabilityLabelPipe implements PipeTransform {
  transform(availability: AvailabilityRule): string {
    return `${WEEKDAY_LABELS[availability.weekday]}, das ${availability.startTime} às ${availability.endTime}`;
  }
}
