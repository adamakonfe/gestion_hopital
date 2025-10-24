<?php

namespace App\Repositories;

use App\Repositories\Contracts\BaseRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

abstract class BaseRepository implements BaseRepositoryInterface
{
    protected Model $model;
    protected Builder $query;

    public function __construct()
    {
        $this->model = $this->getModel();
        $this->resetQuery();
    }

    /**
     * Spécifier le modèle à utiliser dans le repository
     */
    abstract protected function getModel(): Model;

    /**
     * Réinitialiser la requête
     */
    protected function resetQuery(): void
    {
        $this->query = $this->model->newQuery();
    }

    /**
     * Récupérer tous les enregistrements
     */
    public function all(array $relations = []): Collection
    {
        $query = $this->model->newQuery();
        
        if (!empty($relations)) {
            $query->with($relations);
        }
        
        return $query->get();
    }

    /**
     * Trouver un enregistrement par ID
     */
    public function find(int $id, array $relations = []): ?Model
    {
        $query = $this->model->newQuery();
        
        if (!empty($relations)) {
            $query->with($relations);
        }
        
        return $query->find($id);
    }

    /**
     * Trouver un enregistrement par ID ou échouer
     */
    public function findOrFail(int $id, array $relations = []): Model
    {
        $query = $this->model->newQuery();
        
        if (!empty($relations)) {
            $query->with($relations);
        }
        
        return $query->findOrFail($id);
    }

    /**
     * Créer un nouvel enregistrement
     */
    public function create(array $data): Model
    {
        return $this->model->create($data);
    }

    /**
     * Mettre à jour un enregistrement
     */
    public function update(int $id, array $data): Model
    {
        $model = $this->findOrFail($id);
        $model->update($data);
        return $model->fresh();
    }

    /**
     * Supprimer un enregistrement
     */
    public function delete(int $id): bool
    {
        $model = $this->findOrFail($id);
        return $model->delete();
    }

    /**
     * Pagination des résultats
     */
    public function paginate(int $perPage = 15, array $relations = []): LengthAwarePaginator
    {
        if (!empty($relations)) {
            $this->query->with($relations);
        }
        
        $result = $this->query->paginate($perPage);
        $this->resetQuery();
        
        return $result;
    }

    /**
     * Recherche avec conditions
     */
    public function where(string $column, $operator, $value = null): self
    {
        if ($value === null) {
            $this->query->where($column, $operator);
        } else {
            $this->query->where($column, $operator, $value);
        }
        
        return $this;
    }

    /**
     * Recherche avec relations
     */
    public function whereHas(string $relation, callable $callback): self
    {
        $this->query->whereHas($relation, $callback);
        return $this;
    }

    /**
     * Ordonner les résultats
     */
    public function orderBy(string $column, string $direction = 'asc'): self
    {
        $this->query->orderBy($column, $direction);
        return $this;
    }

    /**
     * Charger les relations
     */
    public function with(array $relations): self
    {
        $this->query->with($relations);
        return $this;
    }

    /**
     * Obtenir les résultats de la requête
     */
    public function get(): Collection
    {
        $result = $this->query->get();
        $this->resetQuery();
        return $result;
    }

    /**
     * Obtenir le premier résultat
     */
    public function first(): ?Model
    {
        $result = $this->query->first();
        $this->resetQuery();
        return $result;
    }

    /**
     * Compter les résultats
     */
    public function count(): int
    {
        $result = $this->query->count();
        $this->resetQuery();
        return $result;
    }

    /**
     * Vérifier si des enregistrements existent
     */
    public function exists(): bool
    {
        $result = $this->query->exists();
        $this->resetQuery();
        return $result;
    }
}
