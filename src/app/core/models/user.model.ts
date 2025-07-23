// ******** Dans ce fichier : tout ce qui concerne les utilisateurs ************

// ===============================================================
// 👤 Interface principale représentant un utilisateur dans le système
// ===============================================================
export interface User {
  isBlocked: any;
  // === Champs obligatoires ===

  id: number; // Identifiant unique de l'utilisateur (généré par la base)
  first_name: string; // Prénom
  last_name: string;  // Nom de famille
  email: string;      // Adresse email (sert d’identifiant à la connexion)
  password_hash: string; // Mot de passe crypté (jamais en clair !)
  role: UserRole;     // Rôle de l’utilisateur (admin, modérateur, user)
  is_active: boolean; // L’utilisateur est-il actif ? (sinon, compte désactivé)
  is_email_verified: boolean; // L’adresse mail a-t-elle été confirmée ?
  created_at: Date;   // Date de création du compte
  updated_at: Date;   // Dernière modification du profil

  // === Champs optionnels ===

  avatar?: string; // URL de l'image de profil (facultatif)
  phone?: string;  // Numéro de téléphone
  last_login_at?: Date; // Dernière connexion connue
  email_verification_token?: string; // Jeton de confirmation d’email
  email_verification_expires_at?: Date; // Expiration du lien de confirmation
  password_reset_token?: string; // Jeton pour réinitialiser le mot de passe
  password_reset_expires_at?: Date; // Expiration du lien de réinitialisation
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
