import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ListingService } from '../../core/services/listing.service';
import { AuthService } from '../../core/services/auth.service';
import { 
  Listing, 
  ListingStatus, 
  ListingType, 
  ListingCategory,
  ListingFilters 
} from '../../core/models/listing.model';

@Component({
  selector: 'app-listingList',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './listingList.component.html',
  styleUrl: './listingList.component.css'
})
export class AnnonceListComponent implements OnInit {
  

  private readonly listingService = inject(ListingService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);


  readonly ListingStatus = ListingStatus;
  readonly ListingType = ListingType;
  readonly ListingCategory = ListingCategory;


  listings = signal<Listing[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  

  searchTerm = signal('');
  selectedStatus = signal<ListingStatus | 'ALL'>('ALL');
  selectedType = signal<ListingType | 'ALL'>('ALL');
  selectedCategory = signal<ListingCategory | 'ALL'>('ALL');
  includeArchived = signal(false);
  includeDeleted = signal(false);


  stats = computed(() => {
    const allListings = this.listings();
    return {
      total: allListings.length,
      active: allListings.filter(l => l.status === ListingStatus.ACTIVE).length,
      resolved: allListings.filter(l => l.status === ListingStatus.RESOLVED).length,
      archived: allListings.filter(l => l.status === ListingStatus.ARCHIVED).length,
      deleted: allListings.filter(l => l.status === ListingStatus.DELETED).length
    };
  });

  ngOnInit(): void {
    this.loadListings();
  }

  // ✅ Méthode isAdmin() que le template utilise
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  // ✅ Chargement des listings
  loadListings(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const filters: ListingFilters = {
      status: this.selectedStatus() !== 'ALL' ? this.selectedStatus() as ListingStatus : undefined,
      type: this.selectedType() !== 'ALL' ? this.selectedType() as ListingType : undefined,
      category: this.selectedCategory() !== 'ALL' ? this.selectedCategory() as ListingCategory : undefined,
      search: this.searchTerm() || undefined
    };

    this.listingService.getAllListings(filters).subscribe({
      next: (response) => {
        this.listings.set(response.listings || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des annonces');
        this.isLoading.set(false);
        console.error('Erreur:', err);
      }
    });
  }

  // ✅ Gestionnaires d'événements du template
  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
    // Optionnel: recherche en temps réel
    // this.loadListings();
  }

  onStatusChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedStatus.set(target.value as ListingStatus | 'ALL');
    this.loadListings();
  }

  onTypeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedType.set(target.value as ListingType | 'ALL');
    this.loadListings();
  }

  onCategoryChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedCategory.set(target.value as ListingCategory | 'ALL');
    this.loadListings();
  }

  toggleArchived(): void {
    this.includeArchived.set(!this.includeArchived());
    this.loadListings();
  }

  toggleDeleted(): void {
    this.includeDeleted.set(!this.includeDeleted());
    this.loadListings();
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set('ALL');
    this.selectedType.set('ALL');
    this.selectedCategory.set('ALL');
    this.includeArchived.set(false);
    this.includeDeleted.set(false);
    this.loadListings();
  }

  // ✅ Méthodes d'affichage utilisées dans le template
  getStatusBadgeClass(status: ListingStatus): string {
    return `status-${status.toLowerCase()}`;
  }

  getStatusIcon(status: ListingStatus): string {
    switch (status) {
      case ListingStatus.ACTIVE: return '✅';
      case ListingStatus.RESOLVED: return '🎉';
      case ListingStatus.ARCHIVED: return '📦';
      case ListingStatus.DELETED: return '🗑️';
      default: return '❓';
    }
  }

  getTypeBadgeClass(type: ListingType): string {
    return `type-${type.toLowerCase()}`;
  }
    getStatusLabel(status: ListingStatus): string {
    switch (status) {
      case ListingStatus.ACTIVE: return 'Active';
      case ListingStatus.RESOLVED: return 'Résolue';
      case ListingStatus.ARCHIVED: return 'Archivée';
      case ListingStatus.DELETED: return 'Supprimée';
      default: return status;
    }
  }

  getCategoryIcon(category: ListingCategory): string {
    switch (category) {
      case ListingCategory.ELECTRONICS: return '📱';
      case ListingCategory.CLOTHING: return '👕';
      case ListingCategory.ACCESSORIES: return '👜';
      case ListingCategory.DOCUMENTS: return '📄';
      case ListingCategory.KEYS: return '🔑';
      case ListingCategory.BAGS: return '🎒';
      case ListingCategory.JEWELRY: return '💍';
      case ListingCategory.PETS: return '🐕';
      case ListingCategory.OTHER: return '📦';
      default: return '❓';
    }
  }

  // ✅ Méthodes de contrôle d'accès
    // Vérifier si peut marquer comme résolu (ACTIVE → RESOLVED)
  canResolve(listing: Listing): boolean {
    return listing.status === ListingStatus.ACTIVE;
  }

  // Vérifier si peut archiver (ACTIVE/RESOLVED → ARCHIVED : Admin uniquement)
  canArchive(listing: Listing): boolean {
    return this.isAdmin() && listing.status !== ListingStatus.ARCHIVED;
  }
  // Vérifier si peut supprimer selon les règles
  canDelete(listing: Listing): boolean {
    return this.isAdmin() && listing.status !== ListingStatus.DELETED;
  }

  // ✅ Actions sur les listings
  // Marquer comme résolu
  markAsResolved(listing: Listing): void {
    if (confirm('Marquer cette annonce comme résolue ?')) {
      this.listingService.updateListingStatus(listing.id, ListingStatus.RESOLVED).subscribe({
        next: () => {
          this.loadListings();
        },
        error: (error) => {
          console.error('Erreur lors de la résolution:', error);
          alert('Erreur lors de la résolution de l\'annonce');
        }
      });
    }
  }
   // Vérifier si peut réactiver (RESOLVED → ACTIVE : Admin uniquement)
  canReactivate(listing: Listing): boolean {
    return this.isAdmin() && listing.status === ListingStatus.RESOLVED;
  }

  archiveListing(listing: Listing): void {
    if (confirm('Archiver cette annonce ?')) {
      this.listingService.archiveListing(listing.id).subscribe({
        next: () => {
          this.loadListings();
        },
        error: (error) => {
          console.error('Erreur lors de l\'archivage:', error);
          alert('Erreur lors de l\'archivage de l\'annonce');
        }
      });
    }
  }

  deleteListing(listing: Listing): void {
    if (confirm('⚠️ ATTENTION ! Supprimer définitivement cette annonce ?')) {
      this.listingService.deleteListing(listing.id).subscribe({
        next: () => {
          this.loadListings();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression de l\'annonce');
        }
      });
    }
  }
   // Réactiver une annonce (RESOLVED → ACTIVE : Admin uniquement)
  reactivateListing(listing: Listing): void {
    if (!this.canReactivate(listing)) return;
    
    if (confirm('Réactiver cette annonce résolue ?')) {
      this.listingService.updateListingStatus(listing.id, ListingStatus.ACTIVE).subscribe({
        next: () => {
          this.loadListings();
        },
        error: (error) => {
          console.error('Erreur lors de la réactivation:', error);
          alert('Erreur lors de la réactivation de l\'annonce');
        }
      });
    }
  }

  // Voir détails
  viewListingDetails(listing: Listing): void {
    // Navigation vers la page de détail
    this.router.navigate(['/admin/listings', listing.id]);
  }

    // ✅ MÉTHODES DE CALCUL DE TEMPS

  // Calculer l'âge de l'annonce
  getListingAge(listing: Listing): string {
    const now = new Date();
    const created = new Date(listing.created_at);
    const diffTime = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `${diffDays} jours`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semaines`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} mois`;
    return `${Math.floor(diffDays / 365)} ans`;
  }

    // Temps de résolution
  getResolutionTime(listing: Listing): string {
    if (!listing.resolved_at) return '';
    
    const created = new Date(listing.created_at);
    const resolved = new Date(listing.resolved_at);
    const diffTime = resolved.getTime() - created.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'le jour même';
    if (diffDays === 1) return 'en 1 jour';
    return `en ${diffDays} jours`;
  }

    // Vérifier si mise à jour récente
  isRecentlyUpdated(listing: Listing): boolean {
    const updated = new Date(listing.updated_at);
    const created = new Date(listing.created_at);
    return updated.getTime() !== created.getTime();
  }

    // Avertissement archivage automatique (6 mois selon règles)
  shouldShowArchiveWarning(listing: Listing): boolean {
    if (listing.status !== ListingStatus.ACTIVE) return false;
    
    const now = new Date();
    const created = new Date(listing.created_at);
    const diffTime = now.getTime() - created.getTime();
    const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30);
    
    return diffMonths >= 5.5; // Avertir à 5.5 mois
  }

    // Vérifier si l'utilisateur est l'auteur de l'annonce
  private isListingAuthor(listing: Listing): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.id === listing.user_id;
  }
  // ✅ Utilitaires
  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }
}