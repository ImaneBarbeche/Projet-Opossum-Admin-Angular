import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

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
  role: 'ADMIN',
  emailVerified: true
};

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate'], { url: '/dashboard' });
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    sessionStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should be created', () => {
    httpMock.expectOne(`${environment.apiUrl}/auth`).flush({ authenticated: false, user: null });
    expect(service).toBeTruthy();
  });

  it('should login and set user', () => {
    httpMock.expectOne(`${environment.apiUrl}/auth`).flush({ authenticated: false, user: null });
    const mockToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' +
      btoa(JSON.stringify({ sub: 'u1', email: 'user1@email.com', role: 'ADMIN', firstName: 'Alice', lastName: 'Dupont' })) + '.signature';
    const mockResponse = { data: { accessToken: mockToken } };
    service.login('user1@email.com', 'password').subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.getCurrentUser()).toBeTruthy();
    expect(sessionStorage.getItem('opossum_user_session')).toBeTruthy();
  });

  it('should logout and clear session', () => {
    httpMock.expectOne(`${environment.apiUrl}/auth`).flush({ authenticated: false, user: null });
    sessionStorage.setItem('opossum_user_session', JSON.stringify({ user: mockUser, timestamp: Date.now() }));
    service['currentUserSubject'].next(mockUser);
    service.logout();
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
    expect(req.request.method).toBe('POST');
    req.flush({});
    expect(service.isAuthenticated()).toBeFalse();
    expect(sessionStorage.getItem('opossum_user_session')).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should initialize auth from sessionStorage', () => {
    httpMock.expectOne(`${environment.apiUrl}/auth`).flush({ authenticated: false, user: null });
    sessionStorage.setItem('opossum_user_session', JSON.stringify({ user: mockUser, timestamp: Date.now() }));
    service['currentUserSubject'].next(null);
    service.initializeAuth();
    httpMock.expectOne(`${environment.apiUrl}/auth`).flush({ authenticated: false, user: null });
    expect(service.isAuthenticated()).toBeTrue();
    // Remove avatar from expected object to match actual returned user
    const { avatar, ...expectedUser } = mockUser;
    expect(service.getCurrentUser()).toEqual(jasmine.objectContaining(expectedUser));
  });

  it('should check token validity and logout if invalid', () => {
    httpMock.expectOne(`${environment.apiUrl}/auth`).flush({ authenticated: false, user: null });
    service['currentUserSubject'].next(mockUser);
    service.checkTokenValidity().subscribe(isValid => {
      expect(isValid).toBeFalse();
      expect(service.isAuthenticated()).toBeFalse();
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/validate`);
    expect(req.request.method).toBe('GET');
    req.flush({ authenticated: false, user: null });
  });

  it('should check token validity and keep user if valid', () => {
    httpMock.expectOne(`${environment.apiUrl}/auth`).flush({ authenticated: false, user: null });
    service['currentUserSubject'].next(mockUser);
    service.checkTokenValidity().subscribe(isValid => {
      expect(isValid).toBeTrue();
      expect(service.isAuthenticated()).toBeTrue();
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/validate`);
    expect(req.request.method).toBe('GET');
    req.flush({ authenticated: true, user: mockUser });
  });

  it('should detect admin role', () => {
    httpMock.expectOne(`${environment.apiUrl}/auth`).flush({ authenticated: false, user: null });
    service['currentUserSubject'].next(mockUser);
    expect(service.isAdmin()).toBeTrue();
    expect(service.hasRole('ADMIN')).toBeTrue();
    expect(service.hasRole('USER')).toBeFalse();
  });

  it('should return access token', () => {
    httpMock.expectOne(`${environment.apiUrl}/auth`).flush({ authenticated: false, user: null });
    service['accessToken'] = 'token123';
    expect(service.getAccessToken()).toBe('token123');
  });
});
