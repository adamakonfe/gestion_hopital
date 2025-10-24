import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Sidebar spécifique pour les patients
 */
const PatientSidebar = ({ activeTab, setActiveTab, prochainRdv }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'overview', icon: '🏠', label: 'Accueil', color: 'indigo' },
    { id: 'mes-rdv', icon: '📅', label: 'Mes Rendez-vous', color: 'green' },
    { id: 'prendre-rdv', icon: '➕', label: 'Prendre RDV', color: 'blue' },
    { id: 'mes-prescriptions', icon: '💊', label: 'Mes Prescriptions', color: 'pink' },
    { id: 'medecins', icon: '👨‍⚕️', label: 'Médecins', color: 'purple' },
  ];

  const getActiveClass = (itemId) => {
    if (activeTab === itemId) {
      return 'bg-indigo-100 text-indigo-700 border-l-4 border-indigo-600';
    }
    return 'text-gray-700 hover:bg-gray-100 border-l-4 border-transparent';
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 bg-indigo-600 text-white p-3 rounded-lg shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-3xl mr-3">👤</span>
              <div>
                <h2 className="text-xl font-bold">Mon Espace</h2>
                <p className="text-sm opacity-90">Santé</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-white hover:bg-white hover:bg-opacity-20 rounded p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs opacity-90">{user?.email}</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 1024) {
                      setIsOpen(false);
                    }
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${getActiveClass(item.id)}`}
                >
                  <span className="text-2xl mr-3">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>

          {/* Prochain RDV Card */}
          <div className="mt-6 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
            <h3 className="text-sm font-semibold text-indigo-900 mb-2">Prochain RDV</h3>
            <div className="text-sm text-indigo-700">
              {prochainRdv ? (
                <>
                  <p className="font-medium">
                    Dr. {prochainRdv.medecin?.user?.name || prochainRdv.medecin?.nom || 'Médecin'}
                  </p>
                  <p className="text-xs">
                    {new Date(prochainRdv.date_heure).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'short'
                    })} à {new Date(prochainRdv.date_heure).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </>
              ) : (
                <p className="text-xs text-gray-500">Aucun rendez-vous programmé</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 space-y-2">
            <button
              onClick={() => setActiveTab('prendre-rdv')}
              className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              ➕ Nouveau RDV
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
};

export default PatientSidebar;
