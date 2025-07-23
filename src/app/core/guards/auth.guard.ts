import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🔒 AuthGuard - Vérification pour:', state.url);
  
  // ✅ COOKIES ONLY - Vérification simple via isAuthenticated
  if (authService.isAuthenticated()) {
    console.log('✅ Accès autorisé à:', state.url);
    return true;
  } else {
    console.log('❌ Accès refusé, redirection vers login');
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};