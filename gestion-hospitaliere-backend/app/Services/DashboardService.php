<?php

namespace App\Services;

use App\Repositories\Contracts\PatientRepositoryInterface;
use App\Repositories\Contracts\MedecinRepositoryInterface;
use App\Repositories\Contracts\RendezvousRepositoryInterface;
use App\Repositories\Contracts\ChambreRepositoryInterface;
use App\Repositories\Contracts\LitRepositoryInterface;
use Carbon\Carbon;

class DashboardService
{
    protected PatientRepositoryInterface $patientRepository;
    protected MedecinRepositoryInterface $medecinRepository;
    protected RendezvousRepositoryInterface $rendezvousRepository;
    protected ChambreRepositoryInterface $chambreRepository;
    protected LitRepositoryInterface $litRepository;

    public function __construct(
        PatientRepositoryInterface $patientRepository,
        MedecinRepositoryInterface $medecinRepository,
        RendezvousRepositoryInterface $rendezvousRepository,
        ChambreRepositoryInterface $chambreRepository,
        LitRepositoryInterface $litRepository
    ) {
        $this->patientRepository = $patientRepository;
        $this->medecinRepository = $medecinRepository;
        $this->rendezvousRepository = $rendezvousRepository;
        $this->chambreRepository = $chambreRepository;
        $this->litRepository = $litRepository;
    }

    /**
     * Obtenir toutes les statistiques du dashboard
     */
    public function getDashboardData(): array
    {
        return [
            'statistiques_generales' => $this->getStatistiquesGenerales(),
            'rendezvous_aujourdhui' => $this->getRendezvousAujourdhui(),
            'occupation_lits' => $this->getOccupationLits(),
            'rendezvous_par_statut' => $this->getRendezvousParStatut(),
            'patients_par_service' => $this->getPatientsParService(),
            'activite_recente' => $this->getActiviteRecente(),
        ];
    }

    /**
     * Statistiques générales
     */
    public function getStatistiquesGenerales(): array
    {
        $litStats = $this->litRepository->countLitsByStatus();
        
        return [
            'total_patients' => $this->patientRepository->count(),
            'total_medecins' => $this->medecinRepository->count(),
            'total_chambres' => $this->chambreRepository->count(),
            'total_lits' => $litStats['total'],
            'lits_disponibles' => $litStats['disponible'],
            'lits_occupes' => $litStats['occupe'],
            'rendezvous_aujourdhui' => $this->rendezvousRepository->getTodayRendezvous()->count(),
            'rendezvous_semaine' => $this->rendezvousRepository
                ->where('date_heure', '>=', Carbon::now()->startOfWeek())
                ->where('date_heure', '<=', Carbon::now()->endOfWeek())
                ->count(),
        ];
    }

    /**
     * Rendez-vous d'aujourd'hui
     */
    public function getRendezvousAujourdhui(): array
    {
        $rendezvous = $this->rendezvousRepository->getTodayRendezvous();
        
        return [
            'total' => $rendezvous->count(),
            'confirmes' => $rendezvous->where('statut', 'confirmé')->count(),
            'en_attente' => $rendezvous->where('statut', 'en_attente')->count(),
            'annules' => $rendezvous->where('statut', 'annulé')->count(),
            'liste' => $rendezvous->take(10) // Limiter à 10 pour l'affichage
        ];
    }

    /**
     * Occupation des lits
     */
    public function getOccupationLits(): array
    {
        return $this->litRepository->countLitsByStatus();
    }

    /**
     * Rendez-vous par statut
     */
    public function getRendezvousParStatut(): array
    {
        return [
            'confirme' => $this->rendezvousRepository->getRendezvousByStatus('confirmé')->count(),
            'en_attente' => $this->rendezvousRepository->getRendezvousByStatus('en_attente')->count(),
            'annule' => $this->rendezvousRepository->getRendezvousByStatus('annulé')->count(),
            'termine' => $this->rendezvousRepository->getRendezvousByStatus('terminé')->count(),
        ];
    }

    /**
     * Patients par service (nécessiterait une méthode dans PatientRepository)
     */
    public function getPatientsParService(): array
    {
        // Cette méthode nécessiterait une implémentation spécifique
        // Pour l'instant, retourner un tableau vide
        return [];
    }

    /**
     * Activité récente
     */
    public function getActiviteRecente(): array
    {
        $recentRendezvous = $this->rendezvousRepository
            ->orderBy('created_at', 'desc')
            ->with(['patient.user', 'medecin.user'])
            ->get()
            ->take(5);

        return [
            'derniers_rendezvous' => $recentRendezvous,
            'nouveaux_patients' => $this->patientRepository
                ->orderBy('created_at', 'desc')
                ->with(['user'])
                ->get()
                ->take(5)
        ];
    }
}
