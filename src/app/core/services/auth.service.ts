import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthResponse, User, LoginRequest } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  public readonly currentUser$ = this.currentUserSubject.asObservable();
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private tokenCheckInterval?: number;
  private accessToken: string | null = null;

  constructor() {
    // 🔍 Vérifier au démarrage si l'utilisateur est connecté VIA COOKIES
    this.initializeAuth();
  }

  // 🎯 LOGIN - Avec cookies automatiques
  login(email: string, password: string): Observable<AuthResponse> {
    const loginData: LoginRequest = { email, password };
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, loginData, {
      withCredentials: true
    }).pipe(
      tap(response => {
        // ✅ COOKIES ONLY - Pas de localStorage !
        const user = (response as any).user || (response as any).data;
        if (user) {
          this.currentUserSubject.next(user);
          this.startTokenCheckInterval();
          // 👇 Gestion du cookie mock si présent
          if ((response as any).setCookie) {
            document.cookie = (response as any).setCookie;
            console.log('🍪 Cookie mock appliqué:', (response as any).setCookie);
          }
          // 🔑 Stocker le JWT accessToken si présent
          if ((response as any).accessToken) {
            this.accessToken = (response as any).accessToken;
            console.log('🔑 accessToken reçu et stocké:', this.accessToken);
          }
          console.log('✅ Utilisateur connecté:', user.email);
        } else {
          console.log('❌ Réponse login sans user:', response);
        }
      }),
      catchError(error => {
        console.error('❌ Erreur de connexion:', error);
        return throwError(() => error);
      })
    );
  }

  // 🚪 LOGOUT - Appel API pour supprimer le cookie côté serveur
  logout(): void {
    console.log('🚪 Déconnexion en cours...');
    this.http.post<any>(`${environment.apiUrl}/auth/logout`, {}, {
      withCredentials: true
    }).subscribe({
      next: (response) => {
        // 👇 Gestion du cookie mock si présent
        if (response && response.setCookie) {
          document.cookie = response.setCookie;
          console.log('🍪 Cookie mock supprimé:', response.setCookie);
        }
        this.completeLogout();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la déconnexion:', error);
        // Même en cas d'erreur, on fait le nettoyage local
        this.completeLogout();
      }
    });
  }

  // 🧹 Nettoyage complet lors de la déconnexion
  private completeLogout(): void {
    this.clearTokenCheckInterval();
    this.currentUserSubject.next(null);
    console.log('✅ Déconnexion terminée');
    
    // Rediriger vers login si pas déjà sur la page
    if (this.router.url !== '/login') {
      this.router.navigate(['/login']);
    }
  }

  // 🔍 VÉRIFICATION - Basée sur l'appel /auth/me avec cookies
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  // 👤 Récupérer utilisateur actuel
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // 🔄 INITIALISATION AU DÉMARRAGE - Pure cookies
  initializeAuth(): void {
    console.log('🔄 Initialisation de l\'authentification via cookies...');
    
    this.http.get<{user: User, authenticated: boolean}>(`${environment.apiUrl}/auth`, {
      withCredentials: true // ← Le cookie sera envoyé automatiquement
    }).subscribe({
      next: (response) => {
        if (response.authenticated && response.user) {
          this.currentUserSubject.next(response.user);
          this.startTokenCheckInterval(); // Démarrer la vérification périodique
          console.log('✅ Utilisateur reconnecté automatiquement:', response.user.email);
        } else {
          console.log('ℹ️ Aucune session active');
          this.currentUserSubject.next(null);
        }
      },
      error: (error) => {
        console.log('ℹ️ Pas de session active:', error.status);
        this.currentUserSubject.next(null);
      }
    });
  }

  // ✅ VALIDATION PÉRIODIQUE - Via appel API avec cookies
  checkTokenValidity(): Observable<boolean> {
    return this.http.get<{user: User, authenticated: boolean}>(`${environment.apiUrl}/auth/validate`, {
      withCredentials: true
    }).pipe(
      map(response => {
        if (!response.authenticated) {
          console.log('❌ Session expirée');
          this.completeLogout();
          return false;
        } else {
          console.log('✅ Session valide');
          // Mettre à jour l'utilisateur si nécessaire
          if (response.user) {
            this.currentUserSubject.next(response.user);
          }
          return true;
        }
      }),
      catchError(error => {
        console.log('❌ Erreur validation session:', error);
        this.completeLogout();
        return of(false); // ✅ CORRECTION: Retourner Observable<boolean>
      })
    );
  }

  // ⏱️ VÉRIFICATION PÉRIODIQUE - Toutes les 5 minutes
  private startTokenCheckInterval(): void {
    // Nettoyer l'ancien interval s'il existe
    this.clearTokenCheckInterval();
    
    // Vérifier la session toutes les 5 minutes
    this.tokenCheckInterval = window.setInterval(() => {
      if (this.isAuthenticated()) {
        this.checkTokenValidity().subscribe({
          next: (isValid) => {
            if (!isValid) {
              console.log('🔄 Session expirée détectée, déconnexion automatique');
            }
          },
          error: () => {
            console.log('🔄 Erreur de validation, déconnexion automatique');
          }
        });
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  // 🧹 Nettoyer l'interval de vérification
  private clearTokenCheckInterval(): void {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
      this.tokenCheckInterval = undefined;
    }
  }

   //  Vérification du rôle admin
  isAdmin(): boolean {
    const currentUser = this.getCurrentUser();
    return currentUser?.role?.toLowerCase() === 'admin';
  }

  //  Vérification de rôle générique (optionnelle)
  hasRole(role: string): boolean {
    const currentUser = this.getCurrentUser();
    return currentUser?.role?.toLowerCase() === role.toLowerCase();
  }

  //  Vérification de permissions (optionnelle)
  hasPermission(permission: string): boolean {
    const currentUser = this.getCurrentUser();
    
    // Si admin, accès à tout
    if (this.isAdmin()) {
      return true;
    }
    

    return false;
  }

  // Récupérer le JWT accessToken
  public getAccessToken(): string | null {
    return this.accessToken;
  }

}