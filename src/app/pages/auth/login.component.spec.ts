import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';

class AuthServiceMock {
  isAuthenticated = jasmine.createSpy('isAuthenticated').and.returnValue(false);
  login = jasmine.createSpy('login');
}

class RouterMock {
  navigate = jasmine.createSpy('navigate');
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthServiceMock;
  let router: RouterMock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule, LoginComponent],
      providers: [
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: Router, useClass: RouterMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as any;
    router = TestBed.inject(Router) as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.loginForm.value.email).toBe('admin@opossum.com');
    expect(component.loginForm.value.password).toBe('admin');
  });

  it('should show error if form is invalid on submit', () => {
    component.loginForm.controls['email'].setValue('');
    component.loginForm.controls['password'].setValue('');
    component.onSubmit();
    expect(component.errorMessage()).toContain('corriger');
  });

  it('should call AuthService.login and navigate on success', () => {
    const loginResponse = of({});
    authService.login.and.returnValue(loginResponse);
    component.loginForm.controls['email'].setValue('test@test.com');
    component.loginForm.controls['password'].setValue('test123');
    component.onSubmit();
    expect(authService.login).toHaveBeenCalledWith('test@test.com', 'test123');
  });

  it('should handle 401 error', () => {
    const error = { status: 401 };
    authService.login.and.returnValue(throwError(() => error));
    component.loginForm.controls['email'].setValue('test@test.com');
    component.loginForm.controls['password'].setValue('wrong');
    component.onSubmit();
    expect(component.errorMessage()).toContain('incorrect');
  });

  it('should handle server unreachable error', () => {
    const error = { status: 0 };
    authService.login.and.returnValue(throwError(() => error));
    component.loginForm.controls['email'].setValue('test@test.com');
    component.loginForm.controls['password'].setValue('test123');
    component.onSubmit();
    expect(component.errorMessage()).toContain('Impossible de contacter');
  });

  it('should handle generic error', () => {
    const error = { status: 500 };
    authService.login.and.returnValue(throwError(() => error));
    component.loginForm.controls['email'].setValue('test@test.com');
    component.loginForm.controls['password'].setValue('test123');
    component.onSubmit();
    expect(component.errorMessage()).toContain('erreur');
  });

  it('should reset form and error message', () => {
    component.errorMessage.set('Erreur');
    component.loginForm.controls['email'].setValue('foo');
    component.loginForm.controls['password'].setValue('bar');
    component.resetForm();
    expect(component.loginForm.value.email).toBe('admin@opossum.com');
    expect(component.loginForm.value.password).toBe('admin');
    expect(component.errorMessage()).toBe('');
  });
});
