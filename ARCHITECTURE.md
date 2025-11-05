# 🏗️ Architecture Technique

> **Documentation détaillée de l'architecture système**

## 📋 Vue d'Ensemble

L'application suit une architecture **microservices containerisée** avec séparation claire entre frontend et backend, orchestrée par Docker Compose.

```
┌─────────────────────────────────────────┐
│           Frontend (React 19)           │
│     Components │ Hooks │ Contexts       │
└──────────────────┬──────────────────────┘
                   │ REST API (JSON)
┌──────────────────┴──────────────────────┐
│          Backend (Laravel 12)           │
│  Controllers │ Models │ Resources       │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────┴──────────────────────┐
│    Infrastructure (MySQL + Redis)       │
│     Database │ Cache │ Queue │ Mail     │
└─────────────────────────────────────────┘
```

## 🎯 Principes Architecturaux

### 1. **Séparation des Responsabilités**
- **Frontend :** Interface utilisateur et expérience
- **Backend :** Logique métier et données
- **Infrastructure :** Persistance et services

### 2. **API-First Design**
- API REST complète et documentée
- Versioning des endpoints
- Réponses JSON standardisées

### 3. **Containerisation**
- Services isolés et reproductibles
- Orchestration Docker Compose
- Scalabilité horizontale

## 🔧 Stack Technique

### Backend (Laravel 12)

#### Framework & Core
```php
// Configuration principale
Laravel 12.x
PHP 8.2+
Composer 2.x
```

#### Packages Principaux
```json
{
  "laravel/sanctum": "^4.0",      // Authentification API
  "laravel/horizon": "^5.0",      // Monitoring des queues
  "spatie/laravel-permission": "^6.0", // Gestion des rôles
  "intervention/image": "^3.0",   // Traitement d'images
  "barryvdh/laravel-cors": "^3.0" // Configuration CORS
}
```

#### Architecture Backend
```
app/
├── Http/
│   ├── Controllers/        # Contrôleurs API
│   ├── Requests/          # Validation des requêtes
│   ├── Resources/         # Formatage des réponses
│   └── Middleware/        # Middlewares personnalisés
├── Models/               # Modèles Eloquent
├── Services/            # Services métier
├── Jobs/               # Jobs asynchrones
└── Notifications/      # Notifications email
```

### Frontend (React 19)

#### Framework & Core
```javascript
// Configuration principale
React 19.x
Node.js 18+
npm/yarn
```

#### Packages Principaux
```json
{
  "react": "^19.0.0",
  "react-router-dom": "^6.8.0",    // Routing
  "axios": "^1.3.0",               // HTTP client
  "tailwindcss": "^3.2.0",         // Styling
  "recharts": "^2.5.0",            // Graphiques
  "react-big-calendar": "^1.6.0",  // Calendrier
  "react-hook-form": "^7.43.0"     // Gestion des formulaires
}
```

#### Architecture Frontend
```
src/
├── components/          # Composants réutilisables
├── pages/              # Pages principales
├── hooks/              # Hooks personnalisés
├── contexts/           # Contextes React
├── services/           # Services API
├── utils/              # Utilitaires
└── styles/             # Styles globaux
```

## 🗄️ Base de Données

### Modèle de Données

```sql
-- Utilisateurs et authentification
users (id, name, email, role, created_at, updated_at)
personal_access_tokens (tokenable_id, name, token, abilities)

-- Entités principales
patients (id, user_id, nom, prenom, date_naissance, telephone, adresse)
medecins (id, user_id, nom, prenom, specialite, telephone)
rendezvous (id, patient_id, medecin_id, date_heure, statut, motif)

-- Infrastructure hospitalière
services (id, nom, description, chef_service_id)
chambres (id, service_id, numero, type, prix_par_jour)
lits (id, chambre_id, numero, statut, patient_id)

-- Documents et facturation
documents (id, patient_id, nom_fichier, type, chemin)
factures (id, patient_id, montant_total, statut, date_emission)
```

### Relations Principales

```php
// Modèle Patient
class Patient extends Model
{
    public function user() { return $this->belongsTo(User::class); }
    public function rendezvous() { return $this->hasMany(Rendezvous::class); }
    public function documents() { return $this->hasMany(Document::class); }
    public function factures() { return $this->hasMany(Facture::class); }
}

// Modèle Rendezvous
class Rendezvous extends Model
{
    public function patient() { return $this->belongsTo(Patient::class); }
    public function medecin() { return $this->belongsTo(Medecin::class); }
}
```

## 🔐 Sécurité

### Authentification & Autorisation

```php
// Laravel Sanctum pour JWT
'guards' => [
    'api' => [
        'driver' => 'sanctum',
        'provider' => 'users',
    ],
]

// Middleware d'autorisation
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::apiResource('patients', PatientController::class);
});
```

### Validation des Données

```php
// Form Request pour validation stricte
class StorePatientRequest extends FormRequest
{
    public function rules()
    {
        return [
            'nom' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'telephone' => 'required|regex:/^[0-9]{10}$/',
            'documents.*' => 'file|mimes:pdf,jpg,png|max:2048'
        ];
    }
}
```

### Protection des Fichiers

```php
// Upload sécurisé avec validation
public function uploadDocument(Request $request)
{
    $request->validate([
        'file' => 'required|file|mimes:pdf,jpg,png|max:2048'
    ]);
    
    $path = $request->file('file')->store('documents', 'private');
    return response()->json(['path' => $path]);
}
```

## 🚀 Performance

### Optimisations Backend

```php
// Cache des requêtes fréquentes
public function getPatients()
{
    return Cache::remember('patients.all', 3600, function () {
        return Patient::with(['user', 'rendezvous'])->get();
    });
}

// Pagination efficace
public function index(Request $request)
{
    return PatientResource::collection(
        Patient::with('user')
            ->paginate($request->get('per_page', 15))
    );
}
```

### Optimisations Frontend

```javascript
// Hooks personnalisés pour la gestion d'état
const usePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/patients');
      setPatients(response.data.data);
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { patients, loading, fetchPatients };
};

// Lazy loading des composants
const PatientList = lazy(() => import('./components/PatientList'));
```

## 🐳 Infrastructure Docker

### Services Orchestrés

```yaml
# docker-compose.yml
version: '3.8'
services:
  # Application Laravel
  backend:
    build: ./gestion-hospitaliere-backend
    ports: ["8000:8000"]
    depends_on: [mysql, redis]
    
  # Interface React
  frontend:
    build: ./gestion-hospitaliere-frontend
    ports: ["3000:3000"]
    depends_on: [backend]
    
  # Base de données
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: gestion_hopital
      MYSQL_ROOT_PASSWORD: password
    
  # Cache et queues
  redis:
    image: redis:7-alpine
    
  # Serveur web
  nginx:
    image: nginx:alpine
    ports: ["80:80"]
    
  # Emails de développement
  mailhog:
    image: mailhog/mailhog
    ports: ["8025:8025"]
```

### Configuration Nginx

```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    
    # Frontend React
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
    }
    
    # API Laravel
    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 📊 Monitoring & Observabilité

### Logs Structurés

```php
// Configuration des logs Laravel
'channels' => [
    'stack' => [
        'driver' => 'stack',
        'channels' => ['single', 'slack'],
    ],
    'api' => [
        'driver' => 'daily',
        'path' => storage_path('logs/api.log'),
        'level' => 'info',
    ],
]
```

### Métriques Application

```javascript
// Monitoring frontend avec hooks
const usePerformanceMonitoring = () => {
  useEffect(() => {
    // Mesure du temps de chargement
    const startTime = performance.now();
    
    return () => {
      const loadTime = performance.now() - startTime;
      console.log(`Page loaded in ${loadTime}ms`);
    };
  }, []);
};
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy Application
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Backend Tests
        run: |
          cd gestion-hospitaliere-backend
          composer install
          php artisan test
      
      - name: Run Frontend Tests
        run: |
          cd gestion-hospitaliere-frontend
          npm install
          npm test
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        run: |
          docker-compose -f docker-compose.prod.yml up -d
```

## 🎯 Patterns & Bonnes Pratiques

### Repository Pattern (Backend)

```php
interface PatientRepositoryInterface
{
    public function findById(int $id): ?Patient;
    public function create(array $data): Patient;
    public function update(int $id, array $data): bool;
}

class PatientRepository implements PatientRepositoryInterface
{
    public function findById(int $id): ?Patient
    {
        return Patient::with(['user', 'rendezvous'])->find($id);
    }
}
```

### Custom Hooks (Frontend)

```javascript
// Hook pour les mutations API
const useMutation = (endpoint) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const mutate = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(endpoint, data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return { mutate, loading, error };
};
```

## 📈 Scalabilité

### Horizontal Scaling

```yaml
# kubernetes/deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    spec:
      containers:
      - name: php-fpm
        image: gestion-hopital-backend:latest
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### Load Balancing

```nginx
# nginx-lb.conf
upstream backend_servers {
    server backend-1:8000;
    server backend-2:8000;
    server backend-3:8000;
}

server {
    location /api {
        proxy_pass http://backend_servers;
    }
}
```

---

**Cette architecture garantit une application robuste, sécurisée et évolutive pour la gestion hospitalière moderne.**