<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prescription;
use Illuminate\Http\Request;

class PrescriptionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'Patient') {
            $prescriptions = Prescription::where('patient_id', $user->patient->id)
                ->with(['medecin.user', 'patient.user'])
                ->orderBy('date', 'desc')
                ->get();
        } elseif ($user->role === 'Médecin') {
            $prescriptions = Prescription::where('medecin_id', $user->medecin->id)
                ->with(['medecin.user', 'patient.user'])
                ->orderBy('date', 'desc')
                ->get();
        } else {
            // Admin can see all
            $prescriptions = Prescription::with(['medecin.user', 'patient.user'])
                ->orderBy('date', 'desc')
                ->get();
        }

        return response()->json($prescriptions);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'contenu' => 'required|string',
            'fichier_pdf' => 'nullable|file|mimes:pdf|max:5120',
            'date' => 'required|date',
        ]);

        $user = $request->user();

        if ($user->role !== 'Médecin') {
            return response()->json(['message' => 'Seuls les médecins peuvent créer des prescriptions'], 403);
        }

        $data = [
            'patient_id' => $request->patient_id,
            'medecin_id' => $user->medecin->id,
            'contenu' => $request->contenu,
            'date' => $request->date,
        ];

        // Handle PDF file upload if provided
        if ($request->hasFile('fichier_pdf')) {
            $file = $request->file('fichier_pdf');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('prescriptions', $filename, 'public');
            $data['fichier_pdf'] = $path;
        }

        $prescription = Prescription::create($data);

        return response()->json($prescription->load(['medecin.user', 'patient.user']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Prescription $prescription)
    {
        $user = $request->user();

        // Check if user can view this prescription
        if ($user->role === 'Patient' && $prescription->patient_id !== $user->patient->id) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }
        if ($user->role === 'Médecin' && $prescription->medecin_id !== $user->medecin->id) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        return response()->json($prescription->load(['medecin.user', 'patient.user']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Prescription $prescription)
    {
        $user = $request->user();

        // Check if user can update this prescription
        if ($user->role !== 'Médecin' || $prescription->medecin_id !== $user->medecin->id) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $request->validate([
            'contenu' => 'sometimes|required|string',
            'fichier_pdf' => 'nullable|file|mimes:pdf|max:5120',
            'date' => 'sometimes|required|date',
        ]);

        $data = $request->only(['contenu', 'date']);

        // Handle PDF file upload if provided
        if ($request->hasFile('fichier_pdf')) {
            $file = $request->file('fichier_pdf');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('prescriptions', $filename, 'public');
            $data['fichier_pdf'] = $path;
        }

        $prescription->update($data);

        return response()->json($prescription->load(['medecin.user', 'patient.user']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Prescription $prescription)
    {
        $user = $request->user();

        // Check if user can delete this prescription
        if ($user->role !== 'Médecin' || $prescription->medecin_id !== $user->medecin->id) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $prescription->delete();

        return response()->json(['message' => 'Prescription supprimée avec succès']);
    }
}
