<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;

interface MedecinRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Obtenir les médecins par spécialité
     */
    public function getMedecinsBySpecialite(string $specialite): Collection;

    /**
     * Obtenir les médecins d'un service spécifique
     */
    public function getMedecinsByService(int $serviceId): Collection;

    /**
     * Obtenir les médecins disponibles à une date donnée
     */
    public function getAvailableMedecins(\DateTime $date): Collection;

    /**
     * Obtenir les médecins avec leurs rendez-vous du jour
     */
    public function getMedecinsWithTodayRendezvous(): Collection;

    /**
     * Obtenir les médecins avec le nombre de patients
     */
    public function getMedecinsWithPatientCount(): Collection;

    /**
     * Rechercher des médecins par nom
     */
    public function searchByName(string $name): Collection;
}
