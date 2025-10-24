<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rendezvous;
use App\Http\Requests\StoreRendezvousRequest;
use App\Http\Resources\RendezvousResource;
use App\Notifications\RendezvousCreated;
use App\Notifications\RendezvousAssigned;
use Illuminate\Http\Request;

class RendezvousController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'Patient') {
            if (!$user->patient) {
                return response()->json(['message' => 'Profil patient non trouvé. Veuillez contacter l\'administrateur.'], 400);
            }
            $rendezvous = Rendezvous::where('patient_id', $user->patient->id)
                ->with(['medecin.user', 'patient.user'])
                ->get();
        } elseif ($user->role === 'Médecin') {
            if (!$user->medecin) {
                return response()->json(['message' => 'Profil médecin non trouvé. Veuillez contacter l\'administrateur.'], 400);
            }
            $rendezvous = Rendezvous::where('medecin_id', $user->medecin->id)
                ->with(['medecin.user', 'patient.user'])
                ->get();
        } else {
            // Admin can see all
            $rendezvous = Rendezvous::with(['medecin.user', 'patient.user'])->get();
        }

        return response()->json($rendezvous);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'medecin_id' => 'required|exists:medecins,id',
            'date_heure' => 'required|date|after:now',
            'motif' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();

        if ($user->role === 'Patient') {
            if (!$user->patient) {
                return response()->json(['message' => 'Profil patient non trouvé. Veuillez contacter l\'administrateur.'], 400);
            }
            $patientId = $user->patient->id;
        } elseif ($user->role === 'Médecin') {
            // Medecins might create appointments for patients, but for now assume they create for themselves if needed
            // This might need adjustment based on requirements
            return response()->json(['message' => 'Médecins ne peuvent pas créer de rendez-vous pour eux-mêmes'], 403);
        } else {
            // Admin might need to specify patient_id
            $request->validate([
                'patient_id' => 'required|exists:patients,id',
            ]);
            $patientId = $request->patient_id;
        }

        $rendezvous = Rendezvous::create([
            'patient_id' => $patientId,
            'medecin_id' => $request->medecin_id,
            'date_heure' => $request->date_heure,
            'motif' => $request->motif,
            'notes' => $request->notes,
            'statut' => 'En attente',
        ]);

        $rendezvous->load(['medecin.user', 'patient.user']);

        // Envoyer notification email au patient
        $rendezvous->patient->user->notify(new RendezvousCreated($rendezvous));

        // Si c'est un admin qui crée le RDV, notifier le médecin
        if ($user->role === 'Admin') {
            $rendezvous->medecin->user->notify(new RendezvousAssigned($rendezvous));
        }

        return new RendezvousResource($rendezvous);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Rendezvous $rendezvous)
    {
        $user = $request->user();

        // Check if user can view this appointment
        if ($user->role === 'Patient' && $rendezvous->patient_id !== $user->patient->id) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }
        if ($user->role === 'Médecin' && $rendezvous->medecin_id !== $user->medecin->id) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        return response()->json($rendezvous->load(['medecin.user', 'patient.user']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Rendezvous $rendezvous)
    {
        $user = $request->user();

        // Check if user can update this appointment
        if ($user->role === 'Patient' && $rendezvous->patient_id !== $user->patient->id) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }
        if ($user->role === 'Médecin' && $rendezvous->medecin_id !== $user->medecin->id) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $request->validate([
            'date_heure' => 'sometimes|date|after:now',
            'statut' => 'sometimes|in:En attente,Confirmé,Annulé,Terminé',
            'motif' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $rendezvous->update($request->only(['date_heure', 'statut', 'motif', 'notes']));

        return response()->json($rendezvous->load(['medecin.user', 'patient.user']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Rendezvous $rendezvous)
    {
        $user = $request->user();

        // Check if user can delete this appointment
        if ($user->role === 'Patient' && $rendezvous->patient_id !== $user->patient->id) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }
        if ($user->role === 'Médecin' && $rendezvous->medecin_id !== $user->medecin->id) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $rendezvous->delete();

        return response()->json(['message' => 'Rendez-vous supprimé avec succès']);
    }

    /**
     * Approve or reject an appointment (for doctors)
     */
    public function updateStatus(Request $request, Rendezvous $rendezvous)
    {
        $user = $request->user();

        // Only the assigned doctor or admin can update status
        if ($user->role === 'Médecin' && $rendezvous->medecin_id !== $user->medecin->id) {
            return response()->json(['message' => 'Vous ne pouvez modifier que vos propres rendez-vous'], 403);
        }
        
        if ($user->role === 'Patient') {
            return response()->json(['message' => 'Les patients ne peuvent pas modifier le statut des rendez-vous'], 403);
        }

        $request->validate([
            'statut' => 'required|in:En attente,Confirmé,Annulé,Terminé',
            'notes_medecin' => 'nullable|string'
        ]);

        $rendezvous->update([
            'statut' => $request->statut,
            'notes' => $request->notes_medecin ? $rendezvous->notes . "\n\nNotes du médecin: " . $request->notes_medecin : $rendezvous->notes
        ]);

        return response()->json([
            'message' => 'Statut du rendez-vous mis à jour avec succès',
            'rendezvous' => $rendezvous->load(['medecin.user', 'patient.user'])
        ]);
    }
}
