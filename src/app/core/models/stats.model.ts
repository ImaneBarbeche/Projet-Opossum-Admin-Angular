// 📊 Statistiques dashboard admin Opossum
export interface DashboardStats {
  // 👥 Statistiques utilisateurs
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisMonth: number;
  
  // 📦 Statistiques objets perdus/trouvés
  totalListings: number;
  activeLostItems: number;      // Objets perdus non résolus
  activeFoundItems: number;     // Objets trouvés non réclamés
  resolvedToday: number;        // Réunions réussies aujourd'hui
  resolvedThisMonth: number;    // Réunions réussies ce mois
  pendingListings: number;      // En attente de validation
  
  // 📈 Indicateurs de performance
  resolutionRate: number;       // % d'objets effectivement retrouvés
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