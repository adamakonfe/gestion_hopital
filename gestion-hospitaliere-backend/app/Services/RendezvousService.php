<?php

namespace App\Services;

use App\Models\Rendezvous;
use App\Repositories\Contracts\RendezvousRepositoryInterface;
use App\Repositories\Contracts\MedecinRepositoryInterface;
use App\Repositories\Contracts\PatientRepositoryInterface;
use App\Notifications\RendezvousCreated;
use App\Notifications\RendezvousAssigned;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class RendezvousService
{
    protected RendezvousRepositoryInterface $rendezvousRepository;
    protected MedecinRepositoryInterface $medecinRepository;
    protected PatientRepositoryInterface $patientRepository;

    public function __construct(
        RendezvousRepositoryInterface $rendezvousRepository,
        MedecinRepositoryInterface $medecinRepository,
        PatientRepositoryInterface $patientRepository
    ) {
        $this->rendezvousRepository = $rendezvousRepository;
        $this->medecinRepository = $medecinRepository;
        $this->patientRepository = $patientRepository;
    }

    /**
     * Créer un nouveau rendez-vous avec vérifications
     */
    public function createRendezvous(array $data): Rendezvous
    {
        return DB::transaction(function () use ($data) {
            // Vérifier la disponibilité du médecin
            $dateTime = Carbon::parse($data['date_heure']);
            $isAvailable = $this->rendezvousRepository->checkMedecinAvailability(
                $data['medecin_id'], 
                $dateTime
            );

            if (!$isAvailable) {
                throw new \Exception('Le médecin n\'est pas disponible à cette heure.');
            }

            // Créer le rendez-vous
            $rendezvous = $this->rendezvousRepository->create($data);

            // Charger les relations pour les notifications
            $rendezvous = $this->rendezvousRepository->find($rendezvous->id, [
                'patient.user', 
                'medecin.user'
            ]);

            // Envoyer les notifications
            $rendezvous->patient->user->notify(new RendezvousCreated($rendezvous));
            $rendezvous->medecin->user->notify(new RendezvousAssigned($rendezvous));

            return $rendezvous;
        });
    }

    /**
     * Obtenir les créneaux disponibles pour un médecin
     */
    public function getAvailableSlots(int $medecinId, string $date): array
    {
        $dateTime = Carbon::createFromFormat('Y-m-d', $date);
        return $this->rendezvousRepository->getAvailableSlots($medecinId, $dateTime);
    }

    /**
     * Obtenir les rendez-vous du jour pour le dashboard
     */
    public function getTodayRendezvousForDashboard(): array
    {
        $rendezvous = $this->rendezvousRepository->getTodayRendezvous();
        
        return [
            'total' => $rendezvous->count(),
            'confirmes' => $rendezvous->where('statut', 'confirmé')->count(),
            'en_attente' => $rendezvous->where('statut', 'en_attente')->count(),
            'annules' => $rendezvous->where('statut', 'annulé')->count(),
            'rendezvous' => $rendezvous
        ];
    }

    /**
     * Obtenir les statistiques des rendez-vous
     */
    public function getRendezvousStats(): array
    {
        $today = Carbon::today();
        $thisWeek = Carbon::now()->startOfWeek();
        $thisMonth = Carbon::now()->startOfMonth();

        return [
            'today' => $this->rendezvousRepository->getRendezvousByDate($today)->count(),
            'this_week' => $this->rendezvousRepository
                ->where('date_heure', '>=', $thisWeek)
                ->where('date_heure', '<', $thisWeek->copy()->addWeek())
                ->count(),
            'this_month' => $this->rendezvousRepository
                ->where('date_heure', '>=', $thisMonth)
                ->where('date_heure', '<', $thisMonth->copy()->addMonth())
                ->count(),
            'by_status' => [
                'confirme' => $this->rendezvousRepository->getRendezvousByStatus('confirmé')->count(),
                'en_attente' => $this->rendezvousRepository->getRendezvousByStatus('en_attente')->count(),
                'annule' => $this->rendezvousRepository->getRendezvousByStatus('annulé')->count(),
            ]
        ];
    }
}
