import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ListingService } from '../../core/services/listing.service';
import { Listing, ListingCategory, ListingStatus, ListingType } from '../../core/models/listing.model';

@Component({
  selector: 'app-annonce-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './annonce-list.component.html',
  styleUrl: './annonce-list.component.css'
})
export class AnnonceListComponent implements OnInit {
  listings: Listing[] = [];
  filteredListings: Listing[] = [];
  isLoading = true;

  // Accès aux enums dans le template
  readonly ListingStatus = ListingStatus;
  readonly ListingType = ListingType;
  readonly ListingCategory = ListingCategory;

  // Filtres et recherche
  searchTerm = '';
  statusFilter: 'all' | ListingStatus = 'all';
  typeFilter: 'all' | ListingType = 'all';
  categoryFilter: 'all' | ListingCategory = 'all';

  // Pagination
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 0;
  totalFiltered = 0;

  // Statistiques
  get totalListings(): number { return this.listings.length; }
  get allListings(): number { return this.listings.length; }
  get activeListings(): number { return this.listings.filter(l => l.status === ListingStatus.ACTIVE).length; }
  get pendingListings(): number { return this.listings.filter(l => l.status === ListingStatus.PENDING).length; }
  get resolvedListings(): number { return this.listings.filter(l => l.status === ListingStatus.RESOLVED).length; }

  constructor(
    private readonly router: Router,
    private readonly listingService: ListingService
  ) {}

  ngOnInit(): void {
    this.loadListings();
  }

  loadListings(): void {
    this.isLoading = true;
    this.listingService.getAllListings().subscribe({
      next: (listings) => {
        this.listings = listings;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des annonces:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.listings];

    // Filtre par recherche textuelle
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(term) ||
        listing.description.toLowerCase().includes(term) ||
        listing.city.toLowerCase().includes(term)
      );
    }

    // Filtre par statut
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(listing => listing.status === this.statusFilter);
    }

    // Filtre par type
    if (this.typeFilter !== 'all') {
      filtered = filtered.filter(listing => listing.type === this.typeFilter);
    }

    // Filtre par catégorie
    if (this.categoryFilter !== 'all') {
      filtered = filtered.filter(listing => listing.category === this.categoryFilter);
    }

    this.totalFiltered = filtered.length;
    this.totalPages = Math.ceil(this.totalFiltered / this.itemsPerPage);
    
    // Pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.filteredListings = filtered.slice(startIndex, startIndex + this.itemsPerPage);

    // Ajuster la page courante si nécessaire
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
      this.applyFilters();
    }
  }

  setStatusFilter(status: 'all' | ListingStatus): void {
    this.statusFilter = status;
    this.currentPage = 1;
    this.applyFilters();
  }

  setTypeFilter(type: 'all' | ListingType): void {
    this.typeFilter = type;
    this.currentPage = 1;
    this.applyFilters();
  }

  // Actions sur les annonces
  viewListing(listingId: number): void {
    this.router.navigate(['/annonces', listingId]);
  }

  approveListing(listingId: number): void {
    if (confirm('Approuver cette annonce ?')) {
      this.listingService.updateListingStatus(listingId, ListingStatus.ACTIVE).subscribe({
        next: () => {
          this.loadListings();
        },
        error: (error) => {
          console.error('Erreur lors de l\'approbation:', error);
          alert('Erreur lors de l\'approbation de l\'annonce');
        }
      });
    }
  }

  rejectListing(listingId: number): void {
    if (confirm('Rejeter cette annonce ?')) {
      this.listingService.updateListingStatus(listingId, ListingStatus.REJECTED).subscribe({
        next: () => {
          this.loadListings();
        },
        error: (error) => {
          console.error('Erreur lors du rejet:', error);
          alert('Erreur lors du rejet de l\'annonce');
        }
      });
    }
  }

  markAsResolved(listingId: number): void {
    if (confirm('Marquer cette annonce comme résolue ?')) {
      this.listingService.updateListingStatus(listingId, ListingStatus.RESOLVED).subscribe({
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

  archiveListing(listingId: number): void {
    if (confirm('Archiver cette annonce ?')) {
      this.listingService.updateListingStatus(listingId, ListingStatus.ARCHIVED).subscribe({
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

  deleteListing(listingId: number): void {
    if (confirm('⚠️ ATTENTION ! Supprimer définitivement cette annonce ? Cette action est irréversible.')) {
      this.listingService.deleteListing(listingId).subscribe({
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

  // Méthodes d'affichage
  getCategoryIcon(category: ListingCategory): string {
    switch (category) {
      case ListingCategory.ELECTRONICS: return '📱';
      case ListingCategory.CLOTHING: return '👕';
      case ListingCategory.DOCUMENTS: return '📄';
      case ListingCategory.PETS: return '🐕';
      case ListingCategory.VEHICLES: return '🚲';
      case ListingCategory.OTHER: return '🔧';
      default: return '📦';
    }
  }

  getCategoryDisplay(category: ListingCategory): string {
    switch (category) {
      case ListingCategory.ELECTRONICS: return 'Électronique';
      case ListingCategory.CLOTHING: return 'Vêtements';
      case ListingCategory.DOCUMENTS: return 'Documents';
      case ListingCategory.PETS: return 'Animaux';
      case ListingCategory.VEHICLES: return 'Véhicules';
      case ListingCategory.OTHER: return 'Autres';
      default: return category;
    }
  }

  getStatusDisplay(status: ListingStatus): string {
    switch (status) {
      case ListingStatus.PENDING: return '⏳ En attente';
      case ListingStatus.ACTIVE: return '✅ Active';
      case ListingStatus.RESOLVED: return '🎯 Résolue';
      case ListingStatus.REJECTED: return '❌ Rejetée';
      case ListingStatus.ARCHIVED: return '📦 Archivée';
      default: return status;
    }
  }

  getUserName(userId: number): string {
    // En attendant l'intégration complète, on retourne un placeholder
    return `Utilisateur ${userId}`;
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  // Méthodes de pagination
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    let start = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let end = Math.min(this.totalPages, start + maxVisiblePages - 1);
    
    if (end - start < maxVisiblePages - 1) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getDisplayStart(): number {
    if (this.totalFiltered === 0) return 0;
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getDisplayEnd(): number {
    const end = this.currentPage * this.itemsPerPage;
    return Math.min(end, this.totalFiltered);
  }

  getTotalFiltered(): number {
    return this.totalFiltered;
  }
}
