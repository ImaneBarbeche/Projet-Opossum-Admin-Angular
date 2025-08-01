import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Listing, ListingFilters, ListingResponse, ListingStatus } from '../models/listing.model';

@Injectable({
  providedIn: 'root'
})
export class ListingService {
  private apiUrl = `${environment.apiUrl}/listings`;

  constructor(private http: HttpClient) {}

  // Récupérer toutes les annonces avec filtres
  getAllListings(filters?: ListingFilters): Observable<ListingResponse> {
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
      if (filters.limit) {
        params = params.set('limit', filters.limit.toString());
      }
      if (filters.offset) {
        params = params.set('offset', filters.offset.toString());
      }
    }

    return this.http.get<ListingResponse>(`${this.apiUrl}/all`, { 
      params,
      withCredentials: true 
    });
  }

  // Récupérer une annonce par ID
  getListingById(id: number): Observable<Listing> {
    return this.http.get<Listing>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }

  // Bloquer une annonce
  blockListing(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/block`, {}, {
      withCredentials: true
    });
  }

  // Débloquer une annonce
  unblockListing(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/unblock`, {}, {
      withCredentials: true
    });
  }

  // Supprimer une annonce
  deleteListing(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }

  // Archiver une annonce
  archiveListing(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/archive`, {}, {
      withCredentials: true
    });
  }

  // Changer le statut d'une annonce
  updateListingStatus(id: number, status: ListingStatus): Observable<Listing> {
    return this.http.patch<Listing>(`${this.apiUrl}/${id}/status`, { status }, {
      withCredentials: true
    });
  }
}