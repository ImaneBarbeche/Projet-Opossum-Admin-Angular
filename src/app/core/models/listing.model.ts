// ✅ STATUTS CONFORMES AU DOCUMENT (sans PENDING)
export enum ListingStatus {
  ACTIVE = 'ACTIVE',      // Visible publiquement
  RESOLVED = 'RESOLVED',  // Objet retrouvé
  ARCHIVED = 'ARCHIVED',  // Masqué du public
  DELETED = 'DELETED'     // Soft delete
}

export enum ListingType {
  LOST = 'LOST',   // Objet perdu
  FOUND = 'FOUND'  // Objet trouvé
}

// ✅ CATEGORIES CORRIGÉES (sans VEHICLES)
export enum ListingCategory {
  ELECTRONICS = 'ELECTRONICS',
  CLOTHING = 'CLOTHING',
  ACCESSORIES = 'ACCESSORIES',
  DOCUMENTS = 'DOCUMENTS',
  KEYS = 'KEYS',
  BAGS = 'BAGS',
  JEWELRY = 'JEWELRY',
  PETS = 'PETS',
  VEHICLES = 'VEHICLES',  // ← Ajout si nécessaire
  OTHER = 'OTHER'
}

export interface Listing {
  id: number;
  title: string;
  description: string;
  type: ListingType;
  category: ListingCategory;
  status: ListingStatus;
  user_id: number;
  user_name?: string;
  user_email?: string;
  location: string;
  city: string;
  latitude?: number;
  longitude?: number;
  contact_info: string;
  images?: string[];          // ← Array d'images
  photo_url?: string;         // ← Ajout pour compatibilité
  created_at: Date;
  updated_at: Date;
  
  // Champs pour les statuts
  resolved_at?: Date;
  archived_at?: Date;
  archived_by?: string;
  archive_reason?: string;
  deleted_at?: Date;
  deleted_by?: string;
}

// ✅ FILTRES CORRIGES
export interface ListingFilters {
  status?: ListingStatus | 'ALL';
  type?: ListingType | 'ALL';
  category?: ListingCategory | 'ALL';
  city?: string;
  search?: string;
  includeArchived?: boolean;
  includeDeleted?: boolean;
  limit?: number;
  offset?: number;
}