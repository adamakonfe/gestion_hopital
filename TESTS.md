# 🧪 Guide des Tests - Gestion Hospitalière

> Documentation complète de la stratégie de tests

---

## 📋 Vue d'Ensemble

### Stratégie de Tests
- **Tests Unitaires** : Logique métier isolée
- **Tests d'Intégration** : API et base de données
- **Tests E2E** : Parcours utilisateur complets
- **Tests de Performance** : Charge et stress
- **Tests de Sécurité** : Vulnérabilités et authentification

### Couverture Cible
- **Backend :** 80% minimum
- **Frontend :** 70% minimum
- **E2E :** Parcours critiques couverts

---

## 🔧 Backend Tests (PHPUnit)

### Configuration

#### phpunit.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="./vendor/phpunit/phpunit/phpunit.xsd"
         bootstrap="vendor/autoload.php"
         colors="true">
    <testsuites>
        <testsuite name="Unit">
            <directory suffix="Test.php">./tests/Unit</directory>
        </testsuite>
        <testsuite name="Feature">
            <directory suffix="Test.php">./tests/Feature</directory>
        </testsuite>
    </testsuites>
    <coverage>
        <include>
            <directory suffix=".php">./app</directory>
        </include>
    </coverage>
</phpunit>
```

### Structure des Tests
```
tests/
├── Feature/                 # Tests d'intégration
│   ├── AuthTest.php
│   ├── PatientTest.php
│   ├── MedecinTest.php
│   ├── RendezvousTest.php
│   └── DocumentTest.php
├── Unit/                    # Tests unitaires
│   ├── Models/
│   │   ├── UserTest.php
│   │   ├── PatientTest.php
│   │   └── RendezvousTest.php
│   ├── Services/
│   │   ├── AuthServiceTest.php
│   │   └── NotificationServiceTest.php
│   └── Helpers/
│       └── DateHelperTest.php
└── TestCase.php            # Base test class
```

### Exemples de Tests

#### Test d'Authentification
```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_with_valid_credentials()
    {
        $user = User::factory()->create([
            'email' => 'test@hospital.com',
            'password' => bcrypt('password')
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@hospital.com',
            'password' => 'password'
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         'user',
                         'token'
                     ]
                 ]);
    }

    public function test_user_cannot_login_with_invalid_credentials()
    {
        $response = $this->postJson('/api/login', [
            'email' => 'wrong@hospital.com',
            'password' => 'wrongpassword'
        ]);

        $response->assertStatus(401)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Invalid credentials'
                 ]);
    }
}
```

#### Test de Gestion des Patients
```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Patient;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PatientTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    public function test_admin_can_create_patient()
    {
        $patientData = [
            'name' => 'Test Patient',
            'email' => 'patient@test.com',
            'date_naissance' => '1990-01-01',
            'sexe' => 'M',
            'adresse' => '123 Test Street',
            'telephone' => '0123456789'
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
                         ->postJson('/api/patients', $patientData);

        $response->assertStatus(201)
                 ->assertJsonFragment([
                     'name' => 'Test Patient',
                     'email' => 'patient@test.com'
                 ]);

        $this->assertDatabaseHas('patients', [
            'date_naissance' => '1990-01-01',
            'sexe' => 'M'
        ]);
    }

    public function test_patient_creation_validates_required_fields()
    {
        $response = $this->actingAs($this->admin, 'sanctum')
                         ->postJson('/api/patients', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors([
                     'name', 'email', 'date_naissance'
                 ]);
    }
}
```

### Commandes de Test
```bash
# Tous les tests
php artisan test

# Tests avec couverture
php artisan test --coverage

# Tests spécifiques
php artisan test --filter=PatientTest

# Tests avec détails
php artisan test --verbose

# Tests en parallèle
php artisan test --parallel
```

---

## ⚛️ Frontend Tests (Jest + React Testing Library)

### Configuration

#### jest.config.js
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

#### setupTests.js
```javascript
import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Mock API server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;
```

### Structure des Tests
```
src/
├── __tests__/
│   ├── components/
│   │   ├── Dashboard.test.js
│   │   ├── PatientList.test.js
│   │   └── LoginForm.test.js
│   ├── hooks/
│   │   ├── useAuth.test.js
│   │   └── useFetch.test.js
│   ├── pages/
│   │   ├── Login.test.js
│   │   └── Patients.test.js
│   └── utils/
│       └── api.test.js
├── mocks/
│   ├── handlers.js
│   └── server.js
└── setupTests.js
```

### Exemples de Tests

#### Test de Composant
```javascript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { AuthProvider } from '../contexts/AuthContext';

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('LoginForm', () => {
  test('renders login form elements', () => {
    renderWithProviders(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('submits form with valid data', async () => {
    const mockLogin = jest.fn();
    renderWithProviders(<LoginForm onLogin={mockLogin} />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'admin@hospital.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'admin@hospital.com',
        password: 'password'
      });
    });
  });

  test('displays error for invalid credentials', async () => {
    renderWithProviders(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'wrong@email.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
```

#### Test de Hook Personnalisé
```javascript
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../hooks/useAuth';
import { AuthProvider } from '../contexts/AuthContext';

const wrapper = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth', () => {
  test('should login user successfully', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await result.current.login('admin@hospital.com', 'password');
    });
    
    expect(result.current.user).toBeDefined();
    expect(result.current.isAuthenticated).toBe(true);
  });

  test('should logout user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // First login
    await act(async () => {
      await result.current.login('admin@hospital.com', 'password');
    });
    
    // Then logout
    await act(async () => {
      result.current.logout();
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

### Commandes de Test
```bash
# Tous les tests
npm test

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm test -- --watch

# Tests spécifiques
npm test -- --testPathPattern=LoginForm
```

---

## 🎭 Tests E2E (Playwright)

### Configuration

#### playwright.config.js
```javascript
module.exports = {
  testDir: './e2e',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    }
  ],
  webServer: {
    command: 'npm start',
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
};
```

### Structure des Tests E2E
```
e2e/
├── tests/
│   ├── auth.spec.js
│   ├── patient-management.spec.js
│   ├── appointment-booking.spec.js
│   └── dashboard.spec.js
├── fixtures/
│   ├── users.json
│   └── patients.json
└── utils/
    ├── auth-helper.js
    └── test-data.js
```

### Exemples de Tests E2E

#### Test de Connexion
```javascript
const { test, expect } = require('@playwright/test');

test.describe('Authentication', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/');
    
    // Fill login form
    await page.fill('[data-testid=email-input]', 'admin@hospital.com');
    await page.fill('[data-testid=password-input]', 'password');
    await page.click('[data-testid=login-button]');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid=welcome-message]')).toContainText('Bienvenue');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('[data-testid=email-input]', 'wrong@email.com');
    await page.fill('[data-testid=password-input]', 'wrongpassword');
    await page.click('[data-testid=login-button]');
    
    await expect(page.locator('[data-testid=error-message]')).toContainText('Invalid credentials');
  });
});
```

#### Test de Gestion des Patients
```javascript
const { test, expect } = require('@playwright/test');

test.describe('Patient Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/');
    await page.fill('[data-testid=email-input]', 'admin@hospital.com');
    await page.fill('[data-testid=password-input]', 'password');
    await page.click('[data-testid=login-button]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create new patient', async ({ page }) => {
    // Navigate to patients page
    await page.click('[data-testid=patients-menu]');
    await expect(page).toHaveURL('/patients');
    
    // Click new patient button
    await page.click('[data-testid=new-patient-button]');
    
    // Fill patient form
    await page.fill('[data-testid=patient-name]', 'Test Patient');
    await page.fill('[data-testid=patient-email]', 'test@patient.com');
    await page.fill('[data-testid=patient-phone]', '0123456789');
    await page.selectOption('[data-testid=patient-gender]', 'M');
    await page.fill('[data-testid=patient-address]', '123 Test Street');
    
    // Submit form
    await page.click('[data-testid=save-patient-button]');
    
    // Verify success
    await expect(page.locator('[data-testid=success-message]')).toContainText('Patient créé avec succès');
    await expect(page.locator('[data-testid=patient-list]')).toContainText('Test Patient');
  });

  test('should search patients', async ({ page }) => {
    await page.goto('/patients');
    
    // Search for patient
    await page.fill('[data-testid=search-input]', 'Test Patient');
    
    // Verify search results
    await expect(page.locator('[data-testid=patient-list]')).toContainText('Test Patient');
    await expect(page.locator('[data-testid=patient-count]')).toContainText('1 résultat');
  });
});
```

### Commandes E2E
```bash
# Installer Playwright
npx playwright install

# Tous les tests E2E
npx playwright test

# Tests avec interface graphique
npx playwright test --ui

# Tests spécifiques
npx playwright test auth.spec.js

# Générer un rapport
npx playwright show-report
```

---

## ⚡ Tests de Performance

### Configuration K6

#### performance-test.js
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

export let errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up
    { duration: '1m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% des requêtes < 500ms
    errors: ['rate<0.1'],             // Taux d'erreur < 10%
  },
};

export default function() {
  // Login
  let loginResponse = http.post('http://localhost:8000/api/login', {
    email: 'admin@hospital.com',
    password: 'password'
  });
  
  check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  let token = JSON.parse(loginResponse.body).data.token;
  
  // Get patients
  let patientsResponse = http.get('http://localhost:8000/api/patients', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  check(patientsResponse, {
    'patients status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  sleep(1);
}
```

### Tests de Charge
```bash
# Test de charge basique
k6 run performance-test.js

# Test avec plus d'utilisateurs
k6 run --vus 100 --duration 5m performance-test.js

# Test de stress
k6 run --vus 200 --duration 10m stress-test.js
```

---

## 🔒 Tests de Sécurité

### OWASP ZAP
```bash
# Scan de sécurité automatisé
docker run -v $(pwd):/zap/wrk/:rw \
  -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:3000 \
  -g gen.conf \
  -r testreport.html
```

### Tests de Sécurité Manuels
```javascript
// Test d'injection SQL
test('should prevent SQL injection', async ({ page }) => {
  await page.goto('/patients');
  await page.fill('[data-testid=search-input]', "'; DROP TABLE patients; --");
  
  // Vérifier que l'application ne plante pas
  await expect(page.locator('[data-testid=patient-list]')).toBeVisible();
});

// Test XSS
test('should prevent XSS attacks', async ({ page }) => {
  await page.goto('/patients/new');
  await page.fill('[data-testid=patient-name]', '<script>alert("XSS")</script>');
  await page.click('[data-testid=save-patient-button]');
  
  // Vérifier que le script n'est pas exécuté
  await expect(page.locator('text=<script>')).not.toBeVisible();
});
```

---

## 📊 Rapports et Métriques

### Coverage Reports
```bash
# Backend coverage
php artisan test --coverage-html coverage/backend

# Frontend coverage  
npm run test:coverage

# Voir les rapports
open coverage/backend/index.html
open coverage/lcov-report/index.html
```

### Métriques de Qualité
- **Couverture de code** : Pourcentage de code testé
- **Temps d'exécution** : Performance des tests
- **Taux de réussite** : Stabilité des tests
- **Complexité cyclomatique** : Qualité du code

---

## 🚀 CI/CD Integration

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: 8.2
      - name: Install dependencies
        run: composer install
      - name: Run tests
        run: php artisan test --coverage

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test -- --coverage --watchAll=false

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Playwright
        run: npx playwright install
      - name: Run E2E tests
        run: npx playwright test
```

---

## 📝 Bonnes Pratiques

### Tests Unitaires
- **Un test = une fonctionnalité**
- **Noms descriptifs** pour les tests
- **Arrange, Act, Assert** pattern
- **Mocks** pour les dépendances externes

### Tests d'Intégration
- **Base de données de test** séparée
- **Transactions** pour isolation
- **Données de test** cohérentes

### Tests E2E
- **Data attributes** pour sélecteurs
- **Page Object Model** pour réutilisabilité
- **Tests indépendants** (pas de dépendances)

---

*Guide des tests mis à jour le 5 novembre 2025*
