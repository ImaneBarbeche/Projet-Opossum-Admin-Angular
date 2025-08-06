import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Listing, ListingFilters, ListingResponse, ListingStatus, ListingDetail } from '../models/listing.model';

@Injectable({
  providedIn: 'root'
})
export class ListingService {
  private apiUrl = `${environment.apiUrl}/admin/announcements`;

  constructor(private http: HttpClient) {}

  // Récupérer toutes les annonces avec filtres
  getAllListings(filters?: ListingFilters): Observable<ListingResponse> {
    let params = new HttpParams();
    
    // Puisque le backend retourne toutes les annonces sans filtrage,
    // on se contente d'envoyer les paramètres de pagination
    params = params.set('page', '0');
    params = params.set('size', '100'); // Récupérer plus d'annonces pour avoir toutes les données
    
    // Note: Le backend actuel ignore les filtres status/type/category
    // Le filtrage est fait côté frontend dans le component

    return this.http.get<ListingResponse>(`${this.apiUrl}`, { 
      params,
      withCredentials: true 
    });
  }

  // Récupérer une annonce par ID (id string/UUID)
  getListingById(id: string): Observable<ListingDetail> {
    return this.http.get<{ data: ListingDetail }>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    }).pipe(map(res => res.data));
  }

  // Bloquer une annonce
  blockListing(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/block`, {}, {
      withCredentials: true
    });
  }

  // Débloquer une annonce
  unblockListing(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/unblock`, {}, {
      withCredentials: true
    });
  }

  // Supprimer une annonce (soft delete)
  deleteListing(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/delete`, {
      withCredentials: true
    });
  }

  // Changer le statut d'une annonce (RESOLVED, ARCHIVED)
  updateListingStatus(id: string, status: ListingStatus): Observable<Listing> {
    return this.http.put<Listing>(`${this.apiUrl}/${id}/status`, { status }, {
      withCredentials: true
    });
  }
}