// ******** Dans ce fichier : tout ce qui concerne les utilisateurs ************

// ===============================================================
// 👤 Interface principale représentant un utilisateur dans le système
// ===============================================================
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar?: string;
  role: string;
  is_active: boolean;
  is_email_verified: boolean;
  blocked_until?: Date | null;  
  status?: string;             
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;
  email_verification_token?: string;
  email_verification_expires_at?: Date;
  password_reset_token?: string;
  password_reset_expires_at?: Date;
}

// ===============================================================
// 🔐 Enumération des rôles possibles d’un utilisateur
// (utile pour la sécurité, les guards, l’affichage conditionnel, etc.)
// ===============================================================
export enum UserRole {
  ADMIN = 'admin',       // Administrateur (droits complets)
  USER = 'user'          // Utilisateur standard
}

// ===============================================================
// 📤 Données requises pour créer un utilisateur (envoyées au backend)
// Utilisée dans un formulaire d’inscription ou back-office admin
// ===============================================================
export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;     // Mot de passe en clair (il sera hashé côté back)
  role: UserRole;
}

// ===============================================================
// 📤 Données requises pour créer un utilisateur (envoyées au backend)
// Utilisée dans un formulaire d’inscription ou back-office admin
// ===============================================================
export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;     // Mot de passe en clair (il sera hashé côté back)
  role: UserRole;
}

// ===============================================================
// 🔑 Données envoyées pour se connecter
// Utilisée par le formulaire de login
// ===============================================================
export interface LoginRequest {
  email: string;       // Identifiant (email)
  password: string;    // Mot de passe saisi par l’utilisateur
}

// ===============================================================
// ✅ Réponse du backend après une connexion réussie
// Contient le user connecté + tokens d'authentification
// ===============================================================
export interface AuthResponse {
  user: User;             // Infos de l’utilisateur connecté
  access_token: string;   // JWT pour accéder aux routes sécurisées
  refresh_token: string;  // Jeton pour régénérer un access token expiré
  expires_in: number;     // Durée de validité du access_token (en secondes)
}

export class UserHelpers {
  static isBlocked(user: User): boolean {
    if (!user.blocked_until) return false;
    return new Date() < new Date(user.blocked_until);
  }
  
  static getBlockedStatus(user: User): string {
    if (!user.blocked_until) return 'Non bloqué';
    
    const blockedUntil = new Date(user.blocked_until);
    const now = new Date();
    
    if (blockedUntil <= now) return 'Blocage expiré';
    
    const diffDays = Math.ceil((blockedUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return `Bloqué encore ${diffDays} jour(s)`;
  }
}