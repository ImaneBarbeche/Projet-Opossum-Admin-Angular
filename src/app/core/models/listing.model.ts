// Enums : valeurs fixes autorisées
export enum ListingStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING'
}

export enum ListingType {
  LOST = 'LOST',
  FOUND = 'FOUND'
}

export enum ListingCategory {
  ELECTRONICS = 'ELECTRONICS',
  CLOTHING = 'CLOTHING',
  ACCESSORIES = 'ACCESSORIES',
  DOCUMENTS = 'DOCUMENTS',
  KEYS = 'KEYS',
  BAGS = 'BAGS',
  JEWELRY = 'JEWELRY',
  PETS = 'PETS',
  OTHER = 'OTHER'
}

// Interface : structure exacte de nos objets
export interface Listing {
  id: number;
  title: string;
  description: string;
  type: ListingType;
  category: ListingCategory;
  status: ListingStatus;
  user_id: number;
  address: string;
  city: string;
  contact_email: string;
  contact_phone?: string;
  latitude?: number;
  longitude?: number;
  photo_url?: string;
  created_at: Date;
  updated_at: Date;
  resolved_at?: Date;
  is_lost: boolean; // Correspond à votre colonne BDD
}

// Interface pour les filtres
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

// Interface pour les réponses API
export interface ListingResponse {
  listings: Listing[];
  total: number;
  page: number;
  limit: number;
}