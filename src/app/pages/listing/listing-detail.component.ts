import { Component, OnInit, inject } from '@angular/core';
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
}
