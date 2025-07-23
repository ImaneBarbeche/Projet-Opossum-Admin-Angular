import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  // 🎯 Angular 20 - Injection moderne sans constructeur
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // 📝 FormGroup pour le formulaire
  loginForm!: FormGroup;
  
  // 🔄 Angular 20 - Signals pour l'état réactif
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    // 🔍 Vérifier si déjà connecté
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // 📋 Créer le formulaire de connexion avec valeurs par défaut
    this.loginForm = this.fb.group({
      email: ['admin@opossum.com', [Validators.required, Validators.email]],
      password: ['admin', [Validators.required, Validators.minLength(3)]]
    });
  }

  // 🔐 MÉTHODE DE CONNEXION
  onSubmit(): void {
    // Validation du formulaire
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      this.errorMessage.set('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    // Démarrer le loading
    this.isLoading.set(true);
    this.errorMessage.set('');

    // Extraire les données du formulaire
    const loginData: LoginRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    console.log('🔐 Tentative de connexion pour:', loginData.email);

    // Appel au service d'authentification
    this.authService.login(loginData.email, loginData.password).subscribe({
      next: (response) => {
        console.log('✅ Connexion réussie:', response);
        this.isLoading.set(false);
        // Redirection vers le dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('❌ Erreur de connexion:', error);
        this.isLoading.set(false);
        
        // Gestion des différents types d'erreurs
        if (error.status === 401) {
          this.errorMessage.set('Email ou mot de passe incorrect');
        } else if (error.status === 0) {
          this.errorMessage.set('Impossible de contacter le serveur');
        } else {
          this.errorMessage.set('Une erreur est survenue. Veuillez réessayer.');
        }
      }
    });
  }

  // 🎯 MÉTHODES UTILITAIRES

  /**
   * Marquer tous les champs du formulaire comme touchés pour afficher les erreurs
   */
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Vérifier si un champ est invalide et a été touché
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Obtenir le message d'erreur pour un champ spécifique
   */
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    // Messages d'erreur personnalisés
    const errors = field.errors;
    
    if (errors['required']) {
      return fieldName === 'email' ? 'L\'email est requis' : 'Le mot de passe est requis';
    }
    
    if (errors['email']) {
      return 'Veuillez saisir un email valide';
    }
    
    if (errors['minlength']) {
      const requiredLength = errors['minlength'].requiredLength;
      return `Le mot de passe doit contenir au moins ${requiredLength} caractères`;
    }

    return 'Champ invalide';
  }

  /**
   * Réinitialiser le formulaire
   */
  resetForm(): void {
    this.loginForm.reset({
      email: 'admin@opossum.com',
      password: 'admin'
    });
    this.errorMessage.set('');
  }

  /**
   * Getter pour accès facile aux contrôles du formulaire
   */
  get formControls() {
    return this.loginForm.controls;
  }

  /**
   * Vérifier si le formulaire est valide
   */
  get isFormValid(): boolean {
    return this.loginForm.valid;
  }

  /**
   * Obtenir la valeur du formulaire de façon typée
   */
  get formValue(): LoginRequest {
    return this.loginForm.value as LoginRequest;
  }
}