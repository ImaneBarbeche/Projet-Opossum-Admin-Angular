import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StatsService } from '../../core/services/stats.service';
import { DashboardStats } from '../../core/models/stats.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  // Modern Angular pattern avec inject()
  private readonly statsService = inject(StatsService);
  
  // Signals pour la réactivité (pattern OPOSSUM)
  stats = signal<DashboardStats | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Computed pour vérifier si les données sont chargées
  hasData = computed(() => this.stats() !== null);

    // 📊 Computed signals pour accéder aux stats avec la bonne structure
  totalUsers = computed(() => this.stats()?.users?.total ?? 0);
  activeUsers = computed(() => this.stats()?.users?.active ?? 0);
  newUsersThisMonth = computed(() => this.stats()?.users?.newThisMonth ?? 0);
  
  totalAnnouncements = computed(() => this.stats()?.announcements?.total ?? 0);
  activeAnnouncements = computed(() => this.stats()?.announcements?.active ?? 0);
  lostItems = computed(() => this.stats()?.announcements?.lost ?? 0);
  foundItems = computed(() => this.stats()?.announcements?.found ?? 0);
  resolvedItems = computed(() => this.stats()?.announcements?.resolved ?? 0);
  
  totalFiles = computed(() => this.stats()?.files?.totalCount ?? 0);
  totalFileSize = computed(() => this.stats()?.files?.totalSize ?? '0 MB');
  resolutionRate = computed(() => this.stats()?.resolutionRate ?? 0);

  ngOnInit(): void {
    this.loadStats();
  }

  /**
   * Charge les statistiques du dashboard
   */
 loadStats(): void {
    console.log('🔄 Début chargement stats...');
    this.isLoading.set(true);
    this.error.set(null);

    this.statsService.getDashboardStats().subscribe({
      next: (data) => {
        console.log('✅ Stats reçues:', data);
        console.log('📊 Total utilisateurs:', data.users?.total);
        console.log('📦 Total annonces:', data.announcements?.total);
        this.stats.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Erreur stats:', error);
        this.error.set('Erreur de chargement des statistiques');
        this.isLoading.set(false);
      }
    });
  }
}