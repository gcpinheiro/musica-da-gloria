import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { DashboardData } from '../models/dashboard.model';
import { DASHBOARD_MOCK } from './dashboard.mock';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  getWeek(): Observable<DashboardData> {
    return of(DASHBOARD_MOCK).pipe(delay(350));
  }
}
