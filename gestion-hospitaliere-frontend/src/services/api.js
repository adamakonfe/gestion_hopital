import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';
console.log('API_BASE_URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => {
    console.log('authAPI.login called with:', credentials);
    return api.post('/login', credentials);
  },
  register: (userData) => {
    console.log('authAPI.register called with:', userData);
    return api.post('/register', userData);
  },
  logout: () => api.post('/logout'),
  profile: () => api.get('/profile'),
};

export const servicesAPI = {
  getAll: () => api.get('/services'),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

export const patientsAPI = {
  getAll: () => api.get('/patients'),
  getById: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
};

export const medecinsAPI = {
  getAll: () => api.get('/medecins'),
  getById: (id) => api.get(`/medecins/${id}`),
  create: (data) => api.post('/medecins', data),
  update: (id, data) => api.put(`/medecins/${id}`, data),
  delete: (id) => api.delete(`/medecins/${id}`),
};

export const rendezvousAPI = {
  getAll: () => api.get('/rendezvous'),
  getById: (id) => api.get(`/rendezvous/${id}`),
  create: (data) => api.post('/rendezvous', data),
  update: (id, data) => api.put(`/rendezvous/${id}`, data),
  delete: (id) => api.delete(`/rendezvous/${id}`),
};

export const facturesAPI = {
  getAll: () => api.get('/factures'),
  getById: (id) => api.get(`/factures/${id}`),
  create: (data) => api.post('/factures', data),
  update: (id, data) => api.put(`/factures/${id}`, data),
  delete: (id) => api.delete(`/factures/${id}`),
};

export const prescriptionsAPI = {
  getAll: () => api.get('/prescriptions'),
  getById: (id) => api.get(`/prescriptions/${id}`),
  create: (data) => api.post('/prescriptions', data),
  update: (id, data) => api.put(`/prescriptions/${id}`, data),
  delete: (id) => api.delete(`/prescriptions/${id}`),
};

export default api;