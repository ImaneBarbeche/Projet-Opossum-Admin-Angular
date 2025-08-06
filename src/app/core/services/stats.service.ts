import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { DashboardStats } from '../models/stats.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StatsService {
  constructor(private readonly http: HttpClient) {}


  /**
   * 🎯 Récupère les statistiques globales du dashboard admin
   * Exemple : nombre total d'annonces, utilisateurs actifs, objets retrouvés, etc.
   * Appelé lors de l'affichage du tableau de bord
   */
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(
      `${environment.apiUrl}/admin/stats`,
      { withCredentials: true }
    ).pipe(
      map((response: DashboardStats) => {
        return response;
      })
    );
  }
}