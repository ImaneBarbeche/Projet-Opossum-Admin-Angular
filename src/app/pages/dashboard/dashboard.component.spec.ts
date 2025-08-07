import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { StatsService } from '../../core/services/stats.service';

const mockStats = {
  users: { total: 100, active: 80, newThisMonth: 10 },
  announcements: { total: 50, active: 30, lost: 20, found: 10, resolved: 5 },
  files: { totalCount: 12, activeCount: 10, totalSize: '5 MB' },
  resolutionRate: 0.8
};

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let statsServiceSpy: jasmine.SpyObj<StatsService>;

  beforeEach(async () => {
    statsServiceSpy = jasmine.createSpyObj('StatsService', ['getDashboardStats']);
    statsServiceSpy.getDashboardStats.and.returnValue(of(mockStats));
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, DashboardComponent],
      providers: [
        { provide: StatsService, useValue: statsServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load stats on init', () => {
    statsServiceSpy.getDashboardStats.and.returnValue(of(mockStats));
    component.loadStats();
    expect(component.isLoading()).toBeFalse();
    expect(component.stats()).toEqual(mockStats as any);
    expect(component.hasData()).toBeTrue();
  });

  it('should handle error on stats load', () => {
    statsServiceSpy.getDashboardStats.and.returnValue(throwError(() => new Error('fail')));
    component.loadStats();
    expect(component.error()).toContain('Erreur de chargement');
    expect(component.isLoading()).toBeFalse();
  });

  it('should compute stats correctly', () => {
    component.stats.set(mockStats as any);
    expect(component.totalUsers()).toBe(100);
    expect(component.activeUsers()).toBe(80);
    expect(component.newUsersThisMonth()).toBe(10);
    expect(component.totalAnnouncements()).toBe(50);
    expect(component.activeAnnouncements()).toBe(30);
    expect(component.lostItems()).toBe(20);
    expect(component.foundItems()).toBe(10);
    expect(component.resolvedItems()).toBe(5);
    expect(component.totalFiles()).toBe(12);
    expect(component.totalFileSize()).toBe('5 MB');
    expect(component.resolutionRate()).toBe(0.8);
  });
});
