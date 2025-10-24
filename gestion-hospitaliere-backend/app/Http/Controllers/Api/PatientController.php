<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Http\Requests\UpdatePatientRequest;
use App\Http\Resources\PatientResource;
use App\Repositories\Contracts\PatientRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PatientController extends Controller
{
    protected PatientRepositoryInterface $patientRepository;

    public function __construct(PatientRepositoryInterface $patientRepository)
    {
        $this->patientRepository = $patientRepository;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $perPage = $request->get('per_page', 15);

        if ($user->role === 'Médecin') {
            // For medecin, show patients they have rendezvous with
            $patients = $this->patientRepository->getPatientsByMedecin($user->medecin->id);
            
            // Si recherche, filtrer les résultats
            if ($request->has('search')) {
                $patients = $this->patientRepository->searchByNameOrEmail($request->search);
            }
            
            // Convertir en pagination manuelle si nécessaire
            $currentPage = $request->get('page', 1);
            $offset = ($currentPage - 1) * $perPage;
            $paginatedItems = $patients->slice($offset, $perPage);
            
            return PatientResource::collection($paginatedItems);
        }

        // Pour les autres rôles
        if ($request->has('search')) {
            $patients = $this->patientRepository->searchByNameOrEmail($request->search);
            return PatientResource::collection($patients);
        }

        // Pagination normale
        $patients = $this->patientRepository->with(['user', 'lit.chambre'])->paginate($perPage);
        return PatientResource::collection($patients);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Assuming patient is created via registration, but allow updating existing
        // For now, not implementing store as patients are created on user registration
        return response()->json(['message' => 'Use registration to create patients'], 400);
    }

    /**
     * Display the specified resource.
     */
    public function show(Patient $patient)
    {
        $patientWithRelations = $this->patientRepository->find($patient->id, [
            'user', 
            'lit.chambre', 
            'rendezvous.medecin.user', 
            'prescriptions'
        ]);
        
        return new PatientResource($patientWithRelations);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePatientRequest $request, Patient $patient)
    {
        $validated = $request->validated();

        // Gérer l'upload de la photo
        if ($request->hasFile('photo')) {
            if ($patient->photo) {
                Storage::disk('public')->delete($patient->photo);
            }
            $validated['photo'] = $request->file('photo')->store('patients/photos', 'public');
        }

        // Gérer l'upload des documents
        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $document) {
                $path = $document->store('patients/documents', 'public');
                $this->patientRepository->addDocument(
                    $patient->id,
                    $document->getClientOriginalName(),
                    $document->getClientMimeType(),
                    $path
                );
            }
            unset($validated['documents']);
        }

        $updatedPatient = $this->patientRepository->update($patient->id, $validated);
        
        return new PatientResource($updatedPatient);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Patient $patient)
    {
        if ($patient->photo) {
            Storage::disk('public')->delete($patient->photo);
        }

        if ($patient->documents) {
            foreach ($patient->documents as $doc) {
                Storage::disk('public')->delete($doc['chemin']);
            }
        }

        $this->patientRepository->delete($patient->id);
        return response()->json(['message' => 'Patient supprimé avec succès']);
    }

    /**
     * Télécharger un document patient
     */
    public function downloadDocument(Patient $patient, $documentIndex)
    {
        $documents = $patient->documents;
        
        if (!isset($documents[$documentIndex])) {
            return response()->json(['message' => 'Document non trouvé'], 404);
        }

        $document = $documents[$documentIndex];
        $path = storage_path('app/public/' . $document['chemin']);

        if (!file_exists($path)) {
            return response()->json(['message' => 'Fichier non trouvé'], 404);
        }

        return response()->download($path, $document['nom']);
    }

    /**
     * Supprimer un document spécifique
     */
    public function deleteDocument(Patient $patient, $documentIndex)
    {
        $documents = $patient->documents;
        
        if (!isset($documents[$documentIndex])) {
            return response()->json(['message' => 'Document non trouvé'], 404);
        }

        Storage::disk('public')->delete($documents[$documentIndex]['chemin']);

        $this->patientRepository->removeDocument($patient->id, $documentIndex);

        return response()->json(['message' => 'Document supprimé avec succès']);
    }
}
