<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;

interface RendezvousRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Obtenir les rendez-vous d'un patient
     */
    public function getRendezvousByPatient(int $patientId): Collection;

    /**
     * Obtenir les rendez-vous d'un médecin
     */
    public function getRendezvousByMedecin(int $medecinId): Collection;

    /**
     * Obtenir les rendez-vous du jour
     */
    public function getTodayRendezvous(): Collection;

    /**
     * Obtenir les rendez-vous d'une date spécifique
     */
    public function getRendezvousByDate(\DateTime $date): Collection;

    /**
     * Obtenir les rendez-vous par statut
     */
    public function getRendezvousByStatus(string $status): Collection;

    /**
     * Obtenir les rendez-vous à venir d'un patient
     */
    public function getUpcomingRendezvousByPatient(int $patientId): Collection;

    /**
     * Obtenir les rendez-vous à venir d'un médecin
     */
    public function getUpcomingRendezvousByMedecin(int $medecinId): Collection;

    /**
     * Vérifier la disponibilité d'un médecin
     */
    public function checkMedecinAvailability(int $medecinId, \DateTime $dateTime): bool;

    /**
     * Obtenir les créneaux libres d'un médecin pour une date
     */
    public function getAvailableSlots(int $medecinId, \DateTime $date): array;
}
