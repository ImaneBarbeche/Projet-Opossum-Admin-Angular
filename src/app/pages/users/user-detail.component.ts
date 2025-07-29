
import { Component, OnInit } from '@angular/core';
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
  user: User | null = null;
  loading = true;
  editMode = false;
  editForm: Partial<User> = {};
  recentActivity: Activity[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly userService: UserService
  ) {}

  // Vérifie si l'utilisateur est bloqué (helper)
  isUserBlocked(): boolean {
    return !!this.user?.blockedUntil && new Date(this.user.blockedUntil) > new Date();
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
        this.user = user;
        this.initEditForm();
        this.loadRecentActivity();
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

  initEditForm(): void {
    if (this.user) {
      this.editForm = {
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        role: this.user.role
      };
    }
  }

  loadRecentActivity(): void {
    // Simulation d'activité récente (à remplacer par un appel API)
    this.recentActivity = [
      {
        id: 1,
        type: 'login',
        description: 'Connexion à l\'application',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        type: 'ad_created',
        description: 'Nouvelle annonce "iPhone 13 Pro"',
        date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        type: 'message',
        description: 'Message envoyé à un vendeur',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 4,
        type: 'profile_updated',
        description: 'Profil mis à jour',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }

  toggleUserStatus(): void {
    if (!this.user) return;

    if (this.isUserBlocked()) {
      // Débloquer l'utilisateur avec prompt de confirmation
      const confirmUnblock = confirm('Voulez-vous vraiment débloquer cet utilisateur ?');
      if (!confirmUnblock) return;
      this.userService.unblockUser(this.user.id).subscribe({
        next: () => {
          this.loadUser(this.user!.id);
          alert('✅ Utilisateur débloqué avec succès');
        },
        error: (error) => {
          console.error('Erreur lors du déblocage:', error);
          if (error.status === 401) {
            alert('❌ Non authentifié - Reconnectez-vous');
          } else if (error.status === 403) {
            alert('❌ Vous n\'avez pas les droits pour cette action');
          } else {
            alert('❌ Erreur lors du déblocage: ' + (error.error?.message || error.message));
          }
        }
      });
      return;
    }

    if (this.user.active) {
      // Bloquer l'utilisateur - demander la durée
      const durationStr = prompt('Durée du blocage en jours (ex: 7, 30) :', '7');
      if (!durationStr) return;
      const durationDays = parseInt(durationStr, 10);
      if (isNaN(durationDays) || durationDays <= 0) {
        alert('Veuillez entrer un nombre de jours valide');
        return;
      }
      if (confirm(`Bloquer cet utilisateur pendant ${durationDays} jours ?`)) {
        this.userService.blockUser(this.user.id, durationDays).subscribe({
          next: () => {
            this.loadUser(this.user!.id);
            alert('✅ Utilisateur bloqué avec succès');
          },
          error: (error) => {
            console.error('Erreur lors du blocage:', error);
            if (error.status === 401) {
              alert('❌ Non authentifié - Reconnectez-vous');
            } else if (error.status === 403) {
              alert('❌ Vous n\'avez pas les droits pour cette action');
            } else {
              alert('❌ Erreur lors du blocage: ' + (error.error?.message || error.message));
            }
          }
        });
      }
      return;
    }

    // Activer l'utilisateur (si inactif et non bloqué)
    if (confirm('Activer cet utilisateur ?')) {
      this.userService.updateUser(this.user.id, { active: true }).subscribe({
        next: () => {
          this.loadUser(this.user!.id);
          alert('Utilisateur activé avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de l\'activation:', error);
          alert('Une erreur est survenue lors de l\'activation');
        }
      });
    }
  }

  deleteUser(): void {
    if (!this.user) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer définitivement cet utilisateur ? Cette action est irréversible.')) {
      this.userService.deleteUser(this.user.id).subscribe({
        next: () => {
          alert('Utilisateur supprimé avec succès');
          this.router.navigate(['/users']);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          alert('Une erreur est survenue lors de la suppression');
        }
      });
    }
  }

  saveUser(): void {
    if (!this.user || !this.editForm.firstName || !this.editForm.lastName || !this.editForm.email) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const userData: Partial<User> = {
      firstName: this.editForm.firstName,
      lastName: this.editForm.lastName,
      email: this.editForm.email,
      role: this.editForm.role || this.user.role
    };

    this.userService.updateUser(this.user.id, userData).subscribe({
      next: (user) => {
        this.user = user;
        this.editMode = false;
        alert('Utilisateur mis à jour avec succès');
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour:', error);
        alert('Une erreur est survenue lors de la mise à jour');
      }
    });
  }

  cancelEdit(): void {
    this.editMode = false;
    this.initEditForm();
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