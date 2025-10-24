<?php

namespace App\Repositories;

use App\Models\Rendezvous;
use App\Repositories\Contracts\RendezvousRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class RendezvousRepository extends BaseRepository implements RendezvousRepositoryInterface
{
    /**
     * Spécifier le modèle à utiliser
     */
    protected function getModel(): Model
    {
        return new Rendezvous();
    }

    /**
     * Obtenir les rendez-vous d'un patient
     */
    public function getRendezvousByPatient(int $patientId): Collection
    {
        return $this->model->where('patient_id', $patientId)
                          ->with(['medecin.user', 'patient.user'])
                          ->orderBy('date_heure', 'desc')
                          ->get();
    }

    /**
     * Obtenir les rendez-vous d'un médecin
     */
    public function getRendezvousByMedecin(int $medecinId): Collection
    {
        return $this->model->where('medecin_id', $medecinId)
                          ->with(['medecin.user', 'patient.user'])
                          ->orderBy('date_heure', 'desc')
                          ->get();
    }

    /**
     * Obtenir les rendez-vous du jour
     */
    public function getTodayRendezvous(): Collection
    {
        return $this->model->whereDate('date_heure', Carbon::today())
                          ->with(['medecin.user', 'patient.user'])
                          ->orderBy('date_heure', 'asc')
                          ->get();
    }

    /**
     * Obtenir les rendez-vous d'une date spécifique
     */
    public function getRendezvousByDate(\DateTime $date): Collection
    {
        return $this->model->whereDate('date_heure', $date->format('Y-m-d'))
                          ->with(['medecin.user', 'patient.user'])
                          ->orderBy('date_heure', 'asc')
                          ->get();
    }

    /**
     * Obtenir les rendez-vous par statut
     */
    public function getRendezvousByStatus(string $status): Collection
    {
        return $this->model->where('statut', $status)
                          ->with(['medecin.user', 'patient.user'])
                          ->orderBy('date_heure', 'desc')
                          ->get();
    }

    /**
     * Obtenir les rendez-vous à venir d'un patient
     */
    public function getUpcomingRendezvousByPatient(int $patientId): Collection
    {
        return $this->model->where('patient_id', $patientId)
                          ->where('date_heure', '>', Carbon::now())
                          ->with(['medecin.user', 'patient.user'])
                          ->orderBy('date_heure', 'asc')
                          ->get();
    }

    /**
     * Obtenir les rendez-vous à venir d'un médecin
     */
    public function getUpcomingRendezvousByMedecin(int $medecinId): Collection
    {
        return $this->model->where('medecin_id', $medecinId)
                          ->where('date_heure', '>', Carbon::now())
                          ->with(['medecin.user', 'patient.user'])
                          ->orderBy('date_heure', 'asc')
                          ->get();
    }

    /**
     * Vérifier la disponibilité d'un médecin
     */
    public function checkMedecinAvailability(int $medecinId, \DateTime $dateTime): bool
    {
        return !$this->model->where('medecin_id', $medecinId)
                           ->where('date_heure', $dateTime->format('Y-m-d H:i:s'))
                           ->whereIn('statut', ['confirmé', 'en_attente'])
                           ->exists();
    }

    /**
     * Obtenir les créneaux libres d'un médecin pour une date
     */
    public function getAvailableSlots(int $medecinId, \DateTime $date): array
    {
        // Créneaux de base (8h-18h par tranches de 30 minutes)
        $baseSlots = [];
        $startTime = Carbon::createFromFormat('Y-m-d H:i', $date->format('Y-m-d') . ' 08:00');
        $endTime = Carbon::createFromFormat('Y-m-d H:i', $date->format('Y-m-d') . ' 18:00');
        
        while ($startTime < $endTime) {
            $baseSlots[] = $startTime->format('H:i');
            $startTime->addMinutes(30);
        }
        
        // Récupérer les rendez-vous existants
        $existingRendezvous = $this->model->where('medecin_id', $medecinId)
                                         ->whereDate('date_heure', $date->format('Y-m-d'))
                                         ->whereIn('statut', ['confirmé', 'en_attente'])
                                         ->pluck('date_heure')
                                         ->map(function ($dateTime) {
                                             return Carbon::parse($dateTime)->format('H:i');
                                         })
                                         ->toArray();
        
        // Retourner les créneaux disponibles
        return array_diff($baseSlots, $existingRendezvous);
    }
}
