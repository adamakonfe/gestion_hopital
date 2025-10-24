<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Http\Requests\UpdatePatientRequest;
use App\Http\Resources\PatientResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PatientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = Patient::with(['user', 'lit.chambre']);

        if ($user->role === 'Médecin') {
            // For medecin, show patients they have rendezvous with
            $query->whereHas('rendezvous', function ($q) use ($user) {
                $q->where('medecin_id', $user->medecin->id);
            });
        }

        // Filtres
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $patients = $query->paginate($request->get('per_page', 15));

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
        $patient->load(['user', 'lit.chambre', 'rendezvous.medecin.user', 'prescriptions']);
        return new PatientResource($patient);
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
                $patient->ajouterDocument(
                    $document->getClientOriginalName(),
                    $document->getClientMimeType(),
                    $path
                );
            }
            unset($validated['documents']);
        }

        $patient->update($validated);
        $patient->load('user');
        
        return new PatientResource($patient);
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

        $patient->delete();
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

        unset($documents[$documentIndex]);
        $patient->update(['documents' => array_values($documents)]);

        return response()->json(['message' => 'Document supprimé avec succès']);
    }
}
