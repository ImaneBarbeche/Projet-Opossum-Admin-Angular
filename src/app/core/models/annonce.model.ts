export enum AnnonceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED', // ← Statut archivé
  PENDING = 'PENDING',
  REJECTED = 'REJECTED'
}

export enum AnnonceType {
  LOST = 'LOST',
  FOUND = 'FOUND'
}

export interface Annonce {
  id: string;
  title: string;
  description: string;
  type: AnnonceType;
  status: AnnonceStatus;
  userId: string;
  userName: string;
  userEmail: string;
  location: string;
  dateCreated: Date;
  dateModified: Date;
  imageUrl?: string;
  contactInfo: string;
  archivedAt?: Date;
  archivedBy?: string;
  archiveReason?: string;
}

//  Interface pour les filtres
export interface AnnonceFilters {
  status?: AnnonceStatus | 'ALL';
  type?: AnnonceType | 'ALL';
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  showArchived?: boolean;
}