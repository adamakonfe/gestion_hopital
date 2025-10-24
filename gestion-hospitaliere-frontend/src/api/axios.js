import axios from 'axios';

/**
 * Configuration centralisée d'Axios pour l'application
 * Gère l'URL de base, les intercepteurs et les headers
 */

// Configuration de base
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur de requête - Ajouter le token JWT
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse - Gérer les erreurs globalement
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Gérer les erreurs d'authentification
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    // Gérer les erreurs de validation
    if (error.response?.status === 422) {
      const errors = error.response.data.errors;
      console.error('Erreurs de validation:', errors);
    }

    // Gérer les erreurs serveur
    if (error.response?.status >= 500) {
      console.error('Erreur serveur:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

/**
 * Fonctions utilitaires pour les requêtes API
 */

// GET request
export const get = (url, config = {}) => {
  return axiosInstance.get(url, config);
};

// POST request
export const post = (url, data, config = {}) => {
  return axiosInstance.post(url, data, config);
};

// PUT request
export const put = (url, data, config = {}) => {
  return axiosInstance.put(url, data, config);
};

// DELETE request
export const del = (url, config = {}) => {
  return axiosInstance.delete(url, config);
};

// Upload de fichier
export const upload = (url, formData, onUploadProgress = null) => {
  return axiosInstance.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
};
