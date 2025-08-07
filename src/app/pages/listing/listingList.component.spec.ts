import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { ListingListComponent } from './listingList.component';
import { ListingService } from '../../core/services/listing.service';
import { AuthService } from '../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ListingStatus, ListingType, ListingCategory } from '../../core/models/listing.model';

const mockListings = [
  {
    id: '1',
    title: 'Sac perdu',
    description: 'Sac noir perdu à la gare',
    status: ListingStatus.ACTIVE,
    type: ListingType.LOST,
    category: ListingCategory.BAGS,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'u1',
    resolved_at: undefined,
    address: '1 rue de Paris',
    city: 'Paris',
    contact_email: 'user1@email.com',
    is_lost: true,
    phone: '',
    images: [],
    deleted_at: undefined,
    archived_at: undefined
  },
  {
    id: '2',
    title: 'Clés trouvées',
    description: 'Trousseau de clés trouvé',
    status: ListingStatus.RESOLVED,
    type: ListingType.FOUND,
    category: ListingCategory.KEYS,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'u2',
    resolved_at: new Date().toISOString(),
    address: '2 avenue de Lyon',
    city: 'Lyon',
    contact_email: 'user2@email.com',
    is_lost: false,
    phone: '',
    images: [],
    deleted_at: undefined,
    archived_at: undefined
  }
];

describe('ListingListComponent', () => {
  let component: ListingListComponent;
  let fixture: ComponentFixture<ListingListComponent>;
  let listingServiceSpy: jasmine.SpyObj<ListingService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    listingServiceSpy = jasmine.createSpyObj('ListingService', ['getAllListings', 'updateListingStatus', 'deleteListing']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAdmin', 'getCurrentUser']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    listingServiceSpy.getAllListings.and.returnValue(of({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        listings: mockListings,
        total: mockListings.length,
        page: 1,
        limit: 10
      }
    }));
    authServiceSpy.isAdmin.and.returnValue(true);
    authServiceSpy.getCurrentUser.and.returnValue({
      id: 'u1',
      email: 'user1@email.com',
      firstName: 'User',
      lastName: 'One',
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      emailVerified: true,
      active: true
    });

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ListingListComponent],
      providers: [
        { provide: ListingService, useValue: listingServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load listings on init', () => {
    expect(component.listings().length).toBe(2);
    expect(component.isLoading()).toBeFalse();
  });

  it('should filter listings by status', () => {
    component.selectedStatus.set(ListingStatus.ACTIVE);
    expect(component.filteredListings().length).toBe(1);
    expect(component.filteredListings()[0].status).toBe(ListingStatus.ACTIVE);
  });

  it('should call markAsResolved and reload listings', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    listingServiceSpy.updateListingStatus.and.returnValue(of(mockListings[0]));
    component.markAsResolved(mockListings[0]);
    expect(listingServiceSpy.updateListingStatus).toHaveBeenCalledWith('1', ListingStatus.RESOLVED);
    expect(snackBarSpy.open).toHaveBeenCalled();
  });

  it('should call archiveListing and reload listings', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    listingServiceSpy.updateListingStatus.and.returnValue(of(mockListings[0]));
    component.archiveListing(mockListings[0]);
    expect(listingServiceSpy.updateListingStatus).toHaveBeenCalledWith('1', ListingStatus.ARCHIVED);
    expect(snackBarSpy.open).toHaveBeenCalled();
  });

  it('should call deleteListing and reload listings', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    listingServiceSpy.deleteListing.and.returnValue(of(undefined));
    component.deleteListing(mockListings[0]);
    expect(listingServiceSpy.deleteListing).toHaveBeenCalledWith('1');
    expect(snackBarSpy.open).toHaveBeenCalled();
  });

  it('should call reactivateListing if canReactivate', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    listingServiceSpy.updateListingStatus.and.returnValue(of(mockListings[1]));
    component.reactivateListing({ ...mockListings[1], status: ListingStatus.RESOLVED });
    expect(listingServiceSpy.updateListingStatus).toHaveBeenCalledWith('2', ListingStatus.ACTIVE);
    expect(snackBarSpy.open).toHaveBeenCalled();
  });

  it('should navigate to details', () => {
    component.viewListingDetails(mockListings[0]);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/annonces', '1']);
  });

  it('should compute stats correctly', () => {
    expect(component.stats().total).toBe(2);
    expect(component.stats().active).toBe(1);
    expect(component.stats().resolved).toBe(1);
  });
});
