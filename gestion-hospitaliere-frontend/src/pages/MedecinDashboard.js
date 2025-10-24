import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { patientsAPI, rendezvousAPI, prescriptionsAPI } from '../services/api';
import MedecinSidebar from '../components/MedecinSidebar';

/**
 * Dashboard amélioré spécifiquement pour les médecins
 */
const MedecinDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [patients, setPatients] = useState([]);
  const [rendezvous, setRendezvous] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [prescriptionForm, setPrescriptionForm] = useState({
    patient_id: '',
    contenu: '',
    date: new Date().toISOString().split('T')[0],
    fichier_pdf: null
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview' || activeTab === 'patients') {
        const patientsRes = await patientsAPI.getAll();
        setPatients(patientsRes.data.data || patientsRes.data || []);
      }
      if (activeTab === 'overview' || activeTab === 'rendezvous') {
        const rdvRes = await rendezvousAPI.getAll();
        setRendezvous(rdvRes.data.data || rdvRes.data || []);
      }
      if (activeTab === 'prescriptions') {
        const presRes = await prescriptionsAPI.getAll();
        setPrescriptions(presRes.data.data || presRes.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    try {
      // Créer un FormData pour gérer l'upload de fichier
      const formData = new FormData();
      formData.append('patient_id', prescriptionForm.patient_id);
      formData.append('contenu', prescriptionForm.contenu);
      formData.append('date', prescriptionForm.date);
      
      if (prescriptionForm.fichier_pdf) {
        formData.append('fichier_pdf', prescriptionForm.fichier_pdf);
      }

      // Utiliser fetch directement pour l'upload de fichier
      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json'
          // Ne pas définir Content-Type pour FormData
        },
        body: formData
      });

      if (response.ok) {
        alert('Prescription créée avec succès!');
        setPrescriptionForm({
          patient_id: '',
          contenu: '',
          date: new Date().toISOString().split('T')[0],
          fichier_pdf: null
        });
        // Réinitialiser aussi le champ fichier dans le DOM
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        fetchData();
      } else {
        const errorData = await response.json();
        alert(`Erreur: ${errorData.message || 'Erreur lors de la création'}`);
      }
    } catch (error) {
      alert('Erreur lors de la création de la prescription');
      console.error(error);
    }
  };

  const handleUpdateRendezvousStatus = async (rdvId, newStatus, notesMedecin = '') => {
    try {
      // Utiliser la nouvelle API pour la mise à jour du statut
      const response = await fetch(`/api/rendezvous/${rdvId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          statut: newStatus,
          notes_medecin: notesMedecin
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Statut mis à jour avec succès!');
        fetchData();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      alert('Erreur lors de la mise à jour');
      console.error(error);
    }
  };

  // Filtrer les rendez-vous à venir
  const rdvAVenir = rendezvous.filter(r => {
    const rdvDate = new Date(r.date_heure);
    return rdvDate > new Date() && r.statut !== 'Annulé';
  }).sort((a, b) => new Date(a.date_heure) - new Date(b.date_heure));

  // Statistiques rapides
  const stats = {
    totalPatients: patients.length,
    rdvAujourdhui: rendezvous.filter(r => {
      const today = new Date().toISOString().split('T')[0];
      return r.date_heure?.startsWith(today);
    }).length,
    rdvEnAttente: rendezvous.filter(r => r.statut === 'En attente').length,
    prescriptionsRecentes: prescriptions.slice(0, 5).length,
    prochainRdv: rdvAVenir.length > 0 ? rdvAVenir[0] : null
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <MedecinSidebar activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                      title="Mes Patients"
                      value={stats.totalPatients}
                      icon="👥"
                      color="bg-blue-500"
                    />
                    <StatCard
                      title="RDV Aujourd'hui"
                      value={stats.rdvAujourdhui}
                      icon="📅"
                      color="bg-green-500"
                    />
                    <StatCard
                      title="RDV En Attente"
                      value={stats.rdvEnAttente}
                      icon="⏰"
                      color="bg-yellow-500"
                    />
                    <StatCard
                      title="Prescriptions"
                      value={prescriptions.length}
                      icon="💊"
                      color="bg-purple-500"
                    />
                  </div>

                  {/* Rendez-vous du jour */}
                  <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Rendez-vous d'Aujourd'hui</h2>
                    {stats.rdvAujourdhui === 0 ? (
                      <p className="text-gray-500">Aucun rendez-vous aujourd'hui</p>
                    ) : (
                      <div className="space-y-3">
                        {rendezvous
                          .filter(r => {
                            const today = new Date().toISOString().split('T')[0];
                            return r.date_heure?.startsWith(today);
                          })
                          .map((rdv) => (
                            <RendezvousCard
                              key={rdv.id}
                              rendezvous={rdv}
                              onUpdateStatus={handleUpdateRendezvousStatus}
                            />
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Patients récents */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Patients Récents</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {patients.slice(0, 6).map((patient) => (
                        <PatientCard
                          key={patient.id}
                          patient={patient}
                          onClick={() => setSelectedPatient(patient)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'patients' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold mb-6">Mes Patients</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {patients.map((patient) => (
                      <PatientCard
                        key={patient.id}
                        patient={patient}
                        onClick={() => setSelectedPatient(patient)}
                        detailed
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'rendezvous' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold mb-6">Mes Rendez-vous</h2>
                  <div className="space-y-4">
                    {rendezvous.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Aucun rendez-vous</p>
                    ) : (
                      rendezvous.map((rdv) => (
                        <RendezvousCard
                          key={rdv.id}
                          rendezvous={rdv}
                          onUpdateStatus={handleUpdateRendezvousStatus}
                          detailed
                        />
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'prescriptions' && (
                <div>
                  {/* Formulaire création prescription */}
                  <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-2xl font-bold mb-4">Nouvelle Prescription</h2>
                    <form onSubmit={handleCreatePrescription} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Patient
                        </label>
                        <select
                          value={prescriptionForm.patient_id}
                          onChange={(e) => setPrescriptionForm({...prescriptionForm, patient_id: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          required
                        >
                          <option value="">Sélectionner un patient</option>
                          {patients.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.user?.name || 'Patient'} - {p.telephone}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contenu de la prescription *
                        </label>
                        <textarea
                          value={prescriptionForm.contenu}
                          onChange={(e) => setPrescriptionForm({...prescriptionForm, contenu: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          rows="5"
                          placeholder="Détails de la prescription (médicaments, posologie, durée, notes)..."
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date de prescription *
                        </label>
                        <input
                          type="date"
                          value={prescriptionForm.date}
                          onChange={(e) => setPrescriptionForm({...prescriptionForm, date: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">Format PDF uniquement, taille max: 5MB</p>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                      >
                        Créer la Prescription
                      </button>
                    </form>
                  </div>

                  {/* Liste prescriptions */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold mb-4">Prescriptions Récentes</h2>
                    <div className="space-y-4">
                      {prescriptions.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Aucune prescription</p>
                      ) : (
                        prescriptions.map((pres) => (
                          <PrescriptionCard key={pres.id} prescription={pres} />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal détails patient */}
        {selectedPatient && (
          <PatientModal
            patient={selectedPatient}
            onClose={() => setSelectedPatient(null)}
          />
        )}
      </div>
    </div>
  );
};

// Composant StatCard
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      </div>
      <div className={`${color} w-14 h-14 rounded-full flex items-center justify-center text-2xl`}>
        {icon}
      </div>
    </div>
  </div>
);

// Composant PatientCard
const PatientCard = ({ patient, onClick, detailed = false }) => (
  <div
    onClick={onClick}
    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer bg-white"
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h3 className="font-semibold text-lg text-gray-900">
          {patient.user?.name || 'Patient'}
        </h3>
        <p className="text-sm text-gray-600">{patient.user?.email}</p>
        {detailed && (
          <>
            <p className="text-sm text-gray-600 mt-2">
              📞 {patient.telephone || 'Non renseigné'}
            </p>
            <p className="text-sm text-gray-600">
              🩸 {patient.groupe_sanguin || 'Non renseigné'}
            </p>
          </>
        )}
      </div>
      <span className="text-2xl">👤</span>
    </div>
  </div>
);

// Composant RendezvousCard
const RendezvousCard = ({ rendezvous, onUpdateStatus, detailed = false }) => {
  const statusColors = {
    'En attente': 'bg-blue-100 text-blue-800',
    'Confirmé': 'bg-green-100 text-green-800',
    'Annulé': 'bg-red-100 text-red-800',
    'Terminé': 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-gray-900">
              {rendezvous.patient?.user?.name || rendezvous.patient?.nom || 'Patient'}
            </h4>
            <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[rendezvous.statut] || 'bg-gray-100'}`}>
              {rendezvous.statut}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            📅 {new Date(rendezvous.date_heure).toLocaleString('fr-FR')}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            📝 {rendezvous.motif}
          </p>
          {detailed && rendezvous.notes && (
            <p className="text-sm text-gray-500 mt-2 italic">{rendezvous.notes}</p>
          )}
        </div>
        {rendezvous.statut === 'En attente' && (
          <div className="flex gap-2">
            <button
              onClick={() => onUpdateStatus(rendezvous.id, 'Confirmé')}
              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded"
            >
              Confirmer
            </button>
            <button
              onClick={() => onUpdateStatus(rendezvous.id, 'Annulé')}
              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded"
            >
              Annuler
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant PrescriptionCard
const PrescriptionCard = ({ prescription }) => (
  <div className="border border-gray-200 rounded-lg p-4 bg-white">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-900">
            {prescription.patient?.user?.name || prescription.patient?.nom || 'Patient'}
          </h4>
          <span className="text-xs text-gray-500">
            {new Date(prescription.date).toLocaleDateString('fr-FR')}
          </span>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg mt-2">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {prescription.contenu}
          </p>
        </div>
        {prescription.fichier_pdf && (
          <div className="mt-2">
            <a 
              href={`/storage/${prescription.fichier_pdf}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              📄 Voir le PDF
            </a>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-2">
          Créé le {new Date(prescription.created_at).toLocaleDateString('fr-FR')}
        </p>
      </div>
    </div>
  </div>
);

// Modal détails patient
const PatientModal = ({ patient, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Dossier Patient</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{patient.user?.name}</h3>
            <p className="text-gray-600">{patient.user?.email}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Date de naissance</p>
              <p className="font-medium">{patient.date_naissance || 'Non renseignée'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Groupe sanguin</p>
              <p className="font-medium">{patient.groupe_sanguin || 'Non renseigné'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Téléphone</p>
              <p className="font-medium">{patient.telephone || 'Non renseigné'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Adresse</p>
              <p className="font-medium">{patient.adresse || 'Non renseignée'}</p>
            </div>
          </div>

          {patient.historique_medical && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Historique médical</p>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm">{patient.historique_medical}</p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
);

export default MedecinDashboard;
