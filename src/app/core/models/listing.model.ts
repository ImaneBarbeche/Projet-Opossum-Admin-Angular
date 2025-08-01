// Interface conforme au détail d'annonce backend
export interface ListingDetail {
  id: string;
  title: string;
  description: string;
  category: 'ELECTRONICS' | 'CLOTHING' | 'ACCESSORIES' | 'DOCUMENTS' | 'KEYS' | 'BAGS' | 'JEWELRY' | 'PETS' | 'OTHER';
  type: 'LOST' | 'FOUND';
  status: 'ACTIVE' | 'RESOLVED' | 'ARCHIVED' | 'DELETED' | 'REJECTED' | 'PENDING';
  location: {
    latitude: number | null;
    longitude: number | null;
    address: string | null;
    city: string | null;
  };
  imageUrls: string[];
  photoUrl: string | null;
  thumbnailUrl: string | null;
  contactInfo: {
    phone: string | null;
    email: string | null;
  };
  user: {
    id: string | null;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
    createdAt: string | null;
  };
  createdAt: string | null;
  updatedAt: string | null;
  resolvedAt?: string | null;
}
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

// Interface : structure exacte de nos objets Listing
export interface Listing {
  id: string; // toujours string (même si backend number)
  title: string;
  description: string;
  user_id: string; // string pour cohérence Angular (même si backend number)
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  contact_email: string;
  contact_phone?: string;
  photo_url?: string;
  images?: string[]; // Ajout pour compatibilité mock
  category: ListingCategory;
  type: ListingType;
  status: ListingStatus;
  is_lost: boolean;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

// Interface pour les filtres de recherche
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

// Interface pour la réponse API attendue
export interface ListingResponse {
  data: {
    listings: Listing[];
    total: number;
    page: number;
    limit: number;
  };
  success: boolean;
  timestamp: string;
}