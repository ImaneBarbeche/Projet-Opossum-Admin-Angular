// 📊 Statistiques dashboard admin Opossum - Structure conforme API backend
export interface DashboardStats {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  announcements: {
    total: number;
    active: number;
    lost: number;
    found: number;
    resolved: number;
  };
  files: {
    totalCount: number;
    activeCount: number;
    totalSize: string;
  };
  resolutionRate: number;
}

// 📅 Évolution dans le temps (pour graphiques)
export interface StatsOverTime {
  date: Date;
  newUsers: number;
  newListings: number;
  resolvedListings: number;
}

// 🗂️ Répartition par catégorie d'objets
export interface CategoryStats {
  category: string;             // "electronics", "clothing", etc.
  lostCount: number;           // Nb objets perdus dans cette catégorie
  foundCount: number;          // Nb objets trouvés dans cette catégorie
  resolvedCount: number;       // Nb réunions réussies
  resolutionRate: number;      // % de succès pour cette catégorie
}

// 🏙️ Répartition par ville
export interface CityStats {
  city: string;
  totalListings: number;
  lostItems: number;
  foundItems: number;
  resolvedItems: number;
  resolutionRate: number;      // Efficacité par ville
}

// 📱 Widgets rapides pour dashboard (petites cartes)
export interface QuickStats {
  label: string;               // "Nouveaux utilisateurs"
  value: number;               // 42
  change: number;              // +5 par rapport à hier
  changeType: 'increase' | 'decrease' | 'stable';
  icon: string;                // "users", "package", "check"
  color: 'success' | 'warning' | 'danger' | 'info';
}

// 👥 Utilisateur récent pour dashboard
export interface RecentUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  avatar?: string;
  role: string;
}

// 📦 Annonce récente pour dashboard
export interface RecentListing {
  id: number;
  title: string;
  type: 'LOST' | 'FOUND';
  category: string;
  city: string;
  createdAt: string;
  status: string;
  userName: string;
}

// 🎯 Action admin récente
export interface RecentAction {
  id: number;
  type: 'USER_BLOCKED' | 'LISTING_ARCHIVED' | 'LISTING_DELETED' | 'USER_UNBLOCKED';
  description: string;
  adminName: string;
  targetType: 'user' | 'listing';
  targetId: number;
  createdAt: string;
}