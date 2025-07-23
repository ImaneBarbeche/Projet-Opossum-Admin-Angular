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

  // 🚫 Bloquer un utilisateur
  blockUser(userId: string): Observable<User> {
    const id = parseInt(userId);
    return this.updateUser(id, { is_active: false });
  }

  // ✅ Débloquer un utilisateur
  unblockUser(userId: string): Observable<User> {
    const id = parseInt(userId);
    return this.updateUser(id, { is_active: true });
  }
}