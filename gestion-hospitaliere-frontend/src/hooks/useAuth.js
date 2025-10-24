import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * Hook personnalisé pour la gestion de l'authentification
 * Gère le token JWT, l'utilisateur connecté et les opérations d'auth
 */
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupérer le token du localStorage
  const getToken = () => localStorage.getItem('token');

  // Sauvegarder le token
  const saveToken = (token) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  // Supprimer le token
  const removeToken = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  // Charger le profil utilisateur
  const loadUser = useCallback(async () => {
    const token = getToken();
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get('/api/profile');
      setUser(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement du profil:', err);
      removeToken();
      setUser(null);
      setError(err.response?.data?.message || 'Erreur de chargement du profil');
    } finally {
      setLoading(false);
    }
  }, []);

  // Connexion
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/login', { email, password });
      const { token, user: userData } = response.data;
      
      saveToken(token);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur de connexion';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Inscription
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/register', userData);
      const { token, user: newUser } = response.data;
      
      saveToken(token);
      setUser(newUser);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur d\'inscription';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const logout = async () => {
    try {
      await axios.post('/api/logout');
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    } finally {
      removeToken();
      setUser(null);
    }
  };

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  // Charger l'utilisateur au montage du composant
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    hasRole,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'Admin',
    isMedecin: user?.role === 'Médecin',
    isPatient: user?.role === 'Patient',
    isInfirmier: user?.role === 'Infirmier',
  };
};

export default useAuth;
