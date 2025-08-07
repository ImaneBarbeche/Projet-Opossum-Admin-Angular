import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ListingDetailComponent } from './listing-detail.component';
import { ListingService } from '../../core/services/listing.service';
import { ListingDetail, ListingStatus, ListingType, ListingCategory } from '../../core/models/listing.model';

const mockListing: ListingDetail = {
  id: '1',
  title: 'Sac perdu',
  description: 'Sac noir perdu à la gare',
  status: ListingStatus.ACTIVE,
  type: ListingType.LOST,
  category: ListingCategory.BAGS,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  user: {
    id: 'u1',
    firstName: 'User',
    lastName: 'One',
    avatar: null,
    createdAt: new Date().toISOString()
  },
  resolvedAt: undefined,
  location: {
    latitude: 48.8566,
    longitude: 2.3522,
    address: '1 rue de Paris',
    city: 'Paris'
  },
  imageUrls: [],
  photoUrl: '',
  thumbnailUrl: '',
  contactInfo: {
    phone: '0102030405',
    email: 'user1@email.com'
  }
};

describe('ListingDetailComponent', () => {
  let component: ListingDetailComponent;
  let fixture: ComponentFixture<ListingDetailComponent>;
  let listingServiceSpy: jasmine.SpyObj<ListingService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteStub: Partial<ActivatedRoute>;

  beforeEach(async () => {
    listingServiceSpy = jasmine.createSpyObj('ListingService', [
      'getListingById', 'blockListing', 'unblockListing'
    ]);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    activatedRouteStub = {
      snapshot: {
        paramMap: {
          get: (key: string) => key === 'id' ? '1' : null,
          has: (key: string) => key === 'id',
          getAll: (key: string) => key === 'id' ? ['1'] : [],
          keys: ['id']
        },
        url: [],
        params: {},
        queryParams: {},
        fragment: '',
        data: {},
        outlet: '',
        component: null,
        routeConfig: null,
        root: null as any,
        parent: null,
        firstChild: null,
        children: [],
        pathFromRoot: [],
        queryParamMap: {
          get: () => null,
          has: () => false,
          getAll: () => [],
          keys: []
        },
        title: ''
      }
    };

    listingServiceSpy.getListingById.and.returnValue(of(mockListing));

    await TestBed.configureTestingModule({
      imports: [ListingDetailComponent],
      providers: [
        { provide: ListingService, useValue: listingServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load listing on init', () => {
    expect(component.listing).toEqual(mockListing);
    expect(component.isLoading).toBeFalse();
    expect(component.error).toBeNull();
  });

  it('should show error if getListingById fails', () => {
    listingServiceSpy.getListingById.and.returnValue(throwError(() => new Error('fail')));
    component.ngOnInit();
    expect(component.error).toBeTruthy();
    expect(component.isLoading).toBeFalse();
  });

  it('should show error if id param is missing', () => {
    (activatedRouteStub.snapshot!.paramMap.get as jasmine.Spy) = jasmine.createSpy().and.returnValue(null);
    component.ngOnInit();
    expect(component.error).toContain('ID');
    expect(component.isLoading).toBeFalse();
  });

  it('should navigate back on goBack()', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/annonces']);
  });

  it('should block listing and reload on success', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    listingServiceSpy.blockListing.and.returnValue(of(undefined));
    listingServiceSpy.getListingById.and.returnValue(of(mockListing));
    component.listing = mockListing;
    component.blockListing();
    expect(listingServiceSpy.blockListing).toHaveBeenCalledWith('1');
    expect(snackBarSpy.open).toHaveBeenCalledWith('Annonce bloquée', 'Fermer', { duration: 3000 });
  });

  it('should show error if blockListing fails', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    listingServiceSpy.blockListing.and.returnValue(throwError(() => new Error('fail')));
    component.listing = mockListing;
    component.blockListing();
    expect(snackBarSpy.open).toHaveBeenCalledWith('Erreur lors du blocage', 'Fermer', { duration: 3000 });
  });

  it('should unblock listing and reload on success', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    listingServiceSpy.unblockListing = jasmine.createSpy().and.returnValue(of(undefined));
    listingServiceSpy.getListingById.and.returnValue(of(mockListing));
    component.listing = mockListing;
    component.unblockListing();
    expect(listingServiceSpy.unblockListing).toHaveBeenCalledWith('1');
    expect(snackBarSpy.open).toHaveBeenCalledWith('Annonce débloquée', 'Fermer', { duration: 3000 });
  });

  it('should show error if unblockListing fails', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    listingServiceSpy.unblockListing = jasmine.createSpy().and.returnValue(throwError(() => new Error('fail')));
    component.listing = mockListing;
    component.unblockListing();
    expect(snackBarSpy.open).toHaveBeenCalledWith('Erreur lors du déblocage', 'Fermer', { duration: 3000 });
  });
});
