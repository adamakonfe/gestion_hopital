/**
 * Centralisation de tous les endpoints API
 * Facilite la maintenance et évite les erreurs de typage
 */

const API_ENDPOINTS = {
  // Authentification
  AUTH: {
    LOGIN: '/api/login',
    REGISTER: '/api/register',
    LOGOUT: '/api/logout',
    PROFILE: '/api/profile',
  },

  // Dashboard
  DASHBOARD: {
    INDEX: '/api/dashboard',
    GRAPHIQUES: '/api/dashboard/graphiques',
  },

  // Patients
  PATIENTS: {
    LIST: '/api/patients',
    CREATE: '/api/patients',
    SHOW: (id) => `/api/patients/${id}`,
    UPDATE: (id) => `/api/patients/${id}`,
    DELETE: (id) => `/api/patients/${id}`,
    DOWNLOAD_DOCUMENT: (id, docIndex) => `/api/patients/${id}/documents/${docIndex}`,
    DELETE_DOCUMENT: (id, docIndex) => `/api/patients/${id}/documents/${docIndex}`,
  },

  // Médecins
  MEDECINS: {
    LIST: '/api/medecins',
    CREATE: '/api/medecins',
    SHOW: (id) => `/api/medecins/${id}`,
    UPDATE: (id) => `/api/medecins/${id}`,
    DELETE: (id) => `/api/medecins/${id}`,
  },

  // Rendez-vous
  RENDEZVOUS: {
    LIST: '/api/rendezvous',
    CREATE: '/api/rendezvous',
    SHOW: (id) => `/api/rendezvous/${id}`,
    UPDATE: (id) => `/api/rendezvous/${id}`,
    DELETE: (id) => `/api/rendezvous/${id}`,
  },

  // Prescriptions
  PRESCRIPTIONS: {
    LIST: '/api/prescriptions',
    CREATE: '/api/prescriptions',
    SHOW: (id) => `/api/prescriptions/${id}`,
    UPDATE: (id) => `/api/prescriptions/${id}`,
    DELETE: (id) => `/api/prescriptions/${id}`,
  },

  // Factures
  FACTURES: {
    LIST: '/api/factures',
    CREATE: '/api/factures',
    SHOW: (id) => `/api/factures/${id}`,
    UPDATE: (id) => `/api/factures/${id}`,
    DELETE: (id) => `/api/factures/${id}`,
  },

  // Services
  SERVICES: {
    LIST: '/api/services',
    CREATE: '/api/services',
    SHOW: (id) => `/api/services/${id}`,
    UPDATE: (id) => `/api/services/${id}`,
    DELETE: (id) => `/api/services/${id}`,
  },

};

export default API_ENDPOINTS;
