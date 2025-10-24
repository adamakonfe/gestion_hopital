<?php

namespace App\Repositories\Contracts;

use App\Models\Patient;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface PatientRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Rechercher des patients par nom ou email
     */
    public function searchByNameOrEmail(string $search): Collection;

    /**
     * Obtenir les patients d'un médecin spécifique
     */
    public function getPatientsByMedecin(int $medecinId): Collection;

    /**
     * Obtenir les patients avec leurs rendez-vous
     */
    public function getPatientsWithRendezvous(): Collection;

    /**
     * Obtenir les patients hospitalisés (avec un lit)
     */
    public function getHospitalizedPatients(): Collection;

    /**
     * Ajouter un document à un patient
     */
    public function addDocument(int $patientId, string $fileName, string $fileType, string $filePath): Patient;

    /**
     * Supprimer un document d'un patient
     */
    public function removeDocument(int $patientId, int $documentIndex): Patient;

    /**
     * Obtenir les patients par groupe sanguin
     */
    public function getPatientsByBloodGroup(string $bloodGroup): Collection;

    /**
     * Obtenir les patients par tranche d'âge
     */
    public function getPatientsByAgeRange(int $minAge, int $maxAge): Collection;
}
