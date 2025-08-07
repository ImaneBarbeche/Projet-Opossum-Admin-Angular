import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { StatsService } from './stats.service';
import { DashboardStats } from '../models/stats.model';
import { environment } from '../../../environments/environment';

describe('StatsService', () => {
  let service: StatsService;
  let httpMock: HttpTestingController;

  const mockStats: DashboardStats = {
    users: {
      total: 50,
      active: 45,
      newThisMonth: 5
    },
    announcements: {
      total: 100,
      active: 80,
      lost: 60,
      found: 20,
      resolved: 15
    },
    files: {
      totalCount: 10,
      activeCount: 8,
      totalSize: '1GB'
    },
    resolutionRate: 0.75
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StatsService]
    });
    service = TestBed.inject(StatsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get dashboard stats', () => {
    service.getDashboardStats().subscribe(stats => {
      expect(stats).toEqual(mockStats);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/admin/stats`);
    expect(req.request.method).toBe('GET');
    req.flush(mockStats);
  });
});
