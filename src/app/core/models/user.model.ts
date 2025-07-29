// ******** Dans ce fichier : tout ce qui concerne les utilisateurs ************

// ===============================================================
// 👤 Interface principale représentant un utilisateur dans le système
// ===============================================================
// 👤 Interface principale représentant un utilisateur dans le système
// ===============================================================
export interface User {
  id: string;  // ✅ UUID au lieu de number
  email: string;
  firstName: string;  // ✅ Utilise firstName au lieu de first_name
  lastName: string;   // ✅ Utilise lastName au lieu de last_name
  phone?: string;
  avatar?: string;
  role: string;
  active: boolean;    // ✅ Utilise active au lieu de is_active
  emailVerified: boolean;  // ✅ Utilise emailVerified au lieu de is_email_verified
  blockedUntil?: string | null;  // Ancien champ (legacy)
  status?: string;
  unblockAt?: string | null; // Nouvelle API: date de déblocage
  blockReason?: string | null; // Nouvelle API: motif du blocage
  createdAt: string;  // ✅ Utilise createdAt et string pour ISO dates
  updatedAt: string;  // ✅ Utilise updatedAt et string pour ISO dates
  lastLoginAt?: string | null;  // ✅ Utilise lastLoginAt et string pour ISO dates
  recentActivity?: Array<{ type: string; label: string; date: string }>;
  announcementsCount?: number;
  activeAnnouncementsCount?: number;
  
  // Propriétés optionnelles pour l'admin (pas dans l'API)
  email_verification_token?: string;
  email_verification_expires_at?: string;
  password_reset_token?: string;
  password_reset_expires_at?: string;
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
    if (!user.blockedUntil) return false;
    return new Date() < new Date(user.blockedUntil);
  }
  
  static getBlockedStatus(user: User): string {
    if (!user.blockedUntil) return 'Non bloqué';
    
    const blockedUntil = new Date(user.blockedUntil);
    const now = new Date();
    
    if (blockedUntil <= now) return 'Blocage expiré';
    
    const diffDays = Math.ceil((blockedUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return `Bloqué encore ${diffDays} jour(s)`;
  }
  /**
   * Mappe un objet utilisateur reçu du backend (snake_case) vers l'interface User (camelCase)
   */
  static fromApi(raw: any): User {
    const source = raw.data ?? raw;
    return {
      id: source.id,
      email: source.email,
      firstName: source.first_name ?? source.firstName,
      lastName: source.last_name ?? source.lastName,
      phone: source.phone,
      avatar: source.avatar,
      role: source.role,
      active: source.active,
      emailVerified: source.email_verified ?? source.emailVerified,
      blockedUntil: source.blocked_until ?? source.blockedUntil,
      unblockAt: source.unblock_at ?? source.unblockAt,
      blockReason: source.block_reason ?? source.blockReason,
      status: source.status,
      createdAt: source.created_at ?? source.createdAt,
      updatedAt: source.updated_at ?? source.updatedAt,
      lastLoginAt: source.last_login_at ?? source.lastLoginAt,
      announcementsCount: source.announcementsCount,
      activeAnnouncementsCount: source.activeAnnouncementsCount,
      recentActivity: source.recentActivity,
      // autres propriétés si besoin
    } as User;
  }
}