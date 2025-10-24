<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;

interface LitRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Obtenir les lits disponibles
     */
    public function getAvailableLits(): Collection;

    /**
     * Obtenir les lits occupés
     */
    public function getOccupiedLits(): Collection;

    /**
     * Obtenir les lits par chambre
     */
    public function getLitsByChambre(int $chambreId): Collection;

    /**
     * Obtenir les lits par statut
     */
    public function getLitsByStatus(string $status): Collection;

    /**
     * Compter les lits par statut
     */
    public function countLitsByStatus(): array;
}
