<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lit;
use App\Http\Requests\StoreLitRequest;
use App\Http\Resources\LitResource;
use Illuminate\Http\Request;

/**
 * Contrôleur pour la gestion des lits
 */
class LitController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Lit::with(['chambre.service', 'patient.user']);

        // Filtres
        if ($request->has('chambre_id')) {
            $query->where('chambre_id', $request->chambre_id);
        }

        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        $lits = $query->paginate($request->get('per_page', 20));

        return LitResource::collection($lits);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreLitRequest $request)
    {
        $lit = Lit::create($request->validated());
        $lit->load(['chambre.service']);

        return new LitResource($lit);
    }

    /**
     * Display the specified resource.
     */
    public function show(Lit $lit)
    {
        $lit->load(['chambre.service', 'patient.user']);
        return new LitResource($lit);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Lit $lit)
    {
        $validated = $request->validate([
            'numero' => 'sometimes|string|max:10',
            'statut' => 'sometimes|in:disponible,occupe,maintenance,reserve',
            'patient_id' => 'nullable|exists:patients,id',
            'date_occupation' => 'nullable|date',
            'date_liberation_prevue' => 'nullable|date|after:date_occupation',
            'notes' => 'nullable|string',
        ]);

        $lit->update($validated);
        $lit->load(['chambre.service', 'patient.user']);

        return new LitResource($lit);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Lit $lit)
    {
        // Vérifier que le lit n'est pas occupé
        if ($lit->statut === 'occupe') {
            return response()->json([
                'message' => 'Impossible de supprimer un lit occupé'
            ], 422);
        }

        $lit->delete();

        return response()->json([
            'message' => 'Lit supprimé avec succès'
        ]);
    }

    /**
     * Get available beds
     */
    public function disponibles(Request $request)
    {
        $lits = Lit::disponibles()
            ->with(['chambre.service'])
            ->get();

        return LitResource::collection($lits);
    }

    /**
     * Assign a patient to a bed
     */
    public function assignerPatient(Request $request, Lit $lit)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'date_liberation_prevue' => 'nullable|date|after:today',
        ]);

        if ($lit->statut !== 'disponible') {
            return response()->json([
                'message' => 'Ce lit n\'est pas disponible'
            ], 422);
        }

        $lit->assignerPatient(
            $validated['patient_id'],
            $validated['date_liberation_prevue'] ?? null
        );

        $lit->load(['chambre.service', 'patient.user']);

        return new LitResource($lit);
    }

    /**
     * Release a bed
     */
    public function liberer(Lit $lit)
    {
        if ($lit->statut !== 'occupe') {
            return response()->json([
                'message' => 'Ce lit n\'est pas occupé'
            ], 422);
        }

        $lit->liberer();
        $lit->load(['chambre.service']);

        return new LitResource($lit);
    }
}
