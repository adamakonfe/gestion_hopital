import React, { useState, useEffect } from 'react';
import notificationsAPI from '../services/notificationsAPI';

/**
 * Composant cloche de notifications avec badge
 */
const NotificationBell = ({ onNotificationClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // Charger les notifications non lues
  const loadUnreadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getUnread();
      setNotifications(response.notifications || []);
      setUnreadCount(response.count || 0);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnreadNotifications();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadUnreadNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      loadUnreadNotifications();
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      loadUnreadNotifications();
      setShowDropdown(false);
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="relative">
      {/* Bouton cloche */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Badge nombre */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown notifications */}
      {showDropdown && (
        <>
          {/* Overlay pour fermer */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Panel notifications */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-20 max-h-[500px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-lg transition-colors"
                  >
                    Tout marquer lu
                  </button>
                )}
              </div>
            </div>

            {/* Liste notifications */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-4xl mb-2">🔔</div>
                  <p>Aucune notification</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => {
                        handleMarkAsRead(notification.id);
                        if (onNotificationClick) {
                          onNotificationClick(notification);
                        }
                        setShowDropdown(false);
                      }}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                          {notification.data?.type === 'rendezvous_assigned' ? (
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                              📅
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-xl">
                              🔔
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.data?.message || 'Nouvelle notification'}
                          </p>
                          
                          {notification.data?.patient_name && (
                            <p className="text-sm text-gray-600 mt-1">
                              Patient: {notification.data.patient_name}
                            </p>
                          )}
                          
                          {notification.data?.date_formatted && (
                            <p className="text-sm text-gray-600">
                              {notification.data.date_formatted}
                            </p>
                          )}
                          
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(notification.created_at)}
                          </p>
                        </div>
                        
                        <div className="flex-shrink-0 ml-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    // Naviguer vers page notifications complète si nécessaire
                  }}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Voir toutes les notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
