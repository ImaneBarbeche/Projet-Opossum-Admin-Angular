import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
// On n'importe plus Router ni ActivatedRoute ici, mais RouterTestingModule plus bas
import { AuthService } from '../../core/services/auth.service';
import { NavbarComponent } from './navbar.component';

// Mocks

import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
class AuthServiceMock {
  currentUser$ = new BehaviorSubject(null);
  logout = jasmine.createSpy('logout');
}

class RouterMock {
  navigate = jasmine.createSpy('navigate');
}

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authService: AuthServiceMock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, NavbarComponent],
      providers: [
        { provide: AuthService, useClass: AuthServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle menu', () => {
    expect(component.menuOpen).toBeFalse();
    component.toggleMenu();
    expect(component.menuOpen).toBeTrue();
    component.toggleMenu();
    expect(component.menuOpen).toBeFalse();
  });

  it('should call logout and set isLoggingOut', () => {
    expect(component.isLoggingOut()).toBeFalse();
    component.logout();
    expect(component.isLoggingOut()).toBeTrue();
    expect(authService.logout).toHaveBeenCalled();
  });

  it('should not logout if already logging out', () => {
    component.isLoggingOut.set(true);
    component.logout();
    // logout ne doit pas être rappelé
    expect(authService.logout).toHaveBeenCalledTimes(0);
  });
});
