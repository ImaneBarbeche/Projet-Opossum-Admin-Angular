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
  private readonly snackBar = inject(MatSnackBar);
  private readonly route = inject(ActivatedRoute);
  private readonly listingService = inject(ListingService);
  private readonly router = inject(Router);

  listing: ListingDetail | null = null;
  isLoading = true;
  error: string | null = null;

  readonly ListingStatus = ListingStatus;
  readonly ListingType = ListingType;
  readonly ListingCategory = ListingCategory;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.listingService.getListingById(id).subscribe({
        next: (listing) => {
          this.listing = listing;
          this.isLoading = false;
        },
        error: () => {
          this.error = "Erreur lors du chargement de l'annonce.";
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
    if (!this.listing) return;
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
    if (!this.listing) return;
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
    if (!this.listing) return;
    this.isLoading = true;
    this.listingService.getListingById(String(this.listing.id)).subscribe({
      next: (listing) => {
        this.listing = listing;
        this.isLoading = false;
      },
      error: () => {
        this.error = "Erreur lors du rechargement de l'annonce.";
        this.isLoading = false;
      }
    });
  }

}
