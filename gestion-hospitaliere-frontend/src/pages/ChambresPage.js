import React, { useState } from 'react';
import useFetch, { useMutation } from '../hooks/useFetch';
import API_ENDPOINTS from '../api/endpoints';

/**
 * Page de gestion des chambres
 * CRUD complet avec filtres et recherche
 */
const ChambresPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedChambre, setSelectedChambre] = useState(null);
  const [filters, setFilters] = useState({ type: '', service_id: '' });

  const { data: chambresData, loading, error, refetch } = useFetch(API_ENDPOINTS.CHAMBRES.LIST);
  const { data: servicesData } = useFetch(API_ENDPOINTS.SERVICES.LIST);
  const { mutate: deleteChambre } = useMutation(API_ENDPOINTS.CHAMBRES.DELETE(''), 'DELETE');

  const chambres = chambresData?.data || [];
  const services = servicesData || [];

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette chambre ?')) {
      const result = await deleteChambre(null, { url: API_ENDPOINTS.CHAMBRES.DELETE(id) });
      if (result.success) {
        refetch();
      }
    }
  };

  const handleEdit = (chambre) => {
    setSelectedChambre(chambre);
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedChambre(null);
    setShowModal(true);
  };

  const filteredChambres = chambres.filter(chambre => {
    if (filters.type && chambre.type !== filters.type) return false;
    if (filters.service_id && chambre.service.id !== parseInt(filters.service_id)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Chambres</h1>
            <p className="text-gray-600 mt-2">Gérer les chambres et leur disponibilité</p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <span className="mr-2">+</span>
            Nouvelle Chambre
          </button>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Tous les types</option>
                <option value="standard">Standard</option>
                <option value="vip">VIP</option>
                <option value="soins_intensifs">Soins Intensifs</option>
                <option value="urgence">Urgence</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
              <select
                value={filters.service_id}
                onChange={(e) => setFilters({ ...filters, service_id: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Tous les services</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>{service.nom}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Liste des chambres */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChambres.map((chambre) => (
            <div key={chambre.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Chambre {chambre.numero}</h3>
                    <p className="text-sm text-gray-600">{chambre.service.nom}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    chambre.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {chambre.disponible ? 'Disponible' : 'Occupée'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">{chambre.type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Capacité:</span>
                    <span className="font-medium">{chambre.capacite} lits</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Lits disponibles:</span>
                    <span className="font-medium">{chambre.lits_disponibles_count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tarif/jour:</span>
                    <span className="font-medium">{chambre.tarif_journalier} €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Occupation:</span>
                    <span className="font-medium">{chambre.taux_occupation}%</span>
                  </div>
                </div>

                {chambre.equipements && chambre.equipements.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-2">Équipements:</p>
                    <div className="flex flex-wrap gap-1">
                      {chambre.equipements.map((eq, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(chambre)}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded text-sm font-medium"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(chambre.id)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded text-sm font-medium"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredChambres.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aucune chambre trouvée</p>
          </div>
        )}
      </div>

      {/* Modal (à implémenter) */}
      {showModal && (
        <ChambreModal
          chambre={selectedChambre}
          services={services}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
};

/**
 * Modal pour créer/modifier une chambre
 */
const ChambreModal = ({ chambre, services, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(chambre || {
    numero: '',
    service_id: '',
    type: 'standard',
    capacite: 1,
    tarif_journalier: 0,
    disponible: true,
    equipements: [],
    notes: '',
  });

  const { mutate, loading } = useMutation(
    chambre ? API_ENDPOINTS.CHAMBRES.UPDATE(chambre.id) : API_ENDPOINTS.CHAMBRES.CREATE,
    chambre ? 'PUT' : 'POST'
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await mutate(formData);
    if (result.success) {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">
          {chambre ? 'Modifier la chambre' : 'Nouvelle chambre'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numéro</label>
              <input
                type="text"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
              <select
                value={formData.service_id}
                onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="">Sélectionner</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>{service.nom}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="standard">Standard</option>
                <option value="vip">VIP</option>
                <option value="soins_intensifs">Soins Intensifs</option>
                <option value="urgence">Urgence</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacité</label>
              <input
                type="number"
                value={formData.capacite}
                onChange={(e) => setFormData({ ...formData, capacite: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                min="1"
                max="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tarif/jour (€)</label>
              <input
                type="number"
                value={formData.tarif_journalier}
                onChange={(e) => setFormData({ ...formData, tarif_journalier: parseFloat(e.target.value) })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
              rows="3"
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChambresPage;
