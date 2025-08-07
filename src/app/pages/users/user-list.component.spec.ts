import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserListComponent } from './user-list.component';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';

const mockUsers: User[] = [
  {
    id: 'u1',
    email: 'user1@email.com',
    firstName: 'Alice',
    lastName: 'Dupont',
    avatar: undefined,
    createdAt: new Date().toISOString(),
    active: true,
    status: 'ACTIVE',
    blockedUntil: null,
    unblockAt: null,
    role: 'USER',
    emailVerified: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'u2',
    email: 'user2@email.com',
    firstName: 'Bob',
    lastName: 'Martin',
    avatar: undefined,
    createdAt: new Date().toISOString(),
    active: false,
    status: 'BLOCKED',
    blockedUntil: new Date(Date.now() + 86400000).toISOString(),
    unblockAt: null,
    role: 'USER',
    emailVerified: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'u3',
    email: 'user3@email.com',
    firstName: 'Charlie',
    lastName: 'Durand',
    avatar: undefined,
    createdAt: new Date().toISOString(),
    active: false,
    status: 'DELETED',
    blockedUntil: null,
    unblockAt: null,
    role: 'USER',
    emailVerified: true,
    updatedAt: new Date().toISOString()
  }
];

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('UserService', [
      'getAllUsers', 'blockUser', 'unblockUser', 'deleteUser'
    ]);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    userServiceSpy.getAllUsers.and.returnValue(of(mockUsers));

    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    expect(component.users.length).toBe(3);
    expect(component.isLoading).toBeFalse();
    expect(component.totalUsers).toBe(3);
    expect(component.activeUsers).toBe(1);
    expect(component.blockedUsers).toBe(1);
    expect(component.deletedUsers).toBe(1);
  });

  it('should filter users by search term', () => {
    component.searchTerm = 'bob';
    component.onSearch();
    expect(component.filteredUsers.length).toBe(1);
    expect(component.filteredUsers[0].firstName).toBe('Bob');
  });

  it('should set filter and apply filters', () => {
    component.setFilter('blocked');
    expect(component.currentFilter).toBe('blocked');
    expect(component.filteredUsers.every(u => u.status === 'BLOCKED')).toBeTrue();
  });

  it('should navigate to user details', () => {
    component.viewUserDetails('u1');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/users', 'u1']);
  });

  it('should block user and reload on success', () => {
    spyOn(window, 'prompt').and.returnValues('motif', '7');
    userServiceSpy.blockUser.and.returnValue(of(undefined));
    userServiceSpy.getAllUsers.and.returnValue(of(mockUsers));
    component.blockUser('u1');
    expect(userServiceSpy.blockUser).toHaveBeenCalledWith('u1', 7, 'motif');
    expect(snackBarSpy.open).toHaveBeenCalledWith('✅ Utilisateur bloqué avec succès', 'Fermer', { duration: 3000 });
  });

  it('should show error if blockUser fails', () => {
    spyOn(window, 'prompt').and.returnValues('motif', '7');
    userServiceSpy.blockUser.and.returnValue(throwError(() => ({ status: 403 }))); // forbidden
    component.blockUser('u1');
    expect(snackBarSpy.open).toHaveBeenCalledWith("❌ Vous n'avez pas les droits pour cette action", 'Fermer', { duration: 3000 });
  });

  it('should unblock user and reload on success', () => {
    userServiceSpy.unblockUser.and.returnValue(of(undefined));
    userServiceSpy.getAllUsers.and.returnValue(of(mockUsers));
    component.unblockUser('u2');
    expect(userServiceSpy.unblockUser).toHaveBeenCalledWith('u2');
    expect(snackBarSpy.open).toHaveBeenCalledWith('✅ Utilisateur débloqué avec succès', 'Fermer', { duration: 3000 });
  });

  it('should delete user and reload on success', () => {
    userServiceSpy.deleteUser.and.returnValue(of(undefined));
    userServiceSpy.getAllUsers.and.returnValue(of(mockUsers));
    component.deleteUser('u3');
    expect(userServiceSpy.deleteUser).toHaveBeenCalledWith('u3');
    expect(snackBarSpy.open).toHaveBeenCalledWith('✅ Utilisateur supprimé avec succès', 'Fermer', { duration: 3000 });
  });

  it('should return initials for name', () => {
    expect(component.getInitials('Alice Dupont')).toBe('AD');
    expect(component.getInitials('Bob')).toBe('B');
  });

  it('should return avatar url or null', () => {
    const user: User = { ...mockUsers[0], avatar: 'https://example.com/avatar.png' };
    expect(component.getAvatarUrl(user)).toBe('https://example.com/avatar.png');
    expect(component.getAvatarUrl({ ...user, avatar: 'file://avatar.png' })).toBeNull();
    expect(component.getAvatarUrl({ ...user, avatar: 'avatar.png' })).toBeNull();
  });

  it('should format date', () => {
    const date = new Date('2024-01-01T00:00:00Z');
    expect(component.formatDate(date)).toMatch(/01\/01\/2024/);
    expect(component.formatDate(null)).toBe('Non disponible');
  });
});
