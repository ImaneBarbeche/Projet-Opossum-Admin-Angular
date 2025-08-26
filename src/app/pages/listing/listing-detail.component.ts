import { Component, OnInit, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ListingService } from '../../core/services/listing.service';
import { ListingDetail, ListingStatus, ListingType, ListingCategory } from '../../core/models/listing.model';

@Component({
  selector: 'app-listing-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './listing-detail.component.html',
  styleUrls: ['./listing-detail.component.css']
})
export class ListingDetailComponent implements OnInit {
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

  /**
   * Normalise la catégorie reçue du backend (français) vers l'enum Angular (anglais)
   */
  normalizeCategory(category: string): ListingCategory {
    switch (category?.toLowerCase()) {
      case 'électronique': return ListingCategory.ELECTRONICS;
      case 'vêtements': return ListingCategory.CLOTHING;
      case 'accessoires': return ListingCategory.ACCESSORIES;
      case 'documents': return ListingCategory.DOCUMENTS;
      case 'clés': return ListingCategory.KEYS;
      case 'sacs':
      case 'bagages': return ListingCategory.BAGS;
      case 'bijoux': return ListingCategory.JEWELRY;
      case 'animaux': return ListingCategory.PETS;
      case 'autre': return ListingCategory.OTHER;
      default:
        // Si déjà une valeur d'enum, la renvoyer
        if ((Object.values(ListingCategory) as string[]).includes(category)) return category as ListingCategory;
        return ListingCategory.OTHER;
    }
  }

  /**
   * Retourne les images de la galerie sans la photo principale (évite le doublon)
   */
  getGalleryImages(): string[] {
    if (!this.listing) return [];
    if (!this.listing.photoUrl) return this.listing.imageUrls || [];
    return (this.listing.imageUrls || []).filter(img => img !== this.listing?.photoUrl);
  }
  private readonly snackBar = inject(MatSnackBar);
  private readonly route = inject(ActivatedRoute);
  private readonly listingService = inject(ListingService);
  private readonly router = inject(Router);

  listing: ListingDetail | null = null;
  isLoading = true;
  error: string | null = null;
  photoError = false;

  readonly ListingStatus = ListingStatus;
  readonly ListingType = ListingType;
  readonly ListingCategory = ListingCategory;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('Loading listing with ID:', id);
    if (id) {
      this.listingService.getListingById(id).subscribe({
        next: (listing) => {
          console.log('Listing loaded successfully:', listing);
          this.listing = listing;
          this.isLoading = false;
          this.photoError = false;
        },
        error: (error) => {
          console.error('Error loading listing:', error);
          this.error = `Erreur lors du chargement de l'annonce: ${error.error?.error?.message || error.message || 'Erreur inconnue'}`;
          this.isLoading = false;
        }
      });
    } else {
      this.error = "ID d'annonce invalide.";
      this.isLoading = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/annonces']);
  }

  blockListing(): void {
    if (!this.listing || !this.listing.id) return;
    if (confirm('Bloquer cette annonce ?')) {
      this.listingService.blockListing(this.listing.id).subscribe({
        next: () => {
          this.snackBar.open('Annonce bloquée', 'Fermer', { duration: 3000 });
          this.reload();
        },
        error: () => {
          this.snackBar.open('Erreur lors du blocage', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  unblockListing(): void {
    if (!this.listing || !this.listing.id) return;
    if (confirm('Débloquer cette annonce ?')) {
      this.listingService.unblockListing(this.listing.id).subscribe({
        next: () => {
          this.snackBar.open('Annonce débloquée', 'Fermer', { duration: 3000 });
          this.reload();
        },
        error: () => {
          this.snackBar.open('Erreur lors du déblocage', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  private reload(): void {
    if (!this.listing || !this.listing.id) return;
    this.isLoading = true;
    this.listingService.getListingById(String(this.listing.id)).subscribe({
      next: (listing) => {
        this.listing = listing;
        this.isLoading = false;
        this.photoError = false;
      },
      error: () => {
        this.error = "Erreur lors du rechargement de l'annonce.";
        this.isLoading = false;
      }
    });
  }

}
