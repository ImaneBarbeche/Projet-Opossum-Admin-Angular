import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserRequest } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  
  constructor(private readonly http: HttpClient) {}

  // 👥 Récupérer tous les utilisateurs
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }

  // 👤 Récupérer un utilisateur par ID
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/${id}`);
  }

  // ✨ Créer un utilisateur
  createUser(userData: CreateUserRequest): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users`, userData);
  }

  // ✏️ Modifier un utilisateur
  updateUser(id: number, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/users/${id}`, userData);
  }

  // 🗑️ Supprimer un utilisateur
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/users/${id}`);
  }

  // 🚫 Bloquer un utilisateur - CORRIGÉ
  blockUser(userId: number, durationDays: number): Observable<void> {
    const blockedUntil = new Date();
    blockedUntil.setDate(blockedUntil.getDate() + durationDays);
    
    // ✅ CORRECTION : Utiliser environment.apiUrl au lieu de this.apiUrl
    return this.http.put<void>(`${environment.apiUrl}/admin/users/${userId}/block`, {
      blocked_until: blockedUntil.toISOString()
    });
  }

  // ✅ Débloquer un utilisateur - CORRIGÉ
  unblockUser(userId: number): Observable<void> {
    // ✅ CORRECTION : Utiliser environment.apiUrl au lieu de this.apiUrl
    return this.http.put<void>(`${environment.apiUrl}/admin/users/${userId}/unblock`, {});
  }

  // ✅ Helper pour vérifier si un user est bloqué
  // ✅ Helper pour vérifier si un user est bloqué
  isUserBlocked(user: User): boolean {
    // Suppose a user is blocked if blocked_until exists and is in the future
    return !!user.blocked_until && new Date(user.blocked_until) > new Date();
  }

  // ✅ Helper pour l'affichage du statut de blocage
  getUserBlockedStatus(user: User): string {
    if (this.isUserBlocked(user)) {
      return `Bloqué jusqu'au ${new Date(user.blocked_until!).toLocaleString()}`;
    }
    return 'Actif';
  }
}