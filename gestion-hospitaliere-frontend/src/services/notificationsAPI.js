import api from './api';

/**
 * Service API pour gérer les notifications
 * Note: Réutilise l'instance axios partagée avec baseURL et intercepteurs
 */
const notificationsAPI = {
  // Récupérer toutes les notifications (paginées)
  getAll: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  // Récupérer les notifications non lues
  getUnread: async () => {
    const response = await api.get('/notifications/unread');
    return response.data;
  },

  // Marquer une notification comme lue
  markAsRead: async (id) => {
    const response = await api.post(`/notifications/${id}/read`, {});
    return response.data;
  },

  // Marquer toutes les notifications comme lues
  markAllAsRead: async () => {
    const response = await api.post('/notifications/read-all', {});
    return response.data;
  },

  // Supprimer une notification
  delete: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  // Supprimer toutes les notifications lues
  deleteRead: async () => {
    const response = await api.delete('/notifications/read');
    return response.data;
  },
};

export default notificationsAPI;
