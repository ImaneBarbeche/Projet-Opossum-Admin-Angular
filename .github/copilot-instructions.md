# Copilot Instructions - OPOSSUM Admin Angular

## Architecture Overview

This is an **Angular 20 admin panel** for the OPOSSUM lost & found platform using modern Angular patterns:
- **Standalone components** with `inject()` instead of constructor DI
- **Signals & computed()** for reactive state management  
- **New template syntax** (`@if`, `@for`, `@empty` instead of `*ngIf`, `*ngFor`)
- **Cookie-based authentication** (no localStorage/JWT tokens)
- **Mock interceptor** for development (`environment.useMockData: true`)

## Core Business Logic

### Listing Status Workflow (Critical)
The platform manages lost/found items with strict status transitions:
- `ACTIVE` → `RESOLVED` (anyone can mark as found)
- `ACTIVE/RESOLVED` → `ARCHIVED` (admin only, hides from public)
- `ACTIVE/RESOLVED` → `DELETED` (author or admin)
- `ARCHIVED` → `DELETED` (admin only)
- `RESOLVED` → `ACTIVE` (admin only, bonus feature)

**Key Rules:**
- `ARCHIVED` items are NOT shown in public selection filters
- Special UI indicators for `RESOLVED` items ("RETROUVÉ" badge)
- Admin-only features gated by `isAdmin()` checks

### Models & Enums
- `ListingStatus`: ACTIVE, RESOLVED, ARCHIVED, DELETED, REJECTED, PENDING
- `ListingType`: LOST, FOUND
- `ListingCategory`: ELECTRONICS, CLOTHING, etc.
- All enums are imported in components as `readonly ListingStatus = ListingStatus`

## Development Patterns

### Component Structure
```typescript
// Modern Angular pattern - all components follow this structure
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './example.component.html',
  styleUrl: './example.component.css'
})
export class ExampleComponent {
  // Inject services
  private readonly service = inject(SomeService);
  
  // Signals for state
  data = signal<Type[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  
  // Computed values
  stats = computed(() => this.data().length);
  
  // Expose enums for templates
  readonly SomeEnum = SomeEnum;
}
```

### Template Patterns
```html
<!-- New Angular 20 syntax -->
@if (isLoading()) {
  <div class="loading-state">Loading...</div>
}

@if (error()) {
  <div class="error-state">{{ error() }}</div>
}

@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
} @empty {
  <div>No items found</div>
}

<!-- Role-based features -->
@if (isAdmin()) {
  <button>Admin Only Action</button>
}
```

## Development Workflow

### Local Development
```bash
npm start              # ng serve on localhost:4200
npm test              # Jest/Karma tests
npm run build         # Production build
```

### Authentication Flow
- **Mock mode**: `admin@opossum.com` / `admin` (see `mock.interceptor.ts`)
- **Production**: Real API with cookie-based auth
- Toggle via `environment.useMockData` flag
- Session managed by `AuthService` with `BehaviorSubject`

### Docker Deployment
```bash
docker build -t admin-angular .
docker run -d -p 8080:80 admin-angular
# App available at localhost:8080
```

## Key Services & Patterns

### State Management
- **No NgRx** - Pure signals/computed for state
- Services expose `BehaviorSubject` streams converted to signals with `toSignal()`
- Filter state managed with `signal()` in components
- Computed stats derived from listing arrays

### User Management & Moderation
- **Block/Unblock Users**: Admin can block users with duration (days), unblock them
- **Soft Delete Users**: Users marked as deleted but data preserved
- **Role-based permissions**: Admin-only actions clearly separated
- **User status tracking**: Active, blocked, email verified states

### HTTP & Mocking
- `MockInterceptor` provides full fake API responses (544 lines)
- Cookie session simulation via `mockSessionActive` flag
- Real API calls when `environment.production || !environment.useMockData`
- All HTTP calls use `withCredentials: true` for cookies

### Route Structure
- `/login` (public)
- `/dashboard`, `/users`, `/users/:id`, `/annonces` (protected by `AuthGuard`)
- Default redirect to `/dashboard`
- 404 redirects to `/login`

## Business Logic Implementation

### Status Transition Methods
```typescript
// Permission-based action controls
canArchive(listing: Listing): boolean {
  return this.isAdmin() && 
         (listing.status === 'ACTIVE' || listing.status === 'RESOLVED');
}

canDelete(listing: Listing): boolean {
  return this.isAdmin() || 
         (listing.user_id === this.currentUserId());
}

canReactivate(listing: Listing): boolean {
  return this.isAdmin() && listing.status === 'RESOLVED';
}
```

### Admin-Only Features
- View archived/deleted listings in filters
- Block/unblock users with duration
- Reactivate resolved listings
- Access to all user management functions

## UI/UX Conventions

### Emoji Usage
Consistent emoji icons throughout:
- 📦 Listings/Packages
- 👥 Users  
- 📊 Dashboard
- 🔍 Search/Lost items
- ✅ Found items
- 🎉 Resolved
- 🗑️ Deleted
- 📦 Archived

### CSS Classes
- Status-based styling: `.status-active`, `.status-resolved`, etc.
- Admin-only UI elements clearly marked
- Responsive grid layouts for listings/users
- Loading states with spinners
- Error states with retry buttons

## Critical Files to Understand

- `src/app/core/models/listing.model.ts` - Business logic enums & interfaces
- `src/app/core/interceptors/mock.interceptor.ts` - Development data layer
- `src/app/pages/listing/listingList.component.ts` - Main CRUD operations
- `src/app/core/services/auth.service.ts` - Cookie-based authentication
- `src/environments/environment.ts` - Feature flags & API config

## Testing Strategy

- Mock interceptor provides consistent test data
- Admin role testing with `admin@opossum.com` credentials
- Status transition testing critical for business logic
- Cookie authentication flow validation required
