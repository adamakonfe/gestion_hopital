<?php

namespace App\Repositories;

use App\Models\Lit;
use App\Repositories\Contracts\LitRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class LitRepository extends BaseRepository implements LitRepositoryInterface
{
    /**
     * Spécifier le modèle à utiliser
     */
    protected function getModel(): Model
    {
        return new Lit();
    }

    /**
     * Obtenir les lits disponibles
     */
    public function getAvailableLits(): Collection
    {
        return $this->model->where('statut', 'disponible')
                          ->with(['chambre.service', 'patient.user'])
                          ->get();
    }

    /**
     * Obtenir les lits occupés
     */
    public function getOccupiedLits(): Collection
    {
        return $this->model->where('statut', 'occupe')
                          ->with(['chambre.service', 'patient.user'])
                          ->get();
    }

    /**
     * Obtenir les lits par chambre
     */
    public function getLitsByChambre(int $chambreId): Collection
    {
        return $this->model->where('chambre_id', $chambreId)
                          ->with(['patient.user'])
                          ->get();
    }

    /**
     * Obtenir les lits par statut
     */
    public function getLitsByStatus(string $status): Collection
    {
        return $this->model->where('statut', $status)
                          ->with(['chambre.service', 'patient.user'])
                          ->get();
    }

    /**
     * Compter les lits par statut
     */
    public function countLitsByStatus(): array
    {
        return [
            'disponible' => $this->model->where('statut', 'disponible')->count(),
            'occupe' => $this->model->where('statut', 'occupe')->count(),
            'maintenance' => $this->model->where('statut', 'maintenance')->count(),
            'total' => $this->model->count(),
        ];
    }
}
