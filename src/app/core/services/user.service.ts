import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, CreateUserRequest, UserHelpers } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  
  constructor(private readonly http: HttpClient) {}

  // 👥 Récupérer tous les utilisateurs
  getAllUsers(): Observable<User[]> {
    return this.http.get<any>(`${environment.apiUrl}/admin/users`, {
      withCredentials: true
    }).pipe(
      map(response => {
        // Si la réponse est déjà un tableau
        if (Array.isArray(response)) {
          return response.map((u: any) => UserHelpers.fromApi(u));
        }
        // Sinon, structure paginée
        const content = response?.data?.content ?? [];
        return Array.isArray(content)
          ? content.map((u: any) => UserHelpers.fromApi(u))
          : [];
      })
    );
  }

  // 👤 Récupérer un utilisateur par ID (admin)
  getUserById(id: string): Observable<User> {
    return this.http.get<any>(`${environment.apiUrl}/admin/users/${id}`, {
      withCredentials: true
    }).pipe(
      map(raw => {
        console.log('[API user raw]', raw); // DEBUG: log la réponse brute
        return UserHelpers.fromApi(raw.data);
      })
    );
  }



  // 🗑️ Supprimer un utilisateur (admin)
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/admin/users/${id}`, {
      withCredentials: true
    });
  }

  // 🚫 Bloquer un utilisateur - CORRIGÉ
  blockUser(userId: string, durationDays: number, reason: string): Observable<void> {
    // Nouvelle API: envoie raison et durée
    return this.http.put<void>(`${environment.apiUrl}/admin/users/${userId}/block`, {
      reason,
      duration: durationDays
    }, {
      withCredentials: true
    });
  }

  // ✅ Débloquer un utilisateur - CORRIGÉ
  unblockUser(userId: string): Observable<void> {
    // ✅ CORRECTION : Utiliser environment.apiUrl au lieu de this.apiUrl
    return this.http.put<void>(`${environment.apiUrl}/admin/users/${userId}/unblock`, {}, {
      withCredentials: true
    });
  }

  // ✅ Helper pour vérifier si un user est bloqué (nouvelle API: status/unblockAt)
  isUserBlocked(user: User): boolean {
    // Bloqué si status === 'BLOCKED' et (unblockAt absent ou dans le futur)
    if (user.status === 'BLOCKED') {
      if (user.unblockAt) {
        return new Date(user.unblockAt) > new Date();
      }
      return true; // Blocage permanent si pas de date
    }
    return false;
  }

  // ✅ Helper pour l'affichage du statut de blocage (nouvelle API)
  getUserBlockedStatus(user: User): string {
    if (this.isUserBlocked(user)) {
      // Priorité à unblockAt, sinon blockedUntil (legacy)
      const endDate = user.unblockAt || user.blockedUntil;
      if (endDate) {
        return `Bloqué jusqu'au ${new Date(endDate).toLocaleString()}` + (user.blockReason ? ` (Motif: ${user.blockReason})` : '');
      }
      return `Bloqué${user.blockReason ? ` (Motif: ${user.blockReason})` : ''}`;
    }
    return 'Actif';
  }
}