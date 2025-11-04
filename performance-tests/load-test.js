import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Métriques personnalisées
export const errorRate = new Rate('errors');

// Configuration du test de charge
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Montée en charge progressive
    { duration: '5m', target: 10 }, // Maintien de la charge
    { duration: '2m', target: 20 }, // Augmentation de la charge
    { duration: '5m', target: 20 }, // Maintien de la charge élevée
    { duration: '2m', target: 0 },  // Descente en charge
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% des requêtes doivent être < 500ms
    http_req_failed: ['rate<0.1'],    // Taux d'erreur < 10%
    errors: ['rate<0.1'],             // Taux d'erreur métier < 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_URL = __ENV.API_URL || 'http://localhost:8000';

// Données de test
const testUsers = [
  { email: 'admin@hospital.com', password: 'password' },
  { email: 'dupont@example.com', password: 'password' },
  { email: 'patient@example.com', password: 'password' },
];

export function setup() {
  // Vérification que l'application est accessible
  const healthCheck = http.get(`${API_URL}/api/health`);
  check(healthCheck, {
    'Application is healthy': (r) => r.status === 200,
  });
  
  return { baseUrl: BASE_URL, apiUrl: API_URL };
}

export default function (data) {
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  
  // Test 1: Page d'accueil
  let response = http.get(`${data.baseUrl}/`);
  check(response, {
    'Homepage loads': (r) => r.status === 200,
    'Homepage has title': (r) => r.body.includes('<title>'),
  }) || errorRate.add(1);

  sleep(1);

  // Test 2: API Health Check
  response = http.get(`${data.apiUrl}/api/health`);
  check(response, {
    'API health check': (r) => r.status === 200,
    'API returns JSON': (r) => r.headers['Content-Type'].includes('application/json'),
  }) || errorRate.add(1);

  sleep(1);

  // Test 3: Login API
  const loginPayload = JSON.stringify({
    email: user.email,
    password: user.password,
  });

  const loginParams = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  response = http.post(`${data.apiUrl}/api/login`, loginPayload, loginParams);
  const loginSuccess = check(response, {
    'Login successful': (r) => r.status === 200,
    'Login returns token': (r) => {
      try {
        const json = JSON.parse(r.body);
        return json.token !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  if (!loginSuccess) {
    errorRate.add(1);
    return;
  }

  // Extraire le token
  let token;
  try {
    const loginJson = JSON.parse(response.body);
    token = loginJson.token;
  } catch (e) {
    errorRate.add(1);
    return;
  }

  sleep(1);

  // Test 4: API authentifiée - Dashboard
  const authParams = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  };

  response = http.get(`${data.apiUrl}/api/dashboard`, authParams);
  check(response, {
    'Dashboard API accessible': (r) => r.status === 200,
    'Dashboard returns data': (r) => {
      try {
        const json = JSON.parse(r.body);
        return typeof json === 'object';
      } catch (e) {
        return false;
      }
    },
  }) || errorRate.add(1);

  sleep(1);

  // Test 5: API Métriques (pour Prometheus)
  response = http.get(`${data.apiUrl}/api/metrics`);
  check(response, {
    'Metrics endpoint accessible': (r) => r.status === 200,
    'Metrics in Prometheus format': (r) => r.body.includes('hospital_users_total'),
  }) || errorRate.add(1);

  sleep(1);

  // Test 6: Liste des services (endpoint public)
  response = http.get(`${data.apiUrl}/api/services`);
  check(response, {
    'Services list accessible': (r) => r.status === 200,
    'Services list returns array': (r) => {
      try {
        const json = JSON.parse(r.body);
        return Array.isArray(json.data || json);
      } catch (e) {
        return false;
      }
    },
  }) || errorRate.add(1);

  sleep(2);
}

export function teardown(data) {
  // Nettoyage après les tests
  console.log('Load test completed');
}
