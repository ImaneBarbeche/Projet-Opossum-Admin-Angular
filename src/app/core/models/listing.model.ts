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
  user_id: number;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  contact_email: string;
  contact_phone?: string;
  photo_url?: string;
  category: ListingCategory;  
  type: ListingType;
  status: ListingStatus;
  is_lost: boolean;
  resolved_at?: Date;
  created_at: Date;
  updated_at: Date;
  
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