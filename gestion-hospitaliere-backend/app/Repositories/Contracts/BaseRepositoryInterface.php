<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

interface BaseRepositoryInterface
{
    /**
     * Récupérer tous les enregistrements
     */
    public function all(array $relations = []): Collection;

    /**
     * Trouver un enregistrement par ID
     */
    public function find(int $id, array $relations = []): ?Model;

    /**
     * Trouver un enregistrement par ID ou échouer
     */
    public function findOrFail(int $id, array $relations = []): Model;

    /**
     * Créer un nouvel enregistrement
     */
    public function create(array $data): Model;

    /**
     * Mettre à jour un enregistrement
     */
    public function update(int $id, array $data): Model;

    /**
     * Supprimer un enregistrement
     */
    public function delete(int $id): bool;

    /**
     * Pagination des résultats
     */
    public function paginate(int $perPage = 15, array $relations = []): LengthAwarePaginator;

    /**
     * Recherche avec conditions
     */
    public function where(string $column, $operator, $value = null): self;

    /**
     * Recherche avec relations
     */
    public function whereHas(string $relation, callable $callback): self;

    /**
     * Ordonner les résultats
     */
    public function orderBy(string $column, string $direction = 'asc'): self;

    /**
     * Charger les relations
     */
    public function with(array $relations): self;

    /**
     * Obtenir les résultats de la requête
     */
    public function get(): Collection;

    /**
     * Obtenir le premier résultat
     */
    public function first(): ?Model;

    /**
     * Compter les résultats
     */
    public function count(): int;

    /**
     * Vérifier si des enregistrements existent
     */
    public function exists(): bool;
}
