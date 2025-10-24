import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { rendezvousAPI, medecinsAPI, servicesAPI, prescriptionsAPI } from '../services/api';
import PatientSidebar from '../components/PatientSidebar';

/**
 * Dashboard amélioré spécifiquement pour les patients
 */
const PatientDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [rendezvous, setRendezvous] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [services, setServices] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedMedecin, setSelectedMedecin] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    medecin_id: '',
    date_heure: '',
    motif: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Toujours charger les rendez-vous
      const rdvRes = await rendezvousAPI.getAll();
      setRendezvous(rdvRes.data.data || rdvRes.data || []);

      // Charger médecins et services pour la prise de RDV
      if (activeTab === 'overview' || activeTab === 'prendre-rdv') {
        const medecinRes = await medecinsAPI.getAll();
        setMedecins(medecinRes.data.data || medecinRes.data || []);
        
        const servicesRes = await servicesAPI.getAll();
        setServices(servicesRes.data || []);
      }

      // Charger les prescriptions
      if (activeTab === 'overview' || activeTab === 'mes-prescriptions') {
        const presRes = await prescriptionsAPI.getAll();
        console.log('Prescriptions API Response:', presRes);
        console.log('Prescriptions data:', presRes.data);
        const prescriptionsData = presRes.data.data || presRes.data || [];
        console.log('Prescriptions extracted:', prescriptionsData);
        setPrescriptions(prescriptionsData);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    
    // Validation côté client
    if (!bookingForm.medecin_id) {
      alert('Veuillez sélectionner un médecin');
      return;
    }
    if (!bookingForm.date_heure) {
      alert('Veuillez sélectionner une date et heure');
      return;
    }
    if (!bookingForm.motif.trim()) {
      alert('Veuillez indiquer le motif de consultation');
      return;
    }

    try {
      console.log('Données envoyées:', bookingForm);
      await rendezvousAPI.create(bookingForm);
      alert('Rendez-vous créé avec succès! Vous recevrez une confirmation par email.');
      setShowBookingModal(false);
      setBookingForm({
        medecin_id: '',
        date_heure: '',
        motif: '',
        notes: ''
      });
      fetchData();
    } catch (error) {
      console.error('Erreur complète:', error);
      console.error('Réponse du serveur:', error.response);
      
      let errorMessage = 'Erreur lors de la création du rendez-vous';
      
      if (error.response) {
        // Erreur de réponse du serveur
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 400) {
          errorMessage = `Données invalides: ${data.message || 'Vérifiez les informations saisies'}`;
        } else if (status === 401) {
          errorMessage = 'Vous devez être connecté pour prendre un rendez-vous';
        } else if (status === 403) {
          errorMessage = 'Vous n\'avez pas l\'autorisation de prendre un rendez-vous';
        } else if (status === 404) {
          errorMessage = 'Service non trouvé. Veuillez réessayer.';
        } else if (status === 500) {
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
        } else {
          errorMessage = `Erreur ${status}: ${data.message || 'Erreur inconnue'}`;
        }
      } else if (error.request) {
        // Erreur de réseau
        errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
      } else {
        // Autre erreur
        errorMessage = `Erreur: ${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  const handleCancelAppointment = async (rdvId) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous?')) {
      try {
        await rendezvousAPI.update(rdvId, { statut: 'annule' });
        alert('Rendez-vous annulé');
        fetchData();
      } catch (error) {
        alert('Erreur lors de l\'annulation');
        console.error(error);
      }
    }
  };

  // Filtrer les rendez-vous
  const rdvAVenir = rendezvous.filter(r => {
    const rdvDate = new Date(r.date_heure);
    return rdvDate > new Date() && r.statut !== 'annule';
  }).sort((a, b) => new Date(a.date_heure) - new Date(b.date_heure));

  const rdvPasses = rendezvous.filter(r => {
    const rdvDate = new Date(r.date_heure);
    return rdvDate <= new Date() || r.statut === 'termine';
  }).sort((a, b) => new Date(b.date_heure) - new Date(a.date_heure));

  const rdvAujourdhui = rendezvous.filter(r => {
    const today = new Date().toISOString().split('T')[0];
    return r.date_heure?.startsWith(today) && r.statut !== 'annule';
  });

  // Statistiques
  const stats = {
    prochainRdv: rdvAVenir.length > 0 ? rdvAVenir[0] : null,
    totalRdv: rendezvous.length,
    rdvAVenir: rdvAVenir.length,
    rdvPasses: rdvPasses.length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Sidebar */}
      <PatientSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        prochainRdv={stats.prochainRdv}
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {/* Vue d'ensemble */}
              {activeTab === 'overview' && (
                <div>
                  {/* Cards Statistiques */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                      title="Total Rendez-vous"
                      value={stats.totalRdv}
                      icon="📊"
                      color="bg-blue-500"
                    />
                    <StatCard
                      title="À Venir"
                      value={stats.rdvAVenir}
                      icon="📅"
                      color="bg-green-500"
                    />
                    <StatCard
                      title="Passés"
                      value={stats.rdvPasses}
                      icon="✅"
                      color="bg-purple-500"
                    />
                  </div>

                  {/* Prochain Rendez-vous */}
                  {stats.prochainRdv ? (
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg shadow-lg p-6 mb-6 text-white">
                      <h2 className="text-2xl font-bold mb-4">🎯 Prochain Rendez-vous</h2>
                      <div className="bg-white bg-opacity-20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xl font-semibold">
                              Dr. {stats.prochainRdv.medecin?.user?.name || stats.prochainRdv.medecin?.nom}
                            </p>
                            <p className="text-indigo-100">
                              {stats.prochainRdv.medecin?.specialite}
                            </p>
                            <p className="text-lg mt-2">
                              📅 {new Date(stats.prochainRdv.date_heure).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-lg">
                              🕐 {new Date(stats.prochainRdv.date_heure).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            <p className="text-indigo-100 mt-2">
                              Motif: {stats.prochainRdv.motif}
                            </p>
                          </div>
                          <div className="text-6xl">📋</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow p-6 mb-6 text-center">
                      <div className="text-6xl mb-4">📅</div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        Aucun rendez-vous à venir
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Prenez rendez-vous avec un médecin
                      </p>
                      <button
                        onClick={() => setActiveTab('prendre-rdv')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                      >
                        Prendre un rendez-vous
                      </button>
                    </div>
                  )}

                  {/* Rendez-vous aujourd'hui */}
                  {rdvAujourdhui.length > 0 && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-6">
                      <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                        ⚠️ Rendez-vous Aujourd'hui
                      </h3>
                      <div className="space-y-3">
                        {rdvAujourdhui.map((rdv) => (
                          <div key={rdv.id} className="bg-white p-4 rounded-lg shadow-sm">
                            <p className="font-semibold">
                              {new Date(rdv.date_heure).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })} - Dr. {rdv.medecin?.user?.name || rdv.medecin?.nom}
                            </p>
                            <p className="text-sm text-gray-600">{rdv.motif}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions Rapides */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <ActionCard
                      title="Prendre un Rendez-vous"
                      description="Consultez nos médecins disponibles"
                      icon="📅"
                      color="bg-indigo-500"
                      onClick={() => setActiveTab('prendre-rdv')}
                    />
                    <ActionCard
                      title="Voir mes Rendez-vous"
                      description="Historique et rendez-vous à venir"
                      icon="📋"
                      color="bg-purple-500"
                      onClick={() => setActiveTab('mes-rdv')}
                    />
                  </div>

                  {/* Prochains RDV */}
                  {rdvAVenir.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6">
                      <h2 className="text-xl font-bold mb-4">Prochains Rendez-vous</h2>
                      <div className="space-y-3">
                        {rdvAVenir.slice(0, 3).map((rdv) => (
                          <RendezvousCard
                            key={rdv.id}
                            rendezvous={rdv}
                            onCancel={handleCancelAppointment}
                            compact
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mes Rendez-vous */}
              {activeTab === 'mes-rdv' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Mes Rendez-vous</h2>
                  
                  {/* À venir */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm mr-3">
                        {rdvAVenir.length}
                      </span>
                      À Venir
                    </h3>
                    {rdvAVenir.length === 0 ? (
                      <div className="bg-white rounded-lg shadow p-8 text-center">
                        <div className="text-4xl mb-3">📅</div>
                        <p className="text-gray-500">Aucun rendez-vous à venir</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {rdvAVenir.map((rdv) => (
                          <RendezvousCard
                            key={rdv.id}
                            rendezvous={rdv}
                            onCancel={handleCancelAppointment}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Passés */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm mr-3">
                        {rdvPasses.length}
                      </span>
                      Historique
                    </h3>
                    {rdvPasses.length === 0 ? (
                      <div className="bg-white rounded-lg shadow p-8 text-center">
                        <div className="text-4xl mb-3">📋</div>
                        <p className="text-gray-500">Aucun historique</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {rdvPasses.slice(0, 5).map((rdv) => (
                          <RendezvousCard
                            key={rdv.id}
                            rendezvous={rdv}
                            past
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Prendre RDV */}
              {activeTab === 'prendre-rdv' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Prendre un Rendez-vous</h2>
                  
                  {/* Formulaire */}
                  <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <form onSubmit={handleBookAppointment} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Choisir un médecin *
                        </label>
                        <select
                          value={bookingForm.medecin_id}
                          onChange={(e) => {
                            setBookingForm({...bookingForm, medecin_id: e.target.value});
                            const medecin = medecins.find(m => m.id === parseInt(e.target.value));
                            setSelectedMedecin(medecin);
                          }}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        >
                          <option value="">Sélectionnez un médecin</option>
                          {medecins.map((medecin) => (
                            <option key={medecin.id} value={medecin.id}>
                              Dr. {medecin.user?.name || medecin.nom} - {medecin.specialite}
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedMedecin && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                          <h4 className="font-semibold text-indigo-900 mb-2">
                            Dr. {selectedMedecin.user?.name || selectedMedecin.nom}
                          </h4>
                          <p className="text-sm text-indigo-700">
                            Spécialité: {selectedMedecin.specialite}
                          </p>
                          <p className="text-sm text-indigo-700">
                            Service: {selectedMedecin.service?.nom}
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date et heure *
                        </label>
                        <input
                          type="datetime-local"
                          value={bookingForm.date_heure}
                          onChange={(e) => setBookingForm({...bookingForm, date_heure: e.target.value})}
                          min={new Date().toISOString().slice(0, 16)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Motif de consultation *
                        </label>
                        <textarea
                          value={bookingForm.motif}
                          onChange={(e) => setBookingForm({...bookingForm, motif: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          rows="3"
                          placeholder="Décrivez brièvement le motif de votre consultation..."
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notes complémentaires
                        </label>
                        <textarea
                          value={bookingForm.notes}
                          onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          rows="2"
                          placeholder="Informations complémentaires (optionnel)..."
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                      >
                        Confirmer le Rendez-vous
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Mes Prescriptions */}
              {activeTab === 'mes-prescriptions' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Mes Prescriptions</h2>
                  
                  {prescriptions.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                      <div className="text-6xl mb-4">💊</div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        Aucune prescription
                      </h3>
                      <p className="text-gray-500">
                        Vos prescriptions médicales apparaîtront ici
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {prescriptions.map((prescription) => (
                        <PrescriptionCard key={prescription.id} prescription={prescription} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Liste Médecins */}
              {activeTab === 'medecins' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Nos Médecins</h2>
                  
                  {/* Filtres par service */}
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {services.map((service) => (
                        <span
                          key={service.id}
                          className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium"
                        >
                          {service.nom}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {medecins.map((medecin) => (
                      <MedecinCard
                        key={medecin.id}
                        medecin={medecin}
                        onBookAppointment={() => {
                          setBookingForm({...bookingForm, medecin_id: medecin.id});
                          setSelectedMedecin(medecin);
                          setActiveTab('prendre-rdv');
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant StatCard
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className="text-4xl font-bold text-gray-900 mt-2">{value}</p>
      </div>
      <div className={`${color} w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg`}>
        {icon}
      </div>
    </div>
  </div>
);

// Composant ActionCard
const ActionCard = ({ title, description, icon, color, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
  >
    <div className="flex items-start">
      <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl text-white mr-4`}>
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-lg text-gray-900">{title}</h3>
        <p className="text-gray-600 text-sm mt-1">{description}</p>
      </div>
    </div>
  </div>
);

// Composant RendezvousCard
const RendezvousCard = ({ rendezvous, onCancel, past = false, compact = false }) => {
  const statusColors = {
    planifie: 'bg-blue-100 text-blue-800',
    confirme: 'bg-green-100 text-green-800',
    annule: 'bg-red-100 text-red-800',
    termine: 'bg-gray-100 text-gray-800'
  };

  const rdvDate = new Date(rendezvous.date_heure);
  const isToday = rdvDate.toDateString() === new Date().toDateString();

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${isToday ? 'border-l-4 border-yellow-400' : ''} hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-lg text-gray-900">
              Dr. {rendezvous.medecin?.user?.name || rendezvous.medecin?.nom}
            </h4>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[rendezvous.statut] || 'bg-gray-100'}`}>
              {rendezvous.statut}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">
            {rendezvous.medecin?.specialite}
          </p>
          <p className="text-sm text-gray-900 font-medium">
            📅 {rdvDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-sm text-gray-900 font-medium">
            🕐 {rdvDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
          {!compact && (
            <>
              <p className="text-sm text-gray-700 mt-2">
                <span className="font-medium">Motif:</span> {rendezvous.motif}
              </p>
              {rendezvous.notes && (
                <p className="text-sm text-gray-500 mt-1 italic">{rendezvous.notes}</p>
              )}
            </>
          )}
        </div>
        {!past && rendezvous.statut !== 'annule' && rendezvous.statut !== 'termine' && (
          <button
            onClick={() => onCancel(rendezvous.id)}
            className="ml-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
          >
            Annuler
          </button>
        )}
      </div>
    </div>
  );
};

// Composant MedecinCard
const MedecinCard = ({ medecin, onBookAppointment }) => (
  <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all">
    <div className="text-center mb-4">
      <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mx-auto flex items-center justify-center text-3xl text-white mb-3">
        👨‍⚕️
      </div>
      <h3 className="font-bold text-xl text-gray-900">
        Dr. {medecin.user?.name || medecin.nom}
      </h3>
      <p className="text-indigo-600 font-medium">{medecin.specialite}</p>
      <p className="text-sm text-gray-600 mt-1">{medecin.service?.nom}</p>
    </div>
    <button
      onClick={onBookAppointment}
      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
    >
      Prendre RDV
    </button>
  </div>
);

// Composant PrescriptionCard pour les patients
const PrescriptionCard = ({ prescription }) => (
  <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-lg text-gray-900">
              Dr. {prescription.medecin?.user?.name || 'Médecin'}
            </h3>
            <p className="text-sm text-indigo-600">
              {prescription.medecin?.specialite || 'Spécialité'}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
              {new Date(prescription.date).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mb-3 border border-indigo-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <span className="text-lg mr-2">💊</span>
            Prescription
          </h4>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {prescription.contenu}
          </p>
        </div>

        {prescription.fichier_pdf && (
          <div className="mt-3">
            <a 
              href={`/storage/${prescription.fichier_pdf}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Télécharger le PDF
            </a>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-3">
          Créée le {new Date(prescription.created_at).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
    </div>
  </div>
);

export default PatientDashboard;
