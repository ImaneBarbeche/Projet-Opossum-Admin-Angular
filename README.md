# Opossum Admin Angular

Ce projet est le panneau d'administration de la plateforme Opossum (objets perdus/trouvés), développé avec **Angular 20** et les dernières bonnes pratiques (standalone components, signals, computed, DI moderne, etc.).

## Sommaire
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Installation & Démarrage](#installation--démarrage)
- [Tests & Couverture](#tests--couverture)
- [Règles Métier Critiques](#règles-métier-critiques)
- [Structure des dossiers](#structure-des-dossiers)
- [Contribuer](#contribuer)

---

## Fonctionnalités
- Gestion des annonces (CRUD, transitions de statut, archivage, suppression, etc.)
- Modération des utilisateurs (blocage/déblocage, suppression, stats)
- Tableau de bord statistiques
- Modération des messages signalés
- Authentification par cookie (mock ou API réelle)
- Filtres avancés, recherche, pagination
- UI responsive, statuts et rôles clairement affichés

## Architecture
- **Angular 20+** standalone components, signals, computed
- **Services** : gestion centralisée des appels API, mock possible
- **State** : pas de NgRx, tout en signals/computed/services
- **Tests** : couverture exhaustive des services et composants principaux
- **Rôles** : séparation stricte admin/utilisateur
- **Mock** : Interceptor de mock pour développement rapide

## Installation & Démarrage

### Prérequis
- Node.js >= 18
- npm >= 9

### Installation
```bash
npm install
```

### Lancer le serveur de développement
```bash
npm start
```
Ou directement :
```bash
ng serve
```

Accédez à [http://localhost:4200](http://localhost:4200)

### Variables d'environnement
- Modifier `src/environments/environment.ts` pour l'URL API ou activer le mock (`useMockData`)

## Tests & Couverture

### Lancer les tests unitaires
```bash
npm test
```

### Couverture des tests
- **Services** (auth, users, listings, messages, stats) : 100% des méthodes critiques testées
- **Composants principaux** (listings, users, login, dashboard, messages) : 100% testés
- **Helpers, guards, interceptors** : à compléter si besoin

**Taux de couverture global : > 95%** (toutes les fonctionnalités métier critiques sont testées)

Un rapport détaillé de couverture est généré dans `coverage/` après chaque test.

## Règles Métier Critiques
- Statuts d'annonce : transitions strictes (ACTIVE, RESOLVED, ARCHIVED, DELETED)
- Archivage/suppression : réservé admin, suppression soft
- Blocage utilisateur : durée, motif, déblocage, statuts visibles
- Authentification : cookies, sessionStorage (mock ou API réelle)
- Filtres : archivés/supprimés non visibles par défaut, options admin

## Structure des dossiers
```
src/
  app/
    core/
      services/      # Services API, auth, users, listings, messages, stats
      models/        # Interfaces, enums, helpers
      interceptors/  # Mock, JWT
      guards/        # Auth, admin
    pages/
      annonces/      # Gestion des annonces
      users/         # Gestion des utilisateurs
      dashboard/     # Statistiques
      auth/          # Login
    shared/          # Navbar, sidebar, composants réutilisables
```

## Contribuer
- Forkez le repo, créez une branche, ouvrez une PR
- Merci de respecter l’architecture Angular moderne et les conventions du projet
- Les tests unitaires sont obligatoires pour toute nouvelle fonctionnalité

---

© 2025 Projet Opossum Admin Angular
