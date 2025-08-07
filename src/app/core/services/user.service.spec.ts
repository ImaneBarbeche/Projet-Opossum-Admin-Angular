import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { User, UserHelpers } from '../models/user.model';
import { environment } from '../../../environments/environment';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const apiUser = {
    id: 'u1',
    email: 'user1@email.com',
    firstName: 'Alice',
    lastName: 'Dupont',
    avatar: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    active: true,
    status: 'ACTIVE',
    blockedUntil: null,
    unblockAt: null,
    role: 'USER',
    emailVerified: true
  };
  const user: User = UserHelpers.fromApi(apiUser);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all users (array response)', () => {
    service.getAllUsers().subscribe(users => {
      expect(users).toEqual([user]);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/admin/users`);
    expect(req.request.method).toBe('GET');
    req.flush([apiUser]);
  });

  it('should get all users (paged response)', () => {
    service.getAllUsers().subscribe(users => {
      expect(users).toEqual([user]);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/admin/users`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: { content: [apiUser] } });
  });

  it('should get user by id', () => {
    service.getUserById('u1').subscribe(u => {
      expect(u).toEqual(user);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/admin/users/u1`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: apiUser });
  });

  it('should delete user', () => {
    service.deleteUser('u1').subscribe(res => {
      expect(res).toBeNull();
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/admin/users/u1/delete`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should block user', () => {
    service.blockUser('u1', 7, 'motif').subscribe(res => {
      expect(res).toBeNull();
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/admin/users/u1/block`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ reason: 'motif', duration: 7 });
    req.flush(null);
  });

  it('should unblock user', () => {
    service.unblockUser('u1').subscribe(res => {
      expect(res).toBeNull();
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/admin/users/u1/unblock`);
    expect(req.request.method).toBe('PUT');
    req.flush(null);
  });

  it('should detect blocked user', () => {
    expect(service.isUserBlocked({ ...user, status: 'BLOCKED', unblockAt: null })).toBeTrue();
    expect(service.isUserBlocked({ ...user, status: 'BLOCKED', unblockAt: new Date(Date.now() + 86400000).toISOString() })).toBeTrue();
    expect(service.isUserBlocked({ ...user, status: 'BLOCKED', unblockAt: new Date(Date.now() - 86400000).toISOString() })).toBeFalse();
    expect(service.isUserBlocked({ ...user, status: 'ACTIVE' })).toBeFalse();
  });

  it('should return user blocked status string', () => {
    const blockedUser = { ...user, status: 'BLOCKED', unblockAt: new Date(Date.now() + 86400000).toISOString(), blockReason: 'Spam' };
    const status = service.getUserBlockedStatus(blockedUser);
    expect(status).toContain('Bloqué jusqu\'au');
    expect(status).toContain('Motif: Spam');
    expect(service.getUserBlockedStatus({ ...user, status: 'ACTIVE' })).toBe('Actif');
  });
});
