import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UserListComponent } from './pages/users/user-list.component';
import { UserDetailComponent } from './pages/users/user-detail.component';
import { ListingListComponent } from './pages/listing/listingList.component';
import { ListingDetailComponent } from './pages/listing/listing-detail.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // 🔐 Route login (publique)
  { path: 'login', component: LoginComponent },
  
  // 📊 Route dashboard (protégée)
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  
  // 👥 Routes utilisateurs (protégées)
  { 
    path: 'users', 
    component: UserListComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'users/:id', 
    component: UserDetailComponent,
    canActivate: [AuthGuard]
  },

  // 📦 Routes annonces (protégées)
  { 
    path: 'annonces', 
    component: ListingListComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'annonces/:id', 
    component: ListingDetailComponent,
    canActivate: [AuthGuard]
  },
  
  // 🏠 Redirection par défaut
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  
  // 🚫 Route 404
  { path: '**', redirectTo: '/login' }
];