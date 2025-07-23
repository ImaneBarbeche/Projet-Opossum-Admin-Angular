import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { 
  Listing, 
  ListingStatus, 
  ListingType, 
  ListingCategory, 
  ListingFilters 
} from '../models/listing.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ListingService {
  private readonly apiUrl = `${environment.apiUrl}/listings`;
  private readonly http = inject(HttpClient);

  // State management des filtres
  private readonly filtersSubject = new BehaviorSubject<ListingFilters>({
    status: 'ALL',
    type: 'ALL',
    category: 'ALL',
    includeArchived: false,
    includeDeleted: false
  });
  
  readonly filters$ = this.filtersSubject.asObservable();

  // ✅ GET LISTINGS avec filtres
  getListings(filters?: ListingFilters): Observable<Listing[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.status && filters.status !== 'ALL') {
        params = params.set('status', filters.status);
      }
      if (filters.type && filters.type !== 'ALL') {
        params = params.set('type', filters.type);
      }
      if (filters.category && filters.category !== 'ALL') {
        params = params.set('category', filters.category);
      }
      if (filters.city) {
        params = params.set('city', filters.city);
      }
      if (filters.search) {
        params = params.set('search', filters.search);
      }
      if (filters.includeArchived) {
        params = params.set('includeArchived', 'true');
      }
      if (filters.includeDeleted) {
        params = params.set('includeDeleted', 'true');
      }
      if (filters.limit) {
        params = params.set('limit', filters.limit.toString());
      }
      if (filters.offset) {
        params = params.set('offset', filters.offset.toString());
      }
    }
    
    return this.http.get<Listing[]>(this.apiUrl, { 
      params,
      withCredentials: true 
    });
  }

  // ✅ MARQUER COMME RÉSOLU
  markAsResolved(id: number, resolvedBy?: string): Observable<Listing> {
    return this.http.patch<Listing>(`${this.apiUrl}/${id}/resolve`, {
      resolved_by: resolvedBy,
      resolved_at: new Date().toISOString()
    }, {
      withCredentials: true
    });
  }

  // ✅ ARCHIVER (Admin seulement)
  archiveListing(id: number, reason?: string): Observable<Listing> {
    return this.http.patch<Listing>(`${this.apiUrl}/${id}/archive`, {
      archive_reason: reason || 'Archivé par l\'administrateur',
      archived_at: new Date().toISOString()
    }, {
      withCredentials: true
    });
  }

  // ✅ SUPPRIMER (Soft delete)
  deleteListing(id: number, reason?: string): Observable<Listing> {
    return this.http.patch<Listing>(`${this.apiUrl}/${id}/delete`, {
      delete_reason: reason,
      deleted_at: new Date().toISOString()
    }, {
      withCredentials: true
    });
  }

  // 🔍 GET LISTING BY ID
  getListingById(id: number): Observable<Listing> {
    return this.http.get<Listing>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }

  // ➕ CREATE NEW LISTING
  createListing(listing: Omit<Listing, 'id' | 'created_at' | 'updated_at' | 'status'>): Observable<Listing> {
    return this.http.post<Listing>(this.apiUrl, {
      ...listing,
      status: ListingStatus.ACTIVE
    }, {
      withCredentials: true
    });
  }

  // ✏️ UPDATE LISTING
  updateListing(id: number, listing: Partial<Omit<Listing, 'id' | 'status' | 'created_at' | 'updated_at'>>): Observable<Listing> {
    return this.http.put<Listing>(`${this.apiUrl}/${id}`, listing, {
      withCredentials: true
    });
  }

  // 🔄 Gestion des filtres
  updateFilters(filters: Partial<ListingFilters>): void {
    const currentFilters = this.filtersSubject.value;
    this.filtersSubject.next({ ...currentFilters, ...filters });
  }

  getCurrentFilters(): ListingFilters {
    return this.filtersSubject.value;
  }

  // 🔎 RECHERCHE
  searchListings(query: string, includeArchived: boolean = false): Observable<Listing[]> {
    let params = new HttpParams()
      .set('q', query)
      .set('includeArchived', includeArchived.toString());
    
    return this.http.get<Listing[]>(`${this.apiUrl}/search`, { 
      params,
      withCredentials: true 
    });
  }
}