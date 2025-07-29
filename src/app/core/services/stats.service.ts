import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats, StatsOverTime, CategoryStats, CityStats } from '../models/stats.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StatsService {

  constructor(private readonly http: HttpClient) {}

  // 🎯 APPEL HTTP DIRECT - L'intercepteur gère le mock !
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(
      `${environment.apiUrl}/admin/stats`,
      { withCredentials: true }
    );
  }

getStatsOverTime(period: string = '7days'): Observable<StatsOverTime[]> {
  return this.http.get<StatsOverTime[]>(`${environment.apiUrl}/stats/overtime?period=${period}`, {
    withCredentials: true  // ← Doit être dans un objet options
  });
}

  getCategoryStats(): Observable<CategoryStats[]> {
    return this.http.get<CategoryStats[]>(`${environment.apiUrl}/stats/categories`, {
      withCredentials: true
    });
  }
  getCityStats(): Observable<CityStats[]> {
    return this.http.get<CityStats[]>(`${environment.apiUrl}/stats/cities`, {
      withCredentials: true
    });
  }
}
