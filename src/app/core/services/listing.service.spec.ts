import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ListingService } from './listing.service';
import { Listing, ListingDetail, ListingResponse, ListingStatus, ListingType, ListingCategory } from '../models/listing.model';
import { environment } from '../../../environments/environment';

const mockListing: Listing = {
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
  images: [],
};

const mockListingDetail: ListingDetail = {
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
    firstName: 'Alice',
    lastName: 'Dupont',
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

describe('ListingService', () => {
  let service: ListingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ListingService]
    });
    service = TestBed.inject(ListingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all listings', () => {
    const mockResponse: ListingResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        listings: [mockListing],
        total: 1,
        page: 1,
        limit: 10
      }
    };
    service.getAllListings().subscribe(res => {
      expect(res).toEqual(mockResponse);
    });
    const req = httpMock.expectOne(req => req.url === `${environment.apiUrl}/admin/announcements`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get listing by id', () => {
    service.getListingById('1').subscribe(res => {
      expect(res).toEqual(mockListingDetail);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/admin/announcements/1`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockListingDetail });
  });

  it('should block a listing', () => {
    service.blockListing('1').subscribe(res => {
      expect(res).toBeNull();
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/admin/announcements/1/block`);
    expect(req.request.method).toBe('PUT');
    req.flush(null);
  });

  it('should unblock a listing', () => {
    service.unblockListing('1').subscribe(res => {
      expect(res).toBeNull();
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/admin/announcements/1/unblock`);
    expect(req.request.method).toBe('PUT');
    req.flush(null);
  });

  it('should delete a listing', () => {
    service.deleteListing('1').subscribe(res => {
      expect(res).toBeNull();
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/admin/announcements/1/delete`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should update listing status', () => {
    service.updateListingStatus('1', ListingStatus.RESOLVED).subscribe(res => {
      expect(res).toEqual(mockListing);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/admin/announcements/1/status`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ status: ListingStatus.RESOLVED });
    req.flush(mockListing);
  });
});
