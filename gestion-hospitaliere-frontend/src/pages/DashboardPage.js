import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import useFetch from '../hooks/useFetch';
import API_ENDPOINTS from '../api/endpoints';

/**
 * Page Dashboard avec statistiques et graphiques
 * Affiche les KPIs, graphiques et activité récente
 */
const DashboardPage = () => {
  const { data: dashboardData, loading, error, refetch } = useFetch(API_ENDPOINTS.DASHBOARD.INDEX);
  const { data: graphiquesData } = useFetch(API_ENDPOINTS.DASHBOARD.GRAPHIQUES);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Erreur</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.statistiques_generales || {};
  const rendezvousAujourdhui = dashboardData?.rendezvous_aujourdhui || [];
  const activiteRecente = dashboardData?.activite_recente || [];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
          <p className="text-gray-600 mt-2">Vue d'ensemble de l'activité hospitalière</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Patients"
            value={stats.total_patients}
            icon="👥"
            color="bg-blue-500"
          />
          <StatCard
            title="Médecins"
            value={stats.total_medecins}
            icon="👨‍⚕️"
            color="bg-green-500"
          />
          <StatCard
            title="RDV Aujourd'hui"
            value={stats.rendezvous_aujourdhui}
            icon="📅"
            color="bg-orange-500"
          />
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 gap-6 mb-8">

          {/* Rendez-vous par jour */}
          {graphiquesData?.rendezvous_par_jour && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Rendez-vous (7 derniers jours)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={graphiquesData.rendezvous_par_jour}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Rendez-vous d'aujourd'hui et Activité récente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rendez-vous d'aujourd'hui */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Rendez-vous d'Aujourd'hui</h2>
            <div className="space-y-3">
              {rendezvousAujourdhui.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucun rendez-vous aujourd'hui</p>
              ) : (
                rendezvousAujourdhui.map((rdv) => (
                  <div key={rdv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-gray-900">{rdv.patient}</p>
                      <p className="text-sm text-gray-600">Dr. {rdv.medecin}</p>
                      <p className="text-xs text-gray-500">{rdv.motif}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">{rdv.heure}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        rdv.statut === 'confirme' ? 'bg-green-100 text-green-800' :
                        rdv.statut === 'planifie' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {rdv.statut}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activité récente */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Activité Récente</h2>
            <div className="space-y-3">
              {activiteRecente.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucune activité récente</p>
              ) : (
                activiteRecente.map((activite, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activite.description}</p>
                      <p className="text-xs text-gray-500">{activite.date}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Composant StatCard pour afficher les KPIs
 */
const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value || 0}</p>
        </div>
        <div className={`${color} w-12 h-12 rounded-full flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
