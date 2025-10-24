<?php

namespace App\Repositories;

use App\Models\Patient;
use App\Repositories\Contracts\PatientRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class PatientRepository extends BaseRepository implements PatientRepositoryInterface
{
    /**
     * Spécifier le modèle à utiliser
     */
    protected function getModel(): Model
    {
        return new Patient();
    }

    /**
     * Rechercher des patients par nom ou email
     */
    public function searchByNameOrEmail(string $search): Collection
    {
        return $this->model->whereHas('user', function ($query) use ($search) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
        })->with(['user', 'lit.chambre'])->get();
    }

    /**
     * Obtenir les patients d'un médecin spécifique
     */
    public function getPatientsByMedecin(int $medecinId): Collection
    {
        return $this->model->whereHas('rendezvous', function ($query) use ($medecinId) {
            $query->where('medecin_id', $medecinId);
        })->with(['user', 'lit.chambre'])->distinct()->get();
    }

    /**
     * Obtenir les patients avec leurs rendez-vous
     */
    public function getPatientsWithRendezvous(): Collection
    {
        return $this->model->with(['user', 'rendezvous.medecin.user', 'lit.chambre'])->get();
    }

    /**
     * Obtenir les patients hospitalisés (avec un lit)
     */
    public function getHospitalizedPatients(): Collection
    {
        return $this->model->whereHas('lit')->with(['user', 'lit.chambre'])->get();
    }

    /**
     * Ajouter un document à un patient
     */
    public function addDocument(int $patientId, string $fileName, string $fileType, string $filePath): Patient
    {
        $patient = $this->findOrFail($patientId);
        $patient->ajouterDocument($fileName, $fileType, $filePath);
        return $patient->fresh();
    }

    /**
     * Supprimer un document d'un patient
     */
    public function removeDocument(int $patientId, int $documentIndex): Patient
    {
        $patient = $this->findOrFail($patientId);
        $documents = $patient->documents ?? [];
        
        if (isset($documents[$documentIndex])) {
            unset($documents[$documentIndex]);
            $patient->update(['documents' => array_values($documents)]);
        }
        
        return $patient->fresh();
    }

    /**
     * Obtenir les patients par groupe sanguin
     */
    public function getPatientsByBloodGroup(string $bloodGroup): Collection
    {
        return $this->model->where('groupe_sanguin', $bloodGroup)
                          ->with(['user', 'lit.chambre'])
                          ->get();
    }

    /**
     * Obtenir les patients par tranche d'âge
     */
    public function getPatientsByAgeRange(int $minAge, int $maxAge): Collection
    {
        $minDate = Carbon::now()->subYears($maxAge)->format('Y-m-d');
        $maxDate = Carbon::now()->subYears($minAge)->format('Y-m-d');
        
        return $this->model->whereBetween('date_naissance', [$minDate, $maxDate])
                          ->with(['user', 'lit.chambre'])
                          ->get();
    }
}
