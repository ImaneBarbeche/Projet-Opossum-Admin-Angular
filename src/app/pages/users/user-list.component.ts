import { Component, OnInit, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  // Utilitaire pour savoir si un utilisateur est bloqué (supporte unblockAt ET blockedUntil)
  isUserBlocked(user: User): boolean {
    if (user.status === 'BLOCKED') {
      // Prendre la date de déblocage la plus tardive si les deux existent
      const unblockDate = user.unblockAt || user.blockedUntil;
      if (unblockDate) {
        return new Date(unblockDate) > new Date();
      }
      return true; // Blocage permanent si pas de date
    }
    return false;
  }
  users: User[] = [];
  filteredUsers: User[] = [];
  isLoading = true;
  
  // Filtres et recherche
  searchTerm = '';
  currentFilter: 'all' | 'active' | 'blocked' = 'all';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;
  totalFiltered = 0;
  
  // Stats rapides
  totalUsers = 0;
  activeUsers = 0;
  blockedUsers = 0;

  private readonly snackBar = inject(MatSnackBar);
  constructor(
    private readonly userService: UserService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        // Log détaillé pour chaque utilisateur
        users.forEach(u => {
          console.log(`[UserList] ${u.firstName} ${u.lastName}`,
            'status:', u.status,
            'unblockAt:', u.unblockAt,
            'blockedUntil:', u.blockedUntil,
            'active:', u.active,
            'emailVerified:', u.emailVerified
          );
        });
        this.users = users;
        this.calculateStats();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.isLoading = false;
      }
    });
  }

  calculateStats(): void {
    this.totalUsers = this.users.length;
    this.activeUsers = this.users.filter(u => u.active && !this.isUserBlocked(u)).length;
    this.blockedUsers = this.users.filter(u => this.isUserBlocked(u)).length;
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  setFilter(filter: 'all' | 'active' | 'blocked'): void {
    this.currentFilter = filter;
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.users];

    // Filtre par statut
    switch (this.currentFilter) {
      case 'active':
        filtered = filtered.filter(u => u.active && !this.isUserBlocked(u));
        break;
      case 'blocked':
        filtered = filtered.filter(u => this.isUserBlocked(u));
        break;
    }

    // Filtre par recherche
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(term) || 
        u.email.toLowerCase().includes(term)
      );
    }

    // Calcul pagination
    this.totalFiltered = filtered.length;
    this.totalPages = Math.ceil(this.totalFiltered / this.itemsPerPage);
    
    // S'assurer que currentPage est valide
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }

    // Appliquer la pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    
    this.filteredUsers = filtered.slice(startIndex, endIndex);
  }

  // Actions utilisateurs
  viewUserDetails(userId: string): void {
    this.router.navigate(['/users', userId]);
  }

  blockUser(userId: string): void {
    // Toast d'information à la place du confirm
    this.snackBar.open('Blocage en cours...', '', { duration: 1500 });
    const reason = prompt('Motif du blocage ?', '');
    if (!reason || reason.trim().length === 0) {
      this.snackBar.open('Veuillez entrer un motif de blocage.', 'Fermer', { duration: 3000 });
      return;
    }
    const durationStr = prompt('Durée du blocage en jours ?', '7');
    const durationDays = durationStr ? parseInt(durationStr, 10) : 7;
    if (isNaN(durationDays) || durationDays <= 0) {
      this.snackBar.open('Veuillez entrer une durée valide (nombre de jours).', 'Fermer', { duration: 3000 });
      return;
    }
    this.userService.blockUser(userId, durationDays, reason).subscribe({
      next: () => {
        this.snackBar.open('✅ Utilisateur bloqué avec succès', 'Fermer', { duration: 3000 });
        this.loadUsers();
      },
      error: (error) => {
        console.error('Erreur lors du blocage:', error);
        if (error.status === 401) {
          this.snackBar.open('❌ Non authentifié - Reconnectez-vous', 'Fermer', { duration: 3000 });
        } else if (error.status === 403) {
          this.snackBar.open('❌ Vous n\'avez pas les droits pour cette action', 'Fermer', { duration: 3000 });
        } else if (error.status === 404) {
          this.snackBar.open('❌ Utilisateur non trouvé', 'Fermer', { duration: 3000 });
        } else {
          this.snackBar.open('❌ Erreur lors du blocage: ' + (error.error?.message || error.message), 'Fermer', { duration: 3000 });
        }
      }
    });
  }

  unblockUser(userId: string): void {
    this.snackBar.open('Déblocage en cours...', '', { duration: 1500 });
    this.userService.unblockUser(userId).subscribe({
      next: () => {
        this.snackBar.open('✅ Utilisateur débloqué avec succès', 'Fermer', { duration: 3000 });
        this.loadUsers();
      },
      error: (error) => {
        console.error('Erreur lors du déblocage:', error);
        if (error.status === 401) {
          this.snackBar.open('❌ Non authentifié - Reconnectez-vous', 'Fermer', { duration: 3000 });
        } else if (error.status === 403) {
          this.snackBar.open('❌ Vous n\'avez pas les droits pour cette action', 'Fermer', { duration: 3000 });
        } else if (error.status === 404) {
          this.snackBar.open('❌ Utilisateur non trouvé', 'Fermer', { duration: 3000 });
        } else {
          this.snackBar.open('❌ Erreur lors du déblocage: ' + (error.error?.message || error.message), 'Fermer', { duration: 3000 });
        }
      }
    });
  }

  deleteUser(userId: string): void {
    this.snackBar.open('Suppression en cours...', '', { duration: 1500 });
    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.snackBar.open('✅ Utilisateur supprimé avec succès', 'Fermer', { duration: 3000 });
        this.loadUsers();
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.snackBar.open('❌ Erreur lors de la suppression', 'Fermer', { duration: 3000 });
      }
    });
  }

  // Utilitaires

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  /**
   * Retourne l'URL de l'avatar si valide, sinon null (pour afficher une image par défaut)
   */
  getAvatarUrl(user: User): string | null {
    if (!user.avatar) return null;
    // Si l'avatar commence par file:// ou n'est pas http(s), on refuse
    if (user.avatar.startsWith('file://')) return null;
    if (!/^https?:\/\//.test(user.avatar)) return null;
    return user.avatar;
  }

  getFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }

  formatDate(date: Date | string | null | undefined): string {
    if (!date) return 'Non disponible';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // 📄 Méthodes de pagination
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    let start = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let end = Math.min(this.totalPages, start + maxVisiblePages - 1);
    
    // Ajuster start si on est près de la fin
    if (end - start < maxVisiblePages - 1) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getDisplayStart(): number {
    if (this.totalFiltered === 0) return 0;
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getDisplayEnd(): number {
    const end = this.currentPage * this.itemsPerPage;
    return Math.min(end, this.totalFiltered);
  }

  getTotalFiltered(): number {
    return this.totalFiltered;
  }
}