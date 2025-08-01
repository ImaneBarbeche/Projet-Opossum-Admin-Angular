import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  // Angular 20 - Injection moderne
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Signal pour l'utilisateur actuel
  readonly currentUser = toSignal(this.authService.currentUser$);

  // Signal pour l'état de déconnexion
  readonly isLoggingOut = signal(false);
   menuOpen = false;
  // Méthode de déconnexion
  logout(): void {
    if (this.isLoggingOut()) return; // Éviter les clics multiples

    this.isLoggingOut.set(true);

    this.authService.logout();
  };

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
