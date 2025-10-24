import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * Hook personnalisé pour les requêtes API
 * Gère le chargement, les erreurs et le cache
 * 
 * @param {string} url - URL de l'API
 * @param {object} options - Options de configuration
 * @returns {object} - { data, loading, error, refetch }
 */
const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    method = 'GET',
    body = null,
    dependencies = [],
    skip = false,
    onSuccess = null,
    onError = null,
  } = options;

  const fetchData = useCallback(async () => {
    if (skip) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const config = {
        method,
        url,
        ...(body && { data: body }),
      };

      const response = await axios(config);
      setData(response.data);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Une erreur est survenue';
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [url, method, body, skip, onSuccess, onError]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
};

/**
 * Hook pour les mutations (POST, PUT, DELETE)
 * 
 * @param {string} url - URL de l'API
 * @param {string} method - Méthode HTTP
 * @returns {object} - { mutate, loading, error, data }
 */
export const useMutation = (url, method = 'POST') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (body, config = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios({
        method,
        url,
        data: body,
        ...config,
      });

      setData(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Une erreur est survenue';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return { mutate, loading, error, data, reset };
};

/**
 * Hook pour la pagination
 * 
 * @param {string} url - URL de l'API
 * @param {number} initialPage - Page initiale
 * @param {number} perPage - Éléments par page
 * @returns {object} - { data, loading, error, page, setPage, hasMore, refetch }
 */
export const usePagination = (url, initialPage = 1, perPage = 15) => {
  const [page, setPage] = useState(initialPage);
  const [allData, setAllData] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const paginatedUrl = `${url}?page=${page}&per_page=${perPage}`;
  
  const { data, loading, error, refetch } = useFetch(paginatedUrl, {
    dependencies: [page],
    onSuccess: (response) => {
      if (response.data) {
        setAllData(prev => page === 1 ? response.data : [...prev, ...response.data]);
        setHasMore(response.current_page < response.last_page);
      }
    },
  });

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const reset = () => {
    setPage(1);
    setAllData([]);
    setHasMore(true);
  };

  return {
    data: allData,
    loading,
    error,
    page,
    setPage,
    hasMore,
    loadMore,
    refetch,
    reset,
  };
};

export default useFetch;
