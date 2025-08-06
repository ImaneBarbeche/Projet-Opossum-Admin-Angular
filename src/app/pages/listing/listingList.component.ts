import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
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
  selector: 'app-listing-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './listingList.component.html',
  styleUrls: ['./listingList.component.css']
})
export class ListingListComponent implements OnInit {
  private readonly snackBar = inject(MatSnackBar);
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

  // Liste filtrée côté client (recherche, statuts, type, catégorie)
  filteredListings = computed(() => {
    let result = this.listings();
    // Filtrage recherche texte (titre, description)
    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      result = result.filter(l =>
        (l.title && l.title.toLowerCase().includes(search)) ||
        (l.description && l.description.toLowerCase().includes(search))
      );
    }
    // Statut
    if (this.selectedStatus() !== 'ALL') {
      result = result.filter(l => l.status === this.selectedStatus());
    }
    // Type
    if (this.selectedType() !== 'ALL') {
      result = result.filter(l => l.type === this.selectedType());
    }
    // Catégorie
    if (this.selectedCategory() !== 'ALL') {
      result = result.filter(l => this.normalizeCategory(l.category) === this.selectedCategory());
    }
    // Archivées/supprimées (admin)
    if (!this.includeArchived()) {
      result = result.filter(l => l.status !== ListingStatus.ARCHIVED);
    }
    if (!this.includeDeleted()) {
      result = result.filter(l => l.status !== ListingStatus.DELETED);
    }
    return result;
  });


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
      search: this.searchTerm() || undefined,
      includeArchived: this.includeArchived(),
      includeDeleted: this.includeDeleted()
    };
    this.listingService.getAllListings(filters).subscribe({
      next: (response) => {
        this.listings.set(response.data?.listings || []);
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
    // Pas de rechargement API à chaque frappe, filtrage local
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

  getCategoryLabel(category: ListingCategory): string {
    switch (category) {
      case ListingCategory.ELECTRONICS: return 'Électronique';
      case ListingCategory.CLOTHING: return 'Vêtements';
      case ListingCategory.ACCESSORIES: return 'Accessoires';
      case ListingCategory.DOCUMENTS: return 'Documents';
      case ListingCategory.KEYS: return 'Clés';
      case ListingCategory.BAGS: return 'Sacs';
      case ListingCategory.JEWELRY: return 'Bijoux';
      case ListingCategory.PETS: return 'Animaux';
      case ListingCategory.OTHER: return 'Autre';
      default: return 'Inconnu';
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
      this.listingService.updateListingStatus(Number(listing.id), ListingStatus.RESOLVED).subscribe({
        next: () => {
          this.loadListings();
          this.snackBar.open('✅ Annonce marquée comme résolue', 'Fermer', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erreur lors de la résolution:', error);
          this.snackBar.open('❌ Erreur lors de la résolution de l\'annonce', 'Fermer', { duration: 3000 });
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
      this.listingService.archiveListing(Number(listing.id)).subscribe({
        next: () => {
          this.loadListings();
          this.snackBar.open('📦 Annonce archivée', 'Fermer', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erreur lors de l\'archivage:', error);
          this.snackBar.open('❌ Erreur lors de l\'archivage de l\'annonce', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  deleteListing(listing: Listing): void {
    if (confirm('⚠️ ATTENTION ! Supprimer définitivement cette annonce ?')) {
      this.listingService.deleteListing(Number(listing.id)).subscribe({
        next: () => {
          this.loadListings();
          this.snackBar.open('🗑️ Annonce supprimée', 'Fermer', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('❌ Erreur lors de la suppression de l\'annonce', 'Fermer', { duration: 3000 });
        }
      });
    }
  }
  // Réactiver une annonce (RESOLVED → ACTIVE : Admin uniquement)
  reactivateListing(listing: Listing): void {
    if (!this.canReactivate(listing)) return;

    if (confirm('Réactiver cette annonce résolue ?')) {
      this.listingService.updateListingStatus(Number(listing.id), ListingStatus.ACTIVE).subscribe({
        next: () => {
          this.loadListings();
          this.snackBar.open('✅ Annonce réactivée', 'Fermer', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erreur lors de la réactivation:', error);
          this.snackBar.open('❌ Erreur lors de la réactivation de l\'annonce', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  // Voir détails
  viewListingDetails(listing: Listing): void {
    // Navigation vers la page de détail : id string (UUID ou nombre)
    if (listing.id) {
      this.router.navigate(['/annonces', listing.id]);
    }
    // sinon, ne rien faire ou afficher une erreur
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
    // listing.user_id et currentUser.id sont des string
    return currentUser ? currentUser.id === listing.user_id : false;
  }
  // ✅ Utilitaires
  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }
  // Normaliser la catégorie (string venant de l'API ou d'une source externe)
  public normalizeCategory(category: string): ListingCategory {
    switch (category?.toUpperCase()) {
      case 'ELECTRONICS': return ListingCategory.ELECTRONICS;
      case 'CLOTHING': return ListingCategory.CLOTHING;
      case 'ACCESSORIES': return ListingCategory.ACCESSORIES;
      case 'DOCUMENTS': return ListingCategory.DOCUMENTS;
      case 'KEYS': return ListingCategory.KEYS;
      case 'BAGS': return ListingCategory.BAGS;
      case 'JEWELRY': return ListingCategory.JEWELRY;
      case 'PETS': return ListingCategory.PETS;
      case 'OTHER': return ListingCategory.OTHER;
      case 'ACCESSOIRES': return ListingCategory.ACCESSORIES;
      case 'BAGAGES': return ListingCategory.BAGS;
      case 'BIJOUX': return ListingCategory.JEWELRY;
      case 'ÉLECTRONIQUE': return ListingCategory.ELECTRONICS;
      case 'VÊTEMENTS': return ListingCategory.CLOTHING;
      default: return ListingCategory.OTHER;
    }
  }
}
