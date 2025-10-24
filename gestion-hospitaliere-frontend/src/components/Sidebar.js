import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ activeSection, setActiveSection, isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();

  const adminMenuItems = [
    { id: 'overview', icon: '📊', label: 'Vue d\'ensemble', color: 'blue' },
    { id: 'services', icon: '🏥', label: 'Services Médicaux', color: 'blue' },
    { id: 'medecins', icon: '👨‍⚕️', label: 'Médecins', color: 'green' },
    { id: 'patients', icon: '👥', label: 'Patients', color: 'purple' },
    { id: 'rendezvous-admin', icon: '📅', label: 'Rendez-vous', color: 'yellow' },
    { id: 'factures', icon: '💰', label: 'Factures', color: 'red' },
    { id: 'rapports', icon: '📈', label: 'Rapports', color: 'indigo' },
  ];

  const medecinMenuItems = [
    { id: 'overview', icon: '📊', label: 'Vue d\'ensemble', color: 'blue' },
    { id: 'mes-rendezvous', icon: '📅', label: 'Mes Rendez-vous', color: 'blue' },
    { id: 'creer-prescription', icon: '📝', label: 'Prescriptions', color: 'green' },
    { id: 'mes-patients', icon: '👥', label: 'Mes Patients', color: 'purple' },
  ];

  const patientMenuItems = [
    { id: 'overview', icon: '📊', label: 'Vue d\'ensemble', color: 'blue' },
    { id: 'prendre-rendezvous', icon: '📅', label: 'Prendre RDV', color: 'blue' },
    { id: 'mes-rendezvous-patient', icon: '📋', label: 'Mes RDV', color: 'green' },
    { id: 'mes-prescriptions', icon: '💊', label: 'Ordonnances', color: 'purple' },
    { id: 'mes-factures', icon: '💰', label: 'Factures', color: 'yellow' },
  ];

  const getMenuItems = () => {
    switch (user?.role) {
      case 'Admin':
        return adminMenuItems;
      case 'Médecin':
        return medecinMenuItems;
      case 'Patient':
        return patientMenuItems;
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const getRoleColor = () => {
    switch (user?.role) {
      case 'Admin':
        return 'from-blue-600 to-purple-600';
      case 'Médecin':
        return 'from-green-600 to-teal-600';
      case 'Patient':
        return 'from-purple-600 to-pink-600';
      default:
        return 'from-gray-600 to-gray-800';
    }
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'Admin':
        return '🏥';
      case 'Médecin':
        return '👨‍⚕️';
      case 'Patient':
        return '👤';
      default:
        return '👤';
    }
  };

  const getActiveItemClass = (color) => {
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-700 shadow-md',
      green: 'bg-green-100 text-green-700 shadow-md',
      purple: 'bg-purple-100 text-purple-700 shadow-md',
      yellow: 'bg-yellow-100 text-yellow-700 shadow-md',
      red: 'bg-red-100 text-red-700 shadow-md',
      indigo: 'bg-indigo-100 text-indigo-700 shadow-md',
    };
    return colorClasses[color] || 'bg-gray-100 text-gray-700 shadow-md';
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

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${getRoleColor()} p-6 text-white`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-3xl mr-3">{getRoleIcon()}</span>
              <div>
                <h2 className="text-xl font-bold">Gestion</h2>
                <p className="text-sm opacity-90">Hospitalière</p>
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
            <p className="text-xs opacity-90">{user?.role}</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveSection(item.id);
                    if (window.innerWidth < 1024) {
                      setIsOpen(false);
                    }
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeSection === item.id
                      ? getActiveItemClass(item.color)
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-2xl mr-3">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
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

export default Sidebar;
