import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDetailComponent } from './user-detail.component';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';

const mockUser: User = {
  id: 'u1',
  email: 'user1@email.com',
  firstName: 'Alice',
  lastName: 'Dupont',
  avatar: undefined,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  active: true,
  status: 'ACTIVE',
  blockedUntil: null,
  unblockAt: null,
  role: 'USER',
  emailVerified: true
};

describe('UserDetailComponent', () => {
  let component: UserDetailComponent;
  let fixture: ComponentFixture<UserDetailComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteStub: Partial<ActivatedRoute>;

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('UserService', [
      'getUserById', 'blockUser', 'unblockUser', 'deleteUser'
    ]);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    activatedRouteStub = {
      snapshot: {
        paramMap: {
          get: (key: string) => key === 'id' ? 'u1' : null,
          has: (key: string) => key === 'id',
          getAll: (key: string) => key === 'id' ? ['u1'] : [],
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

    userServiceSpy.getUserById.and.returnValue(of(mockUser));

    await TestBed.configureTestingModule({
      imports: [UserDetailComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user on init', () => {
    expect(component.user).toEqual(mockUser);
    expect(component.loading).toBeFalse();
  });

  it('should show error and redirect if getUserById fails', () => {
    userServiceSpy.getUserById.and.returnValue(throwError(() => ({ status: 404, error: {} })));
    component.loadUser('u1');
    expect(snackBarSpy.open).toHaveBeenCalledWith(jasmine.stringMatching('non trouvé'), 'Fermer', { duration: 4000 });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/users']);
  });

  it('should call goBack and navigate', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/users']);
  });

  it('should block and unblock user', () => {
    // Block
    component.user = { ...mockUser, active: true };
    spyOn(window, 'prompt').and.returnValues('motif', '7');
    userServiceSpy.blockUser.and.returnValue(of(undefined));
    userServiceSpy.getUserById.and.returnValue(of(mockUser));
    component.toggleUserStatus();
    expect(userServiceSpy.blockUser).toHaveBeenCalledWith('u1', 7, 'motif');
    expect(snackBarSpy.open).toHaveBeenCalledWith('✅ Utilisateur bloqué avec succès', 'Fermer', { duration: 3000 });

    // Unblock
    component.user = { ...mockUser, status: 'BLOCKED', unblockAt: new Date(Date.now() + 86400000).toISOString() };
    userServiceSpy.unblockUser.and.returnValue(of(undefined));
    userServiceSpy.getUserById.and.returnValue(of(mockUser));
    component.toggleUserStatus();
    expect(userServiceSpy.unblockUser).toHaveBeenCalledWith('u1');
    expect(snackBarSpy.open).toHaveBeenCalledWith('✅ Utilisateur débloqué avec succès', 'Fermer', { duration: 3000 });
  });

  it('should delete user and navigate', () => {
    component.user = mockUser;
    userServiceSpy.deleteUser.and.returnValue(of(undefined));
    component.deleteUser();
    expect(userServiceSpy.deleteUser).toHaveBeenCalledWith('u1');
    expect(snackBarSpy.open).toHaveBeenCalledWith('✅ Utilisateur supprimé avec succès', 'Fermer', { duration: 3000 });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/users']);
  });

  it('should format date', () => {
    const date = new Date('2024-01-01T12:34:00Z');
    expect(component.formatDate(date)).toMatch(/1 janvier 2024/);
    expect(component.formatDate(null)).toBe('Non disponible');
  });

  it('should calculate trust score', () => {
    expect(component.calculateTrustScore({ ...mockUser, emailVerified: true, phone: '0601020304' })).toBe(80);
    expect(component.calculateTrustScore({ ...mockUser, emailVerified: false, phone: undefined })).toBe(50);
  });

  it('should return activity icon', () => {
    expect(component.getActivityIcon('login')).toBe('🔑');
    expect(component.getActivityIcon('ad_created')).toBe('📝');
    expect(component.getActivityIcon('ad_sold')).toBe('💰');
    expect(component.getActivityIcon('message')).toBe('💬');
    expect(component.getActivityIcon('profile_updated')).toBe('👤');
    expect(component.getActivityIcon('other' as any)).toBe('📅');
  });

  it('should return role display', () => {
    expect(component.getRoleDisplay('admin')).toBe('Administrateur');
    expect(component.getRoleDisplay('user')).toBe('Utilisateur');
    expect(component.getRoleDisplay('other')).toBe('other');
  });
});
