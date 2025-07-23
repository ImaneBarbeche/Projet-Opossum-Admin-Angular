import { Component, OnInit } from '@angular/core';
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
    this.activeUsers = this.users.filter(u => u.is_active).length;
    this.blockedUsers = this.users.filter(u => !u.is_active).length;
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
        filtered = filtered.filter(u => u.is_active);
        break;
      case 'blocked':
        filtered = filtered.filter(u => !u.is_active);
        break;
    }

    // Filtre par recherche
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(term) || 
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
    if (confirm('Êtes-vous sûr de vouloir bloquer cet utilisateur ?')) {
      this.userService.blockUser(userId).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          console.error('Erreur lors du blocage:', error);
        }
      });
    }
  }

  unblockUser(userId: string): void {
    this.userService.unblockUser(userId).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (error) => {
        console.error('Erreur lors du déblocage:', error);
      }
    });
  }

  deleteUser(userId: string): void {
    if (confirm('⚠️ ATTENTION ! Supprimer cet utilisateur est IRRÉVERSIBLE. Continuer ?')) {
      this.userService.deleteUser(parseInt(userId)).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }

  // Utilitaires
  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getFullName(user: User): string {
    return `${user.first_name} ${user.last_name}`;
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
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