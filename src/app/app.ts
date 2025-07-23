import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./shared/navbar/navbar.component";
import { AuthService } from './core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class AppComponent {
  title = 'Retrouv\'It';

  private readonly authService = inject(AuthService);
  
  private readonly currentUser = toSignal(this.authService.currentUser$);

  readonly isUserAuthenticated = computed(() => 
    this.currentUser() !== null
  );
}
