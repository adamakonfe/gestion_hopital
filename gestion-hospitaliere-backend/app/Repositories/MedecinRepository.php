<?php

namespace App\Repositories;

use App\Models\Medecin;
use App\Repositories\Contracts\MedecinRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class MedecinRepository extends BaseRepository implements MedecinRepositoryInterface
{
    /**
     * Spécifier le modèle à utiliser
     */
    protected function getModel(): Model
    {
        return new Medecin();
    }

    /**
     * Obtenir les médecins par spécialité
     */
    public function getMedecinsBySpecialite(string $specialite): Collection
    {
        return $this->model->where('specialite', $specialite)
                          ->with(['user', 'service'])
                          ->get();
    }

    /**
     * Obtenir les médecins d'un service spécifique
     */
    public function getMedecinsByService(int $serviceId): Collection
    {
        return $this->model->where('service_id', $serviceId)
                          ->with(['user', 'service'])
                          ->get();
    }

    /**
     * Obtenir les médecins disponibles à une date donnée
     */
    public function getAvailableMedecins(\DateTime $date): Collection
    {
        $dayOfWeek = strtolower($date->format('l')); // lundi, mardi, etc.
        
        return $this->model->whereJsonContains('disponibilites', [$dayOfWeek => true])
                          ->with(['user', 'service'])
                          ->get();
    }

    /**
     * Obtenir les médecins avec leurs rendez-vous du jour
     */
    public function getMedecinsWithTodayRendezvous(): Collection
    {
        $today = Carbon::today();
        
        return $this->model->with([
            'user', 
            'service',
            'rendezvous' => function ($query) use ($today) {
                $query->whereDate('date_heure', $today)
                      ->with('patient.user');
            }
        ])->get();
    }

    /**
     * Obtenir les médecins avec le nombre de patients
     */
    public function getMedecinsWithPatientCount(): Collection
    {
        return $this->model->withCount([
            'rendezvous as patients_count' => function ($query) {
                $query->distinct('patient_id');
            }
        ])->with(['user', 'service'])->get();
    }

    /**
     * Rechercher des médecins par nom
     */
    public function searchByName(string $name): Collection
    {
        return $this->model->whereHas('user', function ($query) use ($name) {
            $query->where('name', 'like', "%{$name}%");
        })->with(['user', 'service'])->get();
    }
}
