import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { patientsAPI, medecinsAPI, rendezvousAPI, prescriptionsAPI, facturesAPI, servicesAPI } from '../services/api';
import Layout from '../components/Layout';

// Mock data for charts
const chartData = [
  { name: 'Jan', patients: 40, medecins: 24, rendezvous: 60 },
  { name: 'Fév', patients: 30, medecins: 13, rendezvous: 45 },
  { name: 'Mar', patients: 20, medecins: 98, rendezvous: 80 },
  { name: 'Avr', patients: 27, medecins: 39, rendezvous: 65 },
  { name: 'Mai', patients: 18, medecins: 48, rendezvous: 70 },
  { name: 'Jun', patients: 23, medecins: 38, rendezvous: 55 },
];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [medecins, setMedecins] = useState([]);
  const [rendezvous, setRendezvous] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [factures, setFactures] = useState([]);
  const [services, setServices] = useState([]);
  const [bookingForm, setBookingForm] = useState({
    medecin_id: '',
    date_heure: '',
    motif: '',
    notes: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({
    patient_id: '',
    contenu: '',
    date: '',
    fichier_pdf: null
  });
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    nom: '',
    description: ''
  });
  const [serviceLoading, setServiceLoading] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);

  useEffect(() => {
    if (activeSection === 'patients' || activeSection === 'mes-patients') {
      fetchPatients();
    }
    if (activeSection === 'prendre-rendezvous') {
      fetchMedecins();
    }
    if (activeSection === 'mes-rendezvous-patient' || activeSection === 'mes-rendezvous' || activeSection === 'rendezvous-admin') {
      fetchRendezvous();
    }
    if (activeSection === 'mes-prescriptions' || activeSection === 'creer-prescription') {
      fetchPrescriptions();
      if (activeSection === 'creer-prescription' && user.role === 'Médecin') {
        fetchPatients(); // For patient selection in prescription creation
      }
    }
    if (activeSection === 'mes-factures') {
      fetchFactures();
    }
    if (activeSection === 'services') {
      fetchServices();
    }
  }, [activeSection, user.role]);

  const fetchServices = async () => {
    try {
      const response = await servicesAPI.getAll();
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchMedecins();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await patientsAPI.getAll();
      // Le backend retourne un objet paginé avec data.data
      setPatients(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedecins = async () => {
    setLoading(true);
    try {
      const response = await medecinsAPI.getAll();
      // Gérer la réponse paginée ou directe
      setMedecins(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching medecins:', error);
      setMedecins([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await prescriptionsAPI.getAll();
      setPrescriptions(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFactures = async () => {
    setLoading(true);
    try {
      const response = await facturesAPI.getAll();
      setFactures(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching factures:', error);
      setFactures([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRendezvous = async () => {
    setLoading(true);
    try {
      console.log('Fetching rendezvous for user:', user?.role);
      const response = await rendezvousAPI.getAll();
      console.log('Rendezvous response:', response.data);
      setRendezvous(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching rendezvous:', error);
      setRendezvous([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleUpdateAppointmentStatus = async (rdvId, newStatus) => {
    try {
      const response = await fetch(`/api/rendezvous/${rdvId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          statut: newStatus
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Statut mis à jour avec succès!');
        fetchRendezvous(); // Recharger la liste
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      alert('Erreur lors de la mise à jour du statut');
      console.error(error);
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    setServiceLoading(true);
    
    try {
      await servicesAPI.create(serviceForm);
      alert('Service créé avec succès!');
      setServiceForm({ nom: '', description: '' });
      setShowServiceForm(false);
      fetchServices(); // Recharger la liste
    } catch (error) {
      alert('Erreur lors de la création du service');
      console.error(error);
    } finally {
      setServiceLoading(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      try {
        await servicesAPI.delete(serviceId);
        alert('Service supprimé avec succès!');
        fetchServices(); // Recharger la liste
      } catch (error) {
        alert('Erreur lors de la suppression du service');
        console.error(error);
      }
    }
  };

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900">Total Patients</h3>
        <p className="text-3xl font-bold text-blue-600">1,234</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900">Médecins Actifs</h3>
        <p className="text-3xl font-bold text-green-600">{medecins.length}</p>
        <p className="text-sm text-gray-600">Disponibles pour consultations</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900">Rendez-vous Aujourd'hui</h3>
        <p className="text-3xl font-bold text-yellow-600">23</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900">Services Médicaux</h3>
        <p className="text-3xl font-bold text-purple-600">{services.length}</p>
        <p className="text-sm text-gray-600">Spécialités disponibles</p>
      </div>
    </div>
  );

  const renderCharts = () => (
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques Mensuelles</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="patients" fill="#3B82F6" name="Patients" />
          <Bar dataKey="medecins" fill="#10B981" name="Médecins" />
          <Bar dataKey="rendezvous" fill="#F59E0B" name="Rendez-vous" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderRoleSpecificContent = () => {
    switch (user.role) {
      case 'Admin':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl shadow-lg text-white">
              <h3 className="text-2xl font-bold mb-2">🏥 Panneau Administrateur</h3>
              <p className="text-blue-100">Gérez votre établissement hospitalier</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div onClick={() => setActiveSection('services')} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border-l-4 border-blue-500 hover:scale-105">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <span className="text-2xl">🏥</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">Services Médicaux</h4>
                    <p className="text-gray-600 text-sm">Gérer les spécialités</p>
                  </div>
                </div>
              </div>
              <div onClick={() => setActiveSection('medecins')} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border-l-4 border-green-500 hover:scale-105">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full">
                    <span className="text-2xl">👨‍⚕️</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">Médecins</h4>
                    <p className="text-gray-600 text-sm">Gérer le personnel médical</p>
                  </div>
                </div>
              </div>
              <div onClick={() => setActiveSection('patients')} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border-l-4 border-purple-500 hover:scale-105">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">Patients</h4>
                    <p className="text-gray-600 text-sm">Gérer les dossiers patients</p>
                  </div>
                </div>
              </div>
              <div onClick={() => setActiveSection('rendezvous-admin')} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border-l-4 border-yellow-500 hover:scale-105">
                <div className="flex items-center">
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <span className="text-2xl">📅</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">Rendez-vous</h4>
                    <p className="text-gray-600 text-sm">Voir tous les RDV</p>
                  </div>
                </div>
              </div>
              <div onClick={() => setActiveSection('factures')} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border-l-4 border-red-500 hover:scale-105">
                <div className="flex items-center">
                  <div className="bg-red-100 p-3 rounded-full">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">Factures</h4>
                    <p className="text-gray-600 text-sm">Gestion financière</p>
                  </div>
                </div>
              </div>
              <div onClick={() => setActiveSection('rapports')} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border-l-4 border-indigo-500 hover:scale-105">
                <div className="flex items-center">
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">Rapports</h4>
                    <p className="text-gray-600 text-sm">Statistiques et analyses</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Médecin':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 rounded-xl shadow-lg text-white">
              <h3 className="text-2xl font-bold mb-2">👨⚕️ Espace Médecin</h3>
              <p className="text-green-100">Bienvenue Dr. {user.name}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div onClick={() => setActiveSection('mes-rendezvous')} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border-l-4 border-blue-500 hover:scale-105">
                <div className="text-center">
                  <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl">📅</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Mes Rendez-vous</h4>
                  <p className="text-gray-600 text-sm">Consultations du jour</p>
                </div>
              </div>
              <div onClick={() => setActiveSection('creer-prescription')} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border-l-4 border-green-500 hover:scale-105">
                <div className="text-center">
                  <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl">📝</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Prescriptions</h4>
                  <p className="text-gray-600 text-sm">Créer ordonnances</p>
                </div>
              </div>
              <div onClick={() => setActiveSection('mes-patients')} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border-l-4 border-purple-500 hover:scale-105">
                <div className="text-center">
                  <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl">👥</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Mes Patients</h4>
                  <p className="text-gray-600 text-sm">Dossiers médicaux</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Patient':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-xl shadow-lg text-white">
              <h3 className="text-2xl font-bold mb-2">👤 Espace Patient</h3>
              <p className="text-purple-100">Bonjour {user.name}, gérez vos soins</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div onClick={() => setActiveSection('prendre-rendezvous')} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border-l-4 border-blue-500 hover:scale-105">
                <div className="text-center">
                  <div className="bg-blue-100 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-4xl">📅</span>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Prendre RDV</h4>
                  <p className="text-gray-600">Réserver une consultation</p>
                </div>
              </div>
              <div onClick={() => setActiveSection('mes-rendezvous-patient')} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border-l-4 border-green-500 hover:scale-105">
                <div className="text-center">
                  <div className="bg-green-100 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-4xl">📋</span>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Mes RDV</h4>
                  <p className="text-gray-600">Consultations programmées</p>
                </div>
              </div>
              <div onClick={() => setActiveSection('mes-prescriptions')} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border-l-4 border-purple-500 hover:scale-105">
                <div className="text-center">
                  <div className="bg-purple-100 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-4xl">💊</span>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Ordonnances</h4>
                  <p className="text-gray-600">Mes prescriptions médicales</p>
                </div>
              </div>
              <div onClick={() => setActiveSection('mes-factures')} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border-l-4 border-yellow-500 hover:scale-105">
                <div className="text-center">
                  <div className="bg-yellow-100 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-4xl">💰</span>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Factures</h4>
                  <p className="text-gray-600">Mes paiements</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderServicesSection = () => (
    <div className="space-y-6 mt-8">
      {/* En-tête avec bouton d'ajout */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <span className="text-2xl">🏥</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Services Médicaux</h3>
              <p className="text-gray-600">Gérez les spécialités médicales de votre établissement</p>
            </div>
          </div>
          <button
            onClick={() => setShowServiceForm(!showServiceForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <span className="text-lg">+</span>
            <span>Nouveau Service</span>
          </button>
        </div>

        {/* Formulaire de création */}
        {showServiceForm && (
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Créer un nouveau service</h4>
            <form onSubmit={handleCreateService} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du service *
                  </label>
                  <input
                    type="text"
                    value={serviceForm.nom}
                    onChange={(e) => setServiceForm({...serviceForm, nom: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Neurologie"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Spécialiste du système nerveux"
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={serviceLoading}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {serviceLoading ? 'Création...' : 'Créer le Service'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowServiceForm(false);
                    setServiceForm({ nom: '', description: '' });
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des services */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <span className="text-6xl mb-4 block">🏥</span>
              <p className="text-gray-500 text-lg">Aucun service médical</p>
              <p className="text-sm text-gray-400 mt-2">Créez votre premier service pour commencer</p>
            </div>
          ) : (
            services.map((service) => (
              <div key={service.id} className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-lg font-semibold text-gray-900">{service.nom}</h4>
                  <button
                    onClick={() => handleDeleteService(service.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                    title="Supprimer le service"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-600 text-sm mb-3">{service.description || 'Aucune description'}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                    ID: {service.id}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderMedecinsSection = () => (
    <div className="bg-white p-6 rounded-xl shadow-lg mt-8">
      <div className="flex items-center mb-6">
        <div className="bg-green-100 p-3 rounded-full mr-4">
          <span className="text-2xl">👨⚕️</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Médecins</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {medecins.map((medecin) => (
          <div key={medecin.id} className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
            <h4 className="text-lg font-semibold text-gray-900">Dr. {medecin.user.name}</h4>
            <p className="text-green-600 text-sm">{medecin.specialite}</p>
            <p className="text-gray-600 text-sm">📧 {medecin.user.email}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <>
            {renderOverview()}
            {renderRoleSpecificContent()}
          </>
        );
      case 'services':
        return <div key="services-section">{renderServicesSection()}</div>;
      case 'medecins':
        return <div key="medecins-section">{renderMedecinsSection()}</div>;
      case 'patients':
      case 'mes-patients':
        return <div key="patients-section">{renderPatientsSection()}</div>;
      case 'prendre-rendezvous':
        return <div key="appointment-booking-section">{renderAppointmentBooking()}</div>;
      case 'mes-rendezvous-patient':
        return <div key="patient-appointments-section">{renderPatientAppointments()}</div>;
      case 'mes-rendezvous':
      case 'rendezvous-admin':
        return <div key="admin-appointments-section">{user?.role === 'Admin' ? renderAdminAppointments() : renderPatientAppointments()}</div>;
      case 'creer-prescription':
        return <div key="prescription-create-section">{renderPrescriptionCreation()}</div>;
      case 'mes-prescriptions':
        return <div key="patient-prescriptions-section">{renderPatientPrescriptions()}</div>;
      case 'mes-factures':
      case 'factures':
        return <div key="patient-bills-section">{renderPatientBills()}</div>;
      case 'rapports':
        return (
          <div key="charts-section">
            {renderCharts()}
          </div>
        );
      default:
        return (
          <div key={`default-section-${activeSection}`} className="bg-white p-6 rounded-xl shadow-lg mt-8">
            <div className="text-center py-12">
              <span className="text-6xl">🚧</span>
              <h3 className="text-xl font-semibold text-gray-900 mt-4">En développement</h3>
              <p className="text-gray-600">Section "{activeSection}" bientôt disponible</p>
            </div>
          </div>
        );
    }
  };

  const renderPatientsSection = () => (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">
          {activeSection === 'patients' ? 'Gérer les Patients' : 'Mes Patients'}
        </h3>
        <div className="text-sm text-gray-500">
          {patients.length} patient{patients.length > 1 ? 's' : ''}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-gray-500 text-lg">Aucun patient trouvé</p>
            </div>
          ) : (
            patients.map((patient) => (
              <div 
                key={patient.id} 
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Header Card */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-white bg-opacity-30 rounded-full flex items-center justify-center text-2xl mr-3">
                        👤
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{patient.user?.name || 'Patient'}</h4>
                        <p className="text-sm text-blue-100">{patient.user?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body Card */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start">
                    <span className="text-gray-400 text-sm w-32 flex-shrink-0">📅 Naissance:</span>
                    <span className="text-gray-700 font-medium">
                      {patient.date_naissance || <span className="text-gray-400 italic">Non spécifiée</span>}
                    </span>
                  </div>

                  <div className="flex items-start">
                    <span className="text-gray-400 text-sm w-32 flex-shrink-0">📍 Adresse:</span>
                    <span className="text-gray-700">
                      {patient.adresse || <span className="text-gray-400 italic">Non spécifiée</span>}
                    </span>
                  </div>

                  <div className="flex items-start">
                    <span className="text-gray-400 text-sm w-32 flex-shrink-0">📞 Téléphone:</span>
                    <span className="text-gray-700 font-medium">
                      {patient.telephone || <span className="text-gray-400 italic">Non spécifié</span>}
                    </span>
                  </div>

                  <div className="flex items-start">
                    <span className="text-gray-400 text-sm w-32 flex-shrink-0">🩸 Groupe:</span>
                    <span className={`font-bold ${patient.groupe_sanguin ? 'text-red-600' : 'text-gray-400 italic'}`}>
                      {patient.groupe_sanguin || 'Non spécifié'}
                    </span>
                  </div>
                </div>

                {/* Footer Card */}
                <div className="px-5 pb-5">
                  <button
                    onClick={() => setEditingPatient(patient)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modifier
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal de modification */}
      {editingPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h4 className="text-2xl font-bold">Modifier le patient</h4>
                <button
                  onClick={() => setEditingPatient(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-blue-100 mt-2">{editingPatient.user?.name}</p>
            </div>

            {/* Form Modal */}
            <form onSubmit={handleUpdatePatient} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📅 Date de naissance
                  </label>
                  <input
                    type="date"
                    name="date_naissance"
                    defaultValue={editingPatient.date_naissance}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📞 Téléphone
                  </label>
                  <input
                    type="text"
                    name="telephone"
                    defaultValue={editingPatient.telephone}
                    placeholder="Ex: 0612345678"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📍 Adresse
                  </label>
                  <input
                    type="text"
                    name="adresse"
                    defaultValue={editingPatient.adresse}
                    placeholder="Ex: 123 Rue de la Santé, Paris"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🩸 Groupe sanguin
                  </label>
                  <select
                    name="groupe_sanguin"
                    defaultValue={editingPatient.groupe_sanguin || ''}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Sélectionner</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              {/* Buttons Modal */}
              <div className="mt-8 flex gap-3">
                <button 
                  type="submit" 
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Sauvegarder
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPatient(null)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderAppointmentBooking = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
        <h3 className="text-2xl font-bold flex items-center">
          <span className="text-3xl mr-3">📅</span>
          {user?.role === 'Admin' ? 'Créer un Rendez-vous' : 'Prendre un Rendez-vous'}
        </h3>
        <p className="text-blue-100 mt-2">
          {user?.role === 'Admin' 
            ? 'Planifier un rendez-vous pour un patient avec un médecin' 
            : 'Réservez une consultation avec un médecin'}
        </p>
      </div>

      {/* Form */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <form onSubmit={handleBookAppointment} className="space-y-6">
            {/* Sélection Patient (Admin uniquement) */}
            {user?.role === 'Admin' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  👤 Patient
                </label>
                <select
                  value={bookingForm.patient_id || ''}
                  onChange={(e) => setBookingForm({...bookingForm, patient_id: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Sélectionnez un patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.user?.name} - {patient.user?.email}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Choisissez le patient pour qui vous créez le rendez-vous
                </p>
              </div>
            )}

            {/* Sélection Médecin */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                👨‍⚕️ Médecin
              </label>
              <select
                value={bookingForm.medecin_id}
                onChange={(e) => setBookingForm({...bookingForm, medecin_id: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Sélectionnez un médecin</option>
                {medecins.map((medecin) => (
                  <option key={medecin.id} value={medecin.id}>
                    Dr. {medecin.user?.name} - {medecin.service?.nom || 'Service non spécifié'}
                  </option>
                ))}
              </select>
            </div>

            {/* Date et Heure */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📅 Date et Heure
              </label>
              <input
                type="datetime-local"
                value={bookingForm.date_heure}
                onChange={(e) => setBookingForm({...bookingForm, date_heure: e.target.value})}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Sélectionnez une date et heure futures
              </p>
            </div>

            {/* Motif */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📝 Motif de consultation
              </label>
              <input
                type="text"
                value={bookingForm.motif}
                onChange={(e) => setBookingForm({...bookingForm, motif: e.target.value})}
                placeholder="Ex: Consultation générale, contrôle, douleur..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Notes (optionnel) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📋 Notes complémentaires (optionnel)
              </label>
              <textarea
                value={bookingForm.notes || ''}
                onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                placeholder="Informations supplémentaires..."
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Bouton Submit */}
            <button
              type="submit"
              disabled={bookingLoading}
              className={`w-full font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center ${
                bookingLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {bookingLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Création en cours...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {user?.role === 'Admin' ? 'Créer le Rendez-vous' : 'Confirmer le Rendez-vous'}
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );

  const renderAdminAppointments = () => (
    <div className="bg-white p-6 rounded-lg shadow mt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">📋 Tous les Rendez-vous</h3>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            Total: {rendezvous.length}
          </span>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
            En attente: {rendezvous.filter(r => r.statut === 'En attente').length}
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            Confirmés: {rendezvous.filter(r => r.statut === 'Confirmé').length}
          </span>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {rendezvous.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📅</span>
              <p className="text-gray-500 text-lg">Aucun rendez-vous dans le système.</p>
              <p className="text-sm text-gray-400 mt-2">Les rendez-vous apparaîtront ici une fois créés.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Médecin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Heure
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Motif
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rendezvous.map((rdv) => (
                    <tr key={rdv.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {(rdv.patient?.user?.name || rdv.patient?.nom || 'P').charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {rdv.patient?.user?.name || rdv.patient?.nom || 'Patient'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {rdv.patient?.user?.email || 'Email non disponible'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Dr. {rdv.medecin?.user?.name || rdv.medecin?.nom || 'Médecin'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {rdv.medecin?.specialite || 'Spécialité non spécifiée'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(rdv.date_heure).toLocaleString('fr-FR')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {rdv.motif || 'Motif non spécifié'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          rdv.statut === 'Confirmé' ? 'bg-green-100 text-green-800' :
                          rdv.statut === 'Annulé' ? 'bg-red-100 text-red-800' :
                          rdv.statut === 'Terminé' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {rdv.statut || 'En attente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {rdv.statut === 'En attente' && (
                            <>
                              <button
                                onClick={() => handleUpdateAppointmentStatus(rdv.id, 'Confirmé')}
                                className="text-green-600 hover:text-green-900 px-2 py-1 rounded border border-green-300 hover:bg-green-50"
                              >
                                Confirmer
                              </button>
                              <button
                                onClick={() => handleUpdateAppointmentStatus(rdv.id, 'Annulé')}
                                className="text-red-600 hover:text-red-900 px-2 py-1 rounded border border-red-300 hover:bg-red-50"
                              >
                                Annuler
                              </button>
                            </>
                          )}
                          {rdv.statut === 'Confirmé' && (
                            <button
                              onClick={() => handleUpdateAppointmentStatus(rdv.id, 'Terminé')}
                              className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded border border-blue-300 hover:bg-blue-50"
                            >
                              Marquer terminé
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderPatientAppointments = () => (
    <div className="bg-white p-6 rounded-lg shadow mt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Mes Rendez-vous</h3>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="space-y-4">
          {rendezvous.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun rendez-vous programmé.</p>
              <p className="text-sm text-gray-400 mt-2">Prenez un rendez-vous pour voir vos consultations à venir.</p>
            </div>
          ) : (
            rendezvous.map((rdv) => (
              <div key={rdv.id} className="border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-green-600 font-medium">Dr. {rdv.medecin.user.name}</span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        rdv.statut === 'Confirmé' ? 'bg-green-100 text-green-800' :
                        rdv.statut === 'Annulé' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {rdv.statut || 'En attente'}
                      </span>
                    </div>
                    <div className="bg-green-50 p-3 rounded-md border-l-4 border-green-400">
                      <p className="text-sm text-gray-600">
                        📅 {new Date(rdv.date_heure).toLocaleString('fr-FR')}
                      </p>
                      {rdv.motif && (
                        <p className="text-sm text-gray-600 mt-1">
                          💬 {rdv.motif}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  const renderPatientPrescriptions = () => (
    <div className="bg-white p-6 rounded-xl shadow-lg mt-8">
      <div className="flex items-center mb-6">
        <div className="bg-purple-100 p-3 rounded-full mr-4">
          <span className="text-2xl">💊</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Mes Ordonnances</h3>
      </div>
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {prescriptions.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-purple-100 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl">💊</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Aucune ordonnance</h4>
              <p className="text-gray-600">Vos prescriptions médicales apparaîtront ici après vos consultations.</p>
            </div>
          ) : (
            prescriptions.map((prescription) => (
              <div key={prescription.id} className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200 hover:shadow-lg transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="bg-purple-500 p-2 rounded-lg mr-3">
                      <span className="text-white text-lg">👨⚕️</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        Dr. {prescription.medecin?.user?.name || 'Médecin'}
                      </h4>
                      <p className="text-purple-600 text-sm">
                        📅 {new Date(prescription.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full">
                    Ordonnance
                  </span>
                </div>
                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <h5 className="font-medium text-gray-900 mb-2">📝 Prescription :</h5>
                  <p className="text-gray-700 whitespace-pre-wrap">{prescription.contenu}</p>
                </div>
                {prescription.fichier_pdf && (
                  <div className="mt-4">
                    <a
                      href={`/storage/${prescription.fichier_pdf}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      📎 Télécharger PDF
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  const renderPatientBills = () => (
    <div className="bg-white p-6 rounded-lg shadow mt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Mes Factures</h3>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="space-y-4">
          {factures.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucune facture pour le moment.</p>
              <p className="text-sm text-gray-400 mt-2">Vos factures apparaîtront ici après vos consultations.</p>
            </div>
          ) : (
            factures.map((facture) => (
              <div key={facture.id} className="border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-600 font-medium">Facture #{facture.id}</span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-sm text-gray-500">
                        {new Date(facture.date).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        facture.statut === 'Payée' ? 'bg-green-100 text-green-800' :
                        facture.statut === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {facture.statut}
                      </span>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-md border-l-4 border-yellow-400">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">{facture.description || 'Consultation médicale'}</p>
                          <p className="text-xs text-gray-500 mt-1">Montant: €{facture.montant}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">€{facture.montant}</p>
                          {facture.fichier_pdf && (
                            <a
                              href={`/storage/${facture.fichier_pdf}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              📄 Voir PDF
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  const renderPrescriptionCreation = () => (
    <div className="bg-white p-6 rounded-lg shadow mt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Créer une Prescription</h3>
      {user.role !== 'Médecin' ? (
        <p className="text-red-600">Seuls les médecins peuvent créer des prescriptions.</p>
      ) : (
        <form onSubmit={handleCreatePrescription} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient
            </label>
            <select
              value={prescriptionForm.patient_id}
              onChange={(e) => setPrescriptionForm({...prescriptionForm, patient_id: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            >
              <option value="">Sélectionnez un patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.user.name} - {patient.user.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={prescriptionForm.date}
              onChange={(e) => setPrescriptionForm({...prescriptionForm, date: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenu de la prescription
            </label>
            <textarea
              value={prescriptionForm.contenu}
              onChange={(e) => setPrescriptionForm({...prescriptionForm, contenu: e.target.value})}
              placeholder="Décrivez le traitement, les médicaments, etc."
              rows="6"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fichier PDF (optionnel)
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setPrescriptionForm({...prescriptionForm, fichier_pdf: e.target.files[0]})}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={prescriptionLoading}
            className={`font-bold py-2 px-4 rounded ${
              prescriptionLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-700'
            } text-white`}
          >
            {prescriptionLoading ? 'Création en cours...' : 'Créer la Prescription'}
          </button>
        </form>
      )}
    </div>
  );

  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      date_naissance: formData.get('date_naissance'),
      adresse: formData.get('adresse'),
      telephone: formData.get('telephone'),
      groupe_sanguin: formData.get('groupe_sanguin'),
    };

    try {
      await patientsAPI.update(editingPatient.id, data);
      setEditingPatient(null);
      fetchPatients(); // Refresh the list
    } catch (error) {
      console.error('Error updating patient:', error);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (bookingLoading) return;

    setBookingLoading(true);
    try {
      await rendezvousAPI.create(bookingForm);
      setBookingForm({
        medecin_id: '',
        date_heure: '',
        motif: '',
        notes: ''
      });
      alert('Rendez-vous pris avec succès!');
      // Optionally refresh the appointments list
      if (activeSection === 'mes-rendezvous-patient') {
        fetchRendezvous();
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Erreur lors de la prise de rendez-vous: ' + (error.response?.data?.message || error.message));
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    if (prescriptionLoading) return;

    setPrescriptionLoading(true);
    try {
      const formData = new FormData();
      formData.append('patient_id', prescriptionForm.patient_id);
      formData.append('contenu', prescriptionForm.contenu);
      formData.append('date', prescriptionForm.date);
      if (prescriptionForm.fichier_pdf) {
        formData.append('fichier_pdf', prescriptionForm.fichier_pdf);
      }

      await prescriptionsAPI.create(formData);
      setPrescriptionForm({
        patient_id: '',
        contenu: '',
        date: '',
        fichier_pdf: null
      });
      alert('Prescription créée avec succès!');
      fetchPrescriptions();
    } catch (error) {
      console.error('Error creating prescription:', error);
      alert('Erreur lors de la création de la prescription: ' + (error.response?.data?.message || error.message));
    } finally {
      setPrescriptionLoading(false);
    }
  };

  return (
    <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
      {renderActiveSection()}
    </Layout>
  );
};

export default Dashboard;
