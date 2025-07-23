import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpResponse, HttpEvent } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { UserRole } from '../models/user.model';

@Injectable()
export class MockInterceptor implements HttpInterceptor {


  // 🍪 Variable globale pour simuler l'état de session (remplace localStorage)
  private mockSessionActive = false;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    // 🎛️ Si mode production OU mock désactivé → passer à la vraie API
    if (environment.production || !environment.useMockData) {
      return next.handle(req);
    }

    // 🎭 MODE MOCK ACTIVÉ - Simuler des réponses
    console.log('🎭 MOCK MODE:', req.method, req.url);

    const url = req.url;
    const method = req.method;

// 🔐 LOGIN - Activer la session mock
    if (url.includes('/auth/login') && method === 'POST') {
      const { email, password } = req.body;
      
      if (email === 'admin@opossum.com' && password === 'admin') {
        // ✅ Activer la session mock
        this.mockSessionActive = true;
    return of(new HttpResponse({
      status: 200,
      body: {
        user: {
          id: 1,
          first_name: 'Admin',
          last_name: 'Opossum',
          email: 'admin@opossum.com',
          role: UserRole.ADMIN,
          password_hash: 'fake-hash-admin',
          is_active: true,
          is_email_verified: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: new Date().toISOString(),
          avatar: 'https://picsum.photos/150/150?random=admin',
          phone: '+33123456789',
          last_login_at: new Date().toISOString()
        }
        // ✅ Plus de access_token - géré par cookie !
      }
    })).pipe(delay(500));
   } else {
        return of(new HttpResponse({
          status: 401,
          body: { message: 'Identifiants incorrects' }
        })).pipe(delay(300));
      }
    }

    // 🚪 LOGOUT - Désactiver la session mock
    if (url.includes('/auth/logout') && method === 'POST') {
      // ✅ Désactiver la session mock
      this.mockSessionActive = false;
      
      return of(new HttpResponse({
        status: 200,
        body: { message: 'Déconnecté avec succès' }
      })).pipe(delay(300));
    }

// 🔍 AUTH/ME - Vérifier l'état de session
    if (url.includes('/auth/me') && method === 'GET') {
      
      if (this.mockSessionActive) {
        // ✅ Session active - utilisateur connecté
        return of(new HttpResponse({
          status: 200,
          body: {
            authenticated: true,
            user: {
              id: 1,
              first_name: 'Admin',
              last_name: 'Opossum',
              email: 'admin@opossum.com',
              role: UserRole.ADMIN,
              password_hash: 'fake-hash-admin',
              is_active: true,
              is_email_verified: true,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: new Date().toISOString(),
              avatar: 'https://picsum.photos/150/150?random=admin',
              phone: '+33123456789',
              last_login_at: new Date().toISOString()
            }
          }
        })).pipe(delay(300));
      } else {
        // ❌ Pas de session - utilisateur déconnecté
        return of(new HttpResponse({
          status: 401,
          body: { 
            authenticated: false,
            message: 'Non authentifié' 
          }
        })).pipe(delay(200));
      }
    }
    // 👥 USERS - GET ALL
    if (url.includes('/users') && method === 'GET' && !url.includes('/users/')) {
      return of(new HttpResponse({
        status: 200,
        body: [
          {
            id: 1,
            first_name: 'Alice',
            last_name: 'Martin',
            email: 'alice@example.com',
            role: UserRole.USER,
            password_hash: 'hash1',
            is_active: true,
            is_email_verified: true,
            created_at: '2025-01-15T10:00:00Z',
            updated_at: '2025-07-20T15:30:00Z',
            avatar: 'https://picsum.photos/100/100?random=1'
          },
          {
            id: 2,
            first_name: 'Bob',
            last_name: 'Durand',
            email: 'bob@example.com',
            role: UserRole.USER,
            password_hash: 'hash2',
            is_active: true,
            is_email_verified: false,
            created_at: '2025-02-10T14:20:00Z',
            updated_at: '2025-07-18T09:15:00Z'
          },
          {
            id: 3,
            first_name: 'Claire',
            last_name: 'Lemoine',
            email: 'claire@example.com',
            role: UserRole.USER,
            password_hash: 'hash3',
            is_active: false,
            is_email_verified: true,
            created_at: '2025-03-05T16:45:00Z',
            updated_at: '2025-07-15T11:20:00Z'
          }
        ]
      })).pipe(delay(800));
    }

    // 👤 USER - GET BY ID
    if (url.match(/\/users\/\d+$/) && method === 'GET') {
      const userId = parseInt(url.split('/').pop() || '1');
      return of(new HttpResponse({
        status: 200,
        body: {
          id: userId,
          first_name: `User`,
          last_name: `#${userId}`,
          email: `user${userId}@example.com`,
          role: UserRole.USER,
          password_hash: 'hash',
          is_active: true,
          is_email_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      })).pipe(delay(400));
    }

    // 👤 USER - CREATE
    if (url.includes('/users') && method === 'POST') {
      const userData = req.body;
      return of(new HttpResponse({
        status: 201,
        body: {
          id: Math.floor(Math.random() * 1000) + 100,
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          role: userData.role,
          password_hash: 'fake-hash-' + Date.now(),
          is_active: true,
          is_email_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      })).pipe(delay(600));
    }

    // 👤 USER - UPDATE
    if (url.match(/\/users\/\d+$/) && method === 'PUT') {
      const userId = parseInt(url.split('/').pop() || '1');
      const userData = req.body;
      return of(new HttpResponse({
        status: 200,
        body: {
          id: userId,
          ...userData,
          updated_at: new Date().toISOString()
        }
      })).pipe(delay(500));
    }

    // 👤 USER - DELETE
    if (url.match(/\/users\/\d+$/) && method === 'DELETE') {
      return of(new HttpResponse({
        status: 204,
        body: null
      })).pipe(delay(300));
    }

    // 📊 STATS DASHBOARD
    if (url.includes('/stats/dashboard') && method === 'GET') {
      return of(new HttpResponse({
        status: 200,
        body: {
          totalUsers: 156,
          activeUsers: 89,
          newUsersToday: 7,
          newUsersThisMonth: 42,
          totalListings: 234,
          activeLostItems: 23,
          activeFoundItems: 18,
          resolvedToday: 3,
          resolvedThisMonth: 67,
          pendingListings: 12,
          resolutionRate: 78.5
        }
      })).pipe(delay(700));
    }

        // 📦 LISTINGS - GET ALL
    if (url.includes('/listings') && method === 'GET' && !url.includes('/listings/')) {
      
      return of(new HttpResponse({
        status: 200,
        body: [
          {
            id: 1,
            title: 'iPhone 14 Pro perdu',
            description: 'iPhone 14 Pro noir perdu dans le métro ligne 1, station Châtelet. Coque violette avec initiales "MM". Récompense offerte.',
            user_id: 2,
            category: 'electronics',
            city: 'Paris',
            address: 'Métro Châtelet - Ligne 1',
            latitude: 48.8566,
            longitude: 2.3522,
            contact_email: 'marie@example.com',
            contact_phone: '06 12 34 56 78',
            status: 'active',
            type: 'lost',
            is_lost: true,
            reward_amount: 100,
            created_at: '2025-07-20T14:30:00Z',
            updated_at: '2025-07-20T14:30:00Z',
            images: ['https://picsum.photos/300/200?random=1']
          },
          {
            id: 2,
            title: 'Carte d\'identité trouvée',
            description: 'Carte d\'identité au nom de "Julien Moreau" trouvée dans le parc des Buttes-Chaumont.',
            user_id: 3,
            category: 'documents',
            city: 'Paris',
            address: 'Parc des Buttes-Chaumont',
            latitude: 45.7578,
            longitude: 4.8320,
            contact_email: 'pierre@example.com',
            contact_phone: '07 98 76 54 32',
            status: 'pending',
            type: 'found',
            is_lost: false,
            reward_amount: null,
            created_at: '2025-07-22T09:15:00Z',
            updated_at: '2025-07-22T09:15:00Z',
            images: []
          },
          {
            id: 3,
            title: 'Chien Labrador perdu',
            description: 'Labrador doré de 3 ans, répond au nom de "Rex". Perdu près du parc Montsouris. Très affectueux, porte un collier rouge.',
            user_id: 4,
            category: 'pets',
            city: 'Paris',
            address: 'Parc Montsouris, 14e arrondissement',
            latitude: 48.8220,
            longitude: 2.3369,
            contact_email: 'sophie@example.com',
            contact_phone: '06 55 44 33 22',
            status: 'resolved',
            type: 'lost',
            is_lost: true,
            reward_amount: 200,
            created_at: '2025-07-15T08:00:00Z',
            updated_at: '2025-07-21T16:30:00Z',
            images: ['https://picsum.photos/300/200?random=2']
          },
          {
            id: 4,
            title: 'Écharpe en laine trouvée',
            description: 'Belle écharpe en laine rouge et noire trouvée sur un banc de la place de la République.',
            user_id: 5,
            category: 'clothing',
            city: 'Paris',
            address: 'Place de la République',
            latitude: 48.8676,
            longitude: 2.3633,
            contact_email: 'thomas@example.com',
            contact_phone: '06 77 88 99 00',
            status: 'active',
            type: 'found',
            is_lost: false,
            reward_amount: null,
            created_at: '2025-07-18T12:45:00Z',
            updated_at: '2025-07-18T12:45:00Z',
            images: ['https://picsum.photos/300/200?random=3']
          },
          {
            id: 5,
            title: 'Vélo électrique volé',
            description: 'Vélo électrique Decathlon bleu et blanc volé devant la gare de Lyon. Numéro de série: DEC2024789.',
            user_id: 6,
            category: 'vehicles',
            city: 'Paris',
            address: 'Gare de Lyon',
            latitude: 48.8447,
            longitude: 2.3736,
            contact_email: 'emma@example.com',
            contact_phone: '06 11 22 33 44',
            status: 'active',
            type: 'lost',
            is_lost: true,
            reward_amount: 300,
            created_at: '2025-07-19T07:30:00Z',
            updated_at: '2025-07-19T07:30:00Z',
            images: ['https://picsum.photos/300/200?random=4']
          },
          {
            id: 6,
            title: 'AirPods trouvés',
            description: 'AirPods Pro dans leur boîtier trouvés au café "Le Procope". Boîtier légèrement rayé.',
            user_id: 2,
            category: 'electronics',
            city: 'Paris',
            address: '13 Rue de l\'Ancienne Comédie',
            latitude: 48.8534,
            longitude: 2.3388,
            contact_email: 'marie@example.com',
            contact_phone: '06 12 34 56 78',
            status: 'rejected',
            type: 'found',
            is_lost: false,
            reward_amount: null,
            created_at: '2025-07-17T15:20:00Z',
            updated_at: '2025-07-21T10:15:00Z',
            images: []
          },
          {
            id: 7,
            title: 'Passeport français perdu',
            description: 'Passeport français perdu lors d\'un voyage. Dernière utilisation à l\'aéroport Charles de Gaulle.',
            user_id: 3,
            category: 'documents',
            city: 'Roissy-en-France',
            address: 'Aéroport Charles de Gaulle, Terminal 2E',
            latitude: 49.0047,
            longitude: 2.5711,
            contact_email: 'pierre@example.com',
            contact_phone: '07 98 76 54 32',
            status: 'archived',
            type: 'lost',
            is_lost: true,
            reward_amount: 50,
            created_at: '2025-07-10T11:00:00Z',
            updated_at: '2025-07-16T09:30:00Z',
            images: []
          },
          {
            id: 8,
            title: 'Clés avec porte-clés licorne',
            description: 'Trousseau de clés avec un porte-clés licorne rose trouvé près de la fontaine Saint-Michel.',
            user_id: 5,
            category: 'other',
            city: 'Paris',
            address: 'Place Saint-Michel',
            latitude: 48.8534,
            longitude: 2.3439,
            contact_email: 'thomas@example.com',
            contact_phone: '06 77 88 99 00',
            status: 'pending',
            type: 'found',
            is_lost: false,
            reward_amount: null,
            created_at: '2025-07-21T16:45:00Z',
            updated_at: '2025-07-21T16:45:00Z',
            images: ['https://picsum.photos/300/200?random=5']
          },
          {
            id: 9,
            title: 'Tablette iPad perdue',
            description: 'iPad Air avec coque bleue perdu dans le RER B. Contient des documents de travail importants.',
            user_id: 6,
            category: 'electronics',
            city: 'Paris',
            address: 'RER B - Station Châtelet-Les Halles',
            latitude: 48.8619,
            longitude: 2.3467,
            contact_email: 'emma@example.com',
            contact_phone: '06 11 22 33 44',
            status: 'active',
            type: 'lost',
            is_lost: true,
            reward_amount: 150,
            created_at: '2025-07-23T13:15:00Z',
            updated_at: '2025-07-23T13:15:00Z',
            images: ['https://picsum.photos/300/200?random=6']
          },
          {
            id: 10,
            title: 'Veste en cuir trouvée',
            description: 'Veste en cuir noir trouvée dans un restaurant du Marais. Taille M, marque Zara.',
            user_id: 4,
            category: 'clothing',
            city: 'Paris',
            address: 'Rue de Rivoli, Le Marais',
            latitude: 48.8566,
            longitude: 2.3622,
            contact_email: 'sophie@example.com',
            contact_phone: '06 55 44 33 22',
            status: 'resolved',
            type: 'found',
            is_lost: false,
            reward_amount: null,
            created_at: '2025-07-14T19:30:00Z',
            updated_at: '2025-07-18T14:20:00Z',
            images: ['https://picsum.photos/300/200?random=7']
          },
          {
            id: 11,
            title: 'Sac à main Chanel perdu',
            description: 'Sac à main Chanel noir matelassé perdu dans un taxi. Contient portefeuille et papiers importants.',
            user_id: 2,
            category: 'other',
            city: 'Paris',
            address: 'Avenue des Champs-Élysées',
            latitude: 48.8698,
            longitude: 2.3075,
            contact_email: 'marie@example.com',
            contact_phone: '06 12 34 56 78',
            status: 'pending',
            type: 'lost',
            is_lost: true,
            reward_amount: 500,
            created_at: '2025-07-22T20:15:00Z',
            updated_at: '2025-07-22T20:15:00Z',
            images: ['https://picsum.photos/300/200?random=8']
          },
          {
            id: 12,
            title: 'Chat gris trouvé',
            description: 'Petit chat gris avec des taches blanches trouvé dans le 11e arrondissement. Très mignon et sociable.',
            user_id: 5,
            category: 'pets',
            city: 'Paris',
            address: 'Place de la Bastille',
            latitude: 48.8532,
            longitude: 2.3694,
            contact_email: 'thomas@example.com',
            contact_phone: '06 77 88 99 00',
            status: 'active',
            type: 'found',
            is_lost: false,
            reward_amount: null,
            created_at: '2025-07-20T10:30:00Z',
            updated_at: '2025-07-20T10:30:00Z',
            images: ['https://picsum.photos/300/200?random=9']
          }
        ]
      })).pipe(delay(600));
    }

    // 📦 LISTING - GET BY ID
    if (url.match(/\/listings\/\d+$/) && method === 'GET') {
      const listingId = parseInt(url.split('/').pop() || '1');
      // Retourner une annonce mock basée sur l'ID
      return of(new HttpResponse({
        status: 200,
        body: {
          id: listingId,
          title: `Annonce #${listingId}`,
          description: `Description de l'annonce ${listingId}`,
          user_id: Math.floor(Math.random() * 6) + 1,
          category: ['electronics', 'clothing', 'documents', 'pets', 'vehicles', 'other'][Math.floor(Math.random() * 6)],
          city: 'Paris',
          address: 'Adresse test',
          latitude: 48.8566,
          longitude: 2.3522,
          contact_email: 'test@example.com',
          contact_phone: '06 12 34 56 78',
          status: ['active', 'pending', 'resolved'][Math.floor(Math.random() * 3)],
          type: Math.random() > 0.5 ? 'lost' : 'found',
          is_lost: Math.random() > 0.5,
          reward_amount: Math.random() > 0.5 ? Math.floor(Math.random() * 200) + 50 : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          images: [`https://picsum.photos/300/200?random=${listingId}`]
        }
      })).pipe(delay(400));
    }

    // 📦 LISTING - UPDATE STATUS
    if (url.match(/\/listings\/\d+\/status$/) && method === 'PUT') {
      const listingId = parseInt(url.split('/')[url.split('/').length - 2]);
      return of(new HttpResponse({
        status: 200,
        body: {
          id: listingId,
          status: req.body.status,
          updated_at: new Date().toISOString()
        }
      })).pipe(delay(500));
    }

    // 📦 LISTING - DELETE
    if (url.match(/\/listings\/\d+$/) && method === 'DELETE') {
      return of(new HttpResponse({
        status: 204,
        body: null
      })).pipe(delay(300));
    }

    // 🚫 Route non mockée - Passer à la vraie API
    console.log('⚠️ Route non mockée, passage à la vraie API:', req.url);
    return next.handle(req);
  }
}