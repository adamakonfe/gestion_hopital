<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;

interface ChambreRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Obtenir les chambres disponibles
     */
    public function getAvailableChambres(): Collection;

    /**
     * Obtenir les chambres par service
     */
    public function getChambresByService(int $serviceId): Collection;

    /**
     * Obtenir les chambres avec leurs lits
     */
    public function getChambresWithLits(): Collection;

    /**
     * Obtenir les chambres par type
     */
    public function getChambresByType(string $type): Collection;

    /**
     * Obtenir les chambres avec filtres
     */
    public function getChambresWithFilters(array $filters): Collection;

    /**
     * Vérifier si une chambre peut être supprimée
     */
    public function canBeDeleted(int $chambreId): bool;
}
