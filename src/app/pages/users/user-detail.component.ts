
import { Component, OnInit, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';

interface Activity {
  id: number;
  type: 'login' | 'ad_created' | 'ad_sold' | 'message' | 'profile_updated';
  description: string;
  date: string;
}

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {
  private readonly snackBar = inject(MatSnackBar);
  user: User | null = null;
  loading = true;
  recentActivity: Activity[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly userService: UserService
  ) {}

  // Vérifie si l'utilisateur est bloqué (nouvelle logique harmonisée)
  isUserBlocked(): boolean {
    if (!this.user) return false;
    if (this.user.status === 'BLOCKED') {
      const unblockDate = this.user.unblockAt || this.user.blockedUntil;
      if (unblockDate) {
        return new Date(unblockDate) > new Date();
      }
      return true; // Blocage permanent si pas de date
    }
    return false;
  }

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.loadUser(userId);
    } else {
      this.router.navigate(['/users']);
    }
  }

  loadUser(id: string): void {
    this.loading = true;
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        console.log('[UserDetailComponent] user reçu', user);
        console.log('[UserDetailComponent] Champs:',
          'active:', user.active,
          'status:', user.status,
          'unblockAt:', user.unblockAt,
          'blockedUntil:', user.blockedUntil
        );
        this.user = user;
        // Charger l'activité réelle si présente dans la réponse
        if (user.recentActivity && Array.isArray(user.recentActivity)) {
          this.recentActivity = user.recentActivity.map((a: any, idx: number) => ({
            id: idx + 1,
            type: a.type,
            description: a.label,
            date: a.date
          }));
        } else {
          this.recentActivity = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        this.loading = false;
        
        if (error.status === 404) {
          alert('❌ Utilisateur non trouvé (ID: ' + id + ')');
        } else if (error.status === 401) {
          alert('❌ Non authentifié - Reconnectez-vous');
        } else {
          alert('❌ Erreur lors du chargement de l\'utilisateur: ' + (error.error?.message || error.message));
        }
        
        // Rediriger vers la liste des utilisateurs
        this.router.navigate(['/users']);
      }
    });
  }





  goBack(): void {
    this.router.navigate(['/users']);
  }

  toggleUserStatus(): void {
    if (!this.user) return;

    if (this.isUserBlocked()) {
      // Toast d'information à la place du confirm
      this.snackBar.open('Déblocage en cours...', '', { duration: 1500 });
      this.userService.unblockUser(this.user.id).subscribe({
        next: () => {
          this.loadUser(String(this.user!.id));
          this.snackBar.open('✅ Utilisateur débloqué avec succès', 'Fermer', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erreur lors du déblocage:', error);
          if (error.status === 401) {
            this.snackBar.open('❌ Non authentifié - Reconnectez-vous', 'Fermer', { duration: 3000 });
          } else if (error.status === 403) {
            this.snackBar.open('❌ Vous n\'avez pas les droits pour cette action', 'Fermer', { duration: 3000 });
          } else {
            this.snackBar.open('❌ Erreur lors du déblocage: ' + (error.error?.message || error.message), 'Fermer', { duration: 3000 });
          }
        }
      });
      return;
    }

    if (this.user.active) {
      // Bloquer l'utilisateur - demander motif et durée
      const reason = prompt('Motif du blocage ?', '');
      if (!reason || reason.trim().length === 0) {
        alert('Veuillez entrer un motif de blocage.');
        return;
      }
      const durationStr = prompt('Durée du blocage en jours (ex: 7, 30) :', '7');
      if (!durationStr) return;
      const durationDays = parseInt(durationStr, 10);
      if (isNaN(durationDays) || durationDays <= 0) {
        alert('Veuillez entrer un nombre de jours valide');
        return;
      }
      // Toast d'information à la place du confirm
      this.snackBar.open('Blocage en cours...', '', { duration: 1500 });
      // Endpoint: PATCH /api/v1/admin/users/:id/block
      this.userService.blockUser(this.user.id, durationDays, reason).subscribe({
        next: () => {
          this.loadUser(String(this.user!.id));
          this.snackBar.open('✅ Utilisateur bloqué avec succès', 'Fermer', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erreur lors du blocage:', error);
          if (error.status === 401) {
            this.snackBar.open('❌ Non authentifié - Reconnectez-vous', 'Fermer', { duration: 3000 });
          } else if (error.status === 403) {
            this.snackBar.open('❌ Vous n\'avez pas les droits pour cette action', 'Fermer', { duration: 3000 });
          } else {
            this.snackBar.open('❌ Erreur lors du blocage: ' + (error.error?.message || error.message), 'Fermer', { duration: 3000 });
          }
        }
      });
      return;
    }


  }

  deleteUser(): void {
    if (!this.user) return;

    this.snackBar.open('Suppression en cours...', '', { duration: 1500 });
    // Endpoint: DELETE /api/v1/admin/users/:id
    this.userService.deleteUser(this.user.id).subscribe({
      next: () => {
        this.snackBar.open('✅ Utilisateur supprimé avec succès', 'Fermer', { duration: 3000 });
        this.router.navigate(['/users']);
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.snackBar.open('❌ Une erreur est survenue lors de la suppression', 'Fermer', { duration: 3000 });
      }
    });
  }





  formatDate(date: string | Date | null | undefined): string {
    if (!date) return 'Non disponible';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calculateTrustScore(user: User): number {
    // Calcul basique d'un score de confiance
    let score = 50; // Base
    
    if (user.emailVerified) score += 20;
    if (user.phone) score += 10;
    
    return Math.min(100, score);
  }

  getActivityIcon(type: Activity['type']): string {
    switch (type) {
      case 'login': return '🔑';
      case 'ad_created': return '📝';
      case 'ad_sold': return '💰';
      case 'message': return '💬';
      case 'profile_updated': return '👤';
      default: return '📅';
    }
  }

  getRoleDisplay(role: string): string {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'user': return 'Utilisateur';
      default: return role;
    }
  }
}