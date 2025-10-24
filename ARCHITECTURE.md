# 🏗️ Architecture de l'Application de Gestion Hospitalière

## 📊 Vue d'Ensemble

Cette application suit une architecture **Client-Server** avec séparation complète du frontend et du backend.

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React 18)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Pages   │  │Components│  │  Hooks   │  │ Contexts │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       └─────────────┴─────────────┴─────────────┘           │
│                         │                                    │
│                    Axios (HTTP)                              │
└─────────────────────────┼───────────────────────────────────┘
                          │
                     REST API (JSON)
                          │
┌─────────────────────────┼───────────────────────────────────┐
│                    BACKEND (Laravel 11)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Routes  │→ │Controller│→ │  Models  │→ │ Database │   │
│  └──────────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│                     │              │              │          │
│              ┌──────┴──────┐  ┌───┴────┐    ┌────┴─────┐  │
│              │  Requests   │  │Resources│    │  MySQL   │  │
│              │ (Validation)│  │ (Format)│    │          │  │
│              └─────────────┘  └─────────┘    └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Backend - Laravel 11

### Structure des Dossiers

```
gestion-hospitaliere-backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       ├── AuthController.php
│   │   │       ├── PatientController.php
│   │   │       ├── MedecinController.php
│   │   │       ├── RendezvousController.php
│   │   │       ├── ChambreController.php
│   │   │       ├── LitController.php
│   │   │       ├── DashboardController.php
│   │   │       └── ...
│   │   ├── Middleware/
│   │   │   ├── CheckRole.php
│   │   │   └── ApiRateLimiter.php
│   │   ├── Requests/
│   │   │   ├── StorePatientRequest.php
│   │   │   ├── UpdatePatientRequest.php
│   │   │   ├── StoreRendezvousRequest.php
│   │   │   └── ...
│   │   └── Resources/
│   │       ├── PatientResource.php
│   │       ├── MedecinResource.php
│   │       ├── RendezvousResource.php
│   │       └── ...
│   ├── Models/
│   │   ├── User.php
│   │   ├── Patient.php
│   │   ├── Medecin.php
│   │   ├── Rendezvous.php
│   │   ├── Chambre.php
│   │   ├── Lit.php
│   │   └── ...
│   └── Notifications/
│       ├── RendezvousCreated.php
│       └── RendezvousReminder.php
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
│   └── api.php
└── config/
    ├── cors.php
    ├── sanctum.php
    └── ...
```

### Modèles de Données

#### 1. User (Utilisateur)
```php
- id
- name
- email
- password
- role (Admin, Médecin, Patient, Infirmier, Réceptionniste)
- timestamps
```

#### 2. Patient
```php
- id
- user_id (FK → users)
- date_naissance
- adresse
- telephone
- groupe_sanguin
- documents (JSON)
- historique_medical (TEXT)
- photo
- timestamps
```

#### 3. Medecin
```php
- id
- user_id (FK → users)
- specialite
- service_id (FK → services)
- disponibilites (JSON)
- timestamps
```

#### 4. Rendezvous
```php
- id
- patient_id (FK → patients)
- medecin_id (FK → medecins)
- date_heure
- motif
- statut (planifie, confirme, annule, termine)
- notes
- timestamps
```

#### 5. Chambre
```php
- id
- numero
- service_id (FK → services)
- type (standard, vip, soins_intensifs, urgence)
- capacite
- tarif_journalier
- disponible
- equipements (JSON)
- notes
- timestamps
```

#### 6. Lit
```php
- id
- chambre_id (FK → chambres)
- numero
- statut (disponible, occupe, maintenance, reserve)
- patient_id (FK → patients, nullable)
- date_occupation
- date_liberation_prevue
- notes
- timestamps
```

### Relations Eloquent

```php
User → hasOne → Patient
User → hasOne → Medecin

Patient → belongsTo → User
Patient → hasMany → Rendezvous
Patient → hasMany → Prescriptions
Patient → hasOne → Lit

Medecin → belongsTo → User
Medecin → belongsTo → Service
Medecin → hasMany → Rendezvous

Rendezvous → belongsTo → Patient
Rendezvous → belongsTo → Medecin

Chambre → belongsTo → Service
Chambre → hasMany → Lits

Lit → belongsTo → Chambre
Lit → belongsTo → Patient
```

### API Endpoints

#### Authentification
```
POST   /api/register          - Inscription
POST   /api/login             - Connexion
POST   /api/logout            - Déconnexion (auth)
GET    /api/profile           - Profil utilisateur (auth)
```

#### Dashboard
```
GET    /api/dashboard         - Statistiques générales (auth)
GET    /api/dashboard/graphiques - Données pour graphiques (auth)
```

#### Patients
```
GET    /api/patients          - Liste (Admin, Médecin)
POST   /api/patients          - Créer (Admin, Médecin)
GET    /api/patients/{id}     - Détails (Admin, Médecin)
PUT    /api/patients/{id}     - Modifier (Admin, Médecin)
DELETE /api/patients/{id}     - Supprimer (Admin, Médecin)
GET    /api/patients/{id}/documents/{index} - Télécharger document
DELETE /api/patients/{id}/documents/{index} - Supprimer document
```

#### Médecins
```
GET    /api/medecins          - Liste (tous authentifiés)
POST   /api/medecins          - Créer (Admin)
GET    /api/medecins/{id}     - Détails (Admin)
PUT    /api/medecins/{id}     - Modifier (Admin)
DELETE /api/medecins/{id}     - Supprimer (Admin)
```

#### Rendez-vous
```
GET    /api/rendezvous        - Liste (tous authentifiés)
POST   /api/rendezvous        - Créer (tous authentifiés)
GET    /api/rendezvous/{id}   - Détails (propriétaire)
PUT    /api/rendezvous/{id}   - Modifier (propriétaire)
DELETE /api/rendezvous/{id}   - Supprimer (propriétaire)
```

#### Chambres
```
GET    /api/chambres          - Liste (tous authentifiés)
GET    /api/chambres/disponibles - Chambres disponibles
POST   /api/chambres          - Créer (Admin)
PUT    /api/chambres/{id}     - Modifier (Admin)
DELETE /api/chambres/{id}     - Supprimer (Admin)
```

#### Lits
```
GET    /api/lits              - Liste (tous authentifiés)
GET    /api/lits/disponibles  - Lits disponibles
POST   /api/lits              - Créer (Admin, Infirmier)
PUT    /api/lits/{id}         - Modifier (Admin, Infirmier)
DELETE /api/lits/{id}         - Supprimer (Admin, Infirmier)
POST   /api/lits/{id}/assigner - Assigner patient (Admin, Infirmier)
POST   /api/lits/{id}/liberer  - Libérer lit (Admin, Infirmier)
```

### Sécurité

#### 1. Authentification
- **Laravel Sanctum** pour JWT tokens
- Tokens stockés dans localStorage côté client
- Expiration automatique des tokens

#### 2. Autorisation
- Middleware `CheckRole` pour vérifier les rôles
- Méthode `authorize()` dans les Form Requests
- Gates et Policies pour permissions granulaires

#### 3. Validation
- Form Requests pour validation centralisée
- Messages d'erreur personnalisés en français
- Validation côté serveur obligatoire

#### 4. Protection
- Rate Limiting (60 requêtes/minute par défaut)
- CORS configuré pour domaines autorisés
- CSRF protection
- XSS prevention via validation
- SQL Injection prevention via Eloquent ORM

---

## ⚛️ Frontend - React 18

### Structure des Dossiers

```
gestion-hospitaliere-frontend/
├── public/
│   └── index.html
├── src/
│   ├── api/
│   │   ├── axios.js           # Configuration Axios
│   │   └── endpoints.js       # Centralisation endpoints
│   ├── components/
│   │   ├── Layout/
│   │   ├── Forms/
│   │   ├── Tables/
│   │   └── Modals/
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── hooks/
│   │   ├── useAuth.js         # Hook authentification
│   │   └── useFetch.js        # Hook requêtes API
│   ├── pages/
│   │   ├── DashboardPage.js
│   │   ├── PatientsPage.js
│   │   ├── MedecinsPage.js
│   │   ├── RendezvousPage.js
│   │   ├── ChambresPage.js
│   │   └── ...
│   ├── services/
│   ├── App.js
│   └── index.js
└── package.json
```

### Hooks Personnalisés

#### useAuth
```javascript
const {
  user,              // Utilisateur connecté
  loading,           // État de chargement
  error,             // Erreur éventuelle
  login,             // Fonction de connexion
  register,          // Fonction d'inscription
  logout,            // Fonction de déconnexion
  hasRole,           // Vérifier le rôle
  isAuthenticated,   // Booléen authentifié
  isAdmin,           // Booléen admin
  isMedecin,         // Booléen médecin
} = useAuth();
```

#### useFetch
```javascript
const { data, loading, error, refetch } = useFetch(url, options);
```

#### useMutation
```javascript
const { mutate, loading, error, data } = useMutation(url, method);
```

### Gestion d'État

- **Local State**: useState pour état local des composants
- **Context API**: AuthContext pour l'authentification globale
- **Custom Hooks**: Logique réutilisable (useAuth, useFetch)

### Routing

```javascript
/                    → DashboardPage (protégé)
/login               → LoginPage (public)
/register            → RegisterPage (public)
/patients            → PatientsPage (Admin, Médecin)
/medecins            → MedecinsPage (tous)
/rendezvous          → RendezvousPage (tous)
/chambres            → ChambresPage (tous)
/lits                → LitsPage (Admin, Infirmier)
```

### Bibliothèques Utilisées

- **react-router-dom**: Routing
- **axios**: Requêtes HTTP
- **recharts**: Graphiques et statistiques
- **tailwindcss**: Styling
- **date-fns**: Manipulation de dates
- **react-big-calendar**: Calendrier rendez-vous

---

## 🔐 Flux d'Authentification

```
1. Utilisateur soumet login (email, password)
   ↓
2. Frontend → POST /api/login
   ↓
3. Backend valide credentials
   ↓
4. Backend génère JWT token via Sanctum
   ↓
5. Backend retourne { token, user }
   ↓
6. Frontend stocke token dans localStorage
   ↓
7. Frontend configure Axios header: Authorization: Bearer {token}
   ↓
8. Toutes les requêtes suivantes incluent le token
   ↓
9. Backend vérifie token via middleware auth:sanctum
   ↓
10. Backend retourne données ou 401 Unauthorized
```

---

## 📧 Système de Notifications

### Email (Laravel Notifications)

```php
// Envoi automatique lors création rendez-vous
$patient->user->notify(new RendezvousCreated($rendezvous));

// Rappel 24h avant (via scheduled task)
$rendezvous->patient->user->notify(new RendezvousReminder($rendezvous));
```

### Configuration Queue

```env
QUEUE_CONNECTION=redis
```

```bash
# Lancer le worker
php artisan queue:work
```

---

## 📊 Performances & Optimisation

### Backend
- **Eager Loading**: Éviter N+1 queries
- **API Resources**: Formatage optimisé JSON
- **Cache**: Config, routes, views en production
- **Pagination**: 15 éléments par défaut
- **Indexation DB**: Sur colonnes fréquemment recherchées

### Frontend
- **Code Splitting**: Lazy loading des routes
- **Memoization**: useMemo, useCallback
- **Optimistic Updates**: UI réactive
- **Debouncing**: Recherche en temps réel

---

## 🧪 Tests

### Backend (PHPUnit)
```bash
tests/
├── Feature/
│   ├── AuthTest.php
│   ├── PatientTest.php
│   └── RendezvousTest.php
└── Unit/
    └── ModelTest.php
```

### Frontend (Jest + React Testing Library)
```bash
src/
├── __tests__/
│   ├── components/
│   ├── hooks/
│   └── pages/
```

---

## 📈 Monitoring & Logs

### Backend
- **Laravel Log**: `storage/logs/laravel.log`
- **Query Log**: Activer en développement
- **Error Tracking**: Sentry (recommandé)

### Frontend
- **Console Errors**: Interceptés par Axios
- **Analytics**: Google Analytics (optionnel)

---

**Version:** 1.0.0  
**Auteur:** Équipe Développement  
**Dernière mise à jour:** Octobre 2025
