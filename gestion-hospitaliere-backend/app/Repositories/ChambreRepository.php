<?php

namespace App\Repositories;

use App\Models\Chambre;
use App\Repositories\Contracts\ChambreRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class ChambreRepository extends BaseRepository implements ChambreRepositoryInterface
{
    /**
     * Spécifier le modèle à utiliser
     */
    protected function getModel(): Model
    {
        return new Chambre();
    }

    /**
     * Obtenir les chambres disponibles
     */
    public function getAvailableChambres(): Collection
    {
        return $this->model->whereHas('lits', function ($query) {
            $query->where('statut', 'libre');
        })->with(['lits', 'service'])->get();
    }

    /**
     * Obtenir les chambres par service
     */
    public function getChambresByService(int $serviceId): Collection
    {
        return $this->model->where('service_id', $serviceId)
                          ->with(['lits', 'service'])
                          ->get();
    }

    /**
     * Obtenir les chambres avec leurs lits
     */
    public function getChambresWithLits(): Collection
    {
        return $this->model->with(['lits.patient.user', 'service'])->get();
    }

    /**
     * Obtenir les chambres par type
     */
    public function getChambresByType(string $type): Collection
    {
        return $this->model->where('type', $type)
                          ->with(['lits', 'service'])
                          ->get();
    }

    /**
     * Obtenir les chambres avec filtres
     */
    public function getChambresWithFilters(array $filters): Collection
    {
        $query = $this->model->with(['service', 'lits']);

        if (isset($filters['service_id'])) {
            $query->where('service_id', $filters['service_id']);
        }

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['disponible'])) {
            $query->where('disponible', $filters['disponible']);
        }

        return $query->get();
    }

    /**
     * Vérifier si une chambre peut être supprimée
     */
    public function canBeDeleted(int $chambreId): bool
    {
        $chambre = $this->find($chambreId);
        
        if (!$chambre) {
            return false;
        }

        // Vérifier qu'aucun lit n'est occupé
        return !$chambre->lits()->where('statut', 'occupe')->exists();
    }
}
