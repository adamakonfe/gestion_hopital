# Guide du Pattern Repository - Gestion Hospitalière

## 📋 Vue d'ensemble

Le pattern Repository a été implémenté dans ce projet pour séparer la logique d'accès aux données de la logique métier. Cette architecture améliore la testabilité, la maintenabilité et la flexibilité du code.

## 🏗️ Structure du Pattern Repository

### 1. Architecture des Repositories

```
app/
├── Repositories/
│   ├── Contracts/                    # Interfaces
│   │   ├── BaseRepositoryInterface.php
│   │   ├── PatientRepositoryInterface.php
│   │   ├── MedecinRepositoryInterface.php
│   │   ├── RendezvousRepositoryInterface.php
│   │   └── ChambreRepositoryInterface.php
│   ├── BaseRepository.php            # Repository de base
│   ├── PatientRepository.php         # Implémentation Patient
│   ├── MedecinRepository.php         # Implémentation Médecin
│   ├── RendezvousRepository.php      # Implémentation Rendez-vous
│   └── ChambreRepository.php         # Implémentation Chambre
├── Services/                         # Services métier
│   └── RendezvousService.php
└── Providers/
    └── RepositoryServiceProvider.php # Injection de dépendances
```

### 2. Fonctionnalités du BaseRepository

Le `BaseRepository` fournit les méthodes CRUD de base :

- `all()` - Récupérer tous les enregistrements
- `find()` - Trouver par ID
- `create()` - Créer un enregistrement
- `update()` - Mettre à jour
- `delete()` - Supprimer
- `paginate()` - Pagination
- `where()` - Conditions de recherche
- `with()` - Chargement des relations

## 🚀 Utilisation

### 1. Dans les Contrôleurs

```php
<?php

namespace App\Http\Controllers\Api;

use App\Repositories\Contracts\PatientRepositoryInterface;

class PatientController extends Controller
{
    protected PatientRepositoryInterface $patientRepository;

    public function __construct(PatientRepositoryInterface $patientRepository)
    {
        $this->patientRepository = $patientRepository;
    }

    public function index(Request $request)
    {
        if ($request->has('search')) {
            return $this->patientRepository->searchByNameOrEmail($request->search);
        }
        
        return $this->patientRepository->paginate(15);
    }
}
```

### 2. Méthodes Spécialisées

Chaque repository a ses propres méthodes métier :

#### PatientRepository
```php
// Recherche par nom ou email
$patients = $patientRepository->searchByNameOrEmail('John');

// Patients d'un médecin
$patients = $patientRepository->getPatientsByMedecin($medecinId);

// Patients hospitalisés
$patients = $patientRepository->getHospitalizedPatients();

// Ajouter un document
$patient = $patientRepository->addDocument($patientId, $fileName, $fileType, $filePath);
```

#### RendezvousRepository
```php
// Rendez-vous d'un patient
$rendezvous = $rendezvousRepository->getRendezvousByPatient($patientId);

// Rendez-vous du jour
$rendezvous = $rendezvousRepository->getTodayRendezvous();

// Vérifier disponibilité
$isAvailable = $rendezvousRepository->checkMedecinAvailability($medecinId, $dateTime);

// Créneaux libres
$slots = $rendezvousRepository->getAvailableSlots($medecinId, $date);
```

### 3. Services Métier

Les services utilisent les repositories pour les opérations complexes :

```php
<?php

namespace App\Services;

use App\Repositories\Contracts\RendezvousRepositoryInterface;

class RendezvousService
{
    public function createRendezvous(array $data): Rendezvous
    {
        // Vérifier disponibilité
        $isAvailable = $this->rendezvousRepository->checkMedecinAvailability(
            $data['medecin_id'], 
            $dateTime
        );

        if (!$isAvailable) {
            throw new \Exception('Médecin non disponible');
        }

        // Créer et notifier
        $rendezvous = $this->rendezvousRepository->create($data);
        // ... notifications
        
        return $rendezvous;
    }
}
```

## 🧪 Tests

### Test d'un Repository

```php
<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Repositories\PatientRepository;

class PatientRepositoryTest extends TestCase
{
    protected PatientRepository $patientRepository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->patientRepository = new PatientRepository();
    }

    /** @test */
    public function it_can_search_patients_by_name()
    {
        // Arrange
        $user = User::factory()->create(['name' => 'John Doe']);
        Patient::factory()->create(['user_id' => $user->id]);

        // Act
        $results = $this->patientRepository->searchByNameOrEmail('John');

        // Assert
        $this->assertCount(1, $results);
        $this->assertEquals('John Doe', $results->first()->user->name);
    }
}
```

## ✅ Avantages du Pattern Repository

### 1. **Séparation des Responsabilités**
- Logique d'accès aux données isolée
- Contrôleurs plus légers et focalisés
- Services métier indépendants de la persistance

### 2. **Testabilité Améliorée**
- Mocking facile des repositories
- Tests unitaires plus rapides
- Isolation des tests de base de données

### 3. **Flexibilité**
- Changement de source de données transparent
- Implémentations multiples possibles
- Cache facilement intégrable

### 4. **Réutilisabilité**
- Méthodes communes dans BaseRepository
- Logique métier réutilisable
- Code DRY (Don't Repeat Yourself)

## 🔧 Configuration

### 1. Service Provider

Le `RepositoryServiceProvider` lie les interfaces aux implémentations :

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(PatientRepositoryInterface::class, PatientRepository::class);
        $this->app->bind(MedecinRepositoryInterface::class, MedecinRepository::class);
        // ...
    }
}
```

### 2. Enregistrement dans Laravel

Le provider est enregistré dans `bootstrap/providers.php` :

```php
return [
    App\Providers\AppServiceProvider::class,
    App\Providers\RepositoryServiceProvider::class,
];
```

## 📚 Bonnes Pratiques

### 1. **Nommage**
- Interface : `{Model}RepositoryInterface`
- Implémentation : `{Model}Repository`
- Méthodes descriptives : `getPatientsByMedecin()`

### 2. **Méthodes**
- Une responsabilité par méthode
- Paramètres typés
- Documentation des méthodes complexes

### 3. **Relations**
- Chargement eager loading quand nécessaire
- Paramètre `$relations` pour la flexibilité
- Éviter les requêtes N+1

### 4. **Gestion d'Erreurs**
- Exceptions métier appropriées
- Validation des paramètres
- Messages d'erreur explicites

## 🚀 Prochaines Étapes

1. **Étendre les Repositories** - Ajouter d'autres modèles
2. **Cache** - Implémenter le cache dans les repositories
3. **Événements** - Ajouter des événements pour les actions CRUD
4. **Audit** - Traçabilité des modifications
5. **API Resources** - Intégration avec les resources Laravel

---

Ce pattern Repository offre une base solide pour l'évolution et la maintenance du système de gestion hospitalière.
