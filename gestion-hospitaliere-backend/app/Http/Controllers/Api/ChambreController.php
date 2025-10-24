<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chambre;
use App\Http\Requests\StoreChambreRequest;
use App\Http\Resources\ChambreResource;
use Illuminate\Http\Request;

/**
 * Contrôleur pour la gestion des chambres
 */
class ChambreController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Chambre::with(['service', 'lits']);

        // Filtres
        if ($request->has('service_id')) {
            $query->where('service_id', $request->service_id);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('disponible')) {
            $query->where('disponible', $request->boolean('disponible'));
        }

        $chambres = $query->paginate($request->get('per_page', 15));

        return ChambreResource::collection($chambres);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreChambreRequest $request)
    {
        $chambre = Chambre::create($request->validated());
        $chambre->load(['service', 'lits']);

        return new ChambreResource($chambre);
    }

    /**
     * Display the specified resource.
     */
    public function show(Chambre $chambre)
    {
        $chambre->load(['service', 'lits.patient.user']);
        return new ChambreResource($chambre);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Chambre $chambre)
    {
        $validated = $request->validate([
            'numero' => 'sometimes|string|unique:chambres,numero,' . $chambre->id,
            'service_id' => 'sometimes|exists:services,id',
            'type' => 'sometimes|in:standard,vip,soins_intensifs,urgence',
            'capacite' => 'sometimes|integer|min:1|max:10',
            'tarif_journalier' => 'sometimes|numeric|min:0',
            'disponible' => 'sometimes|boolean',
            'equipements' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        $chambre->update($validated);
        $chambre->load(['service', 'lits']);

        return new ChambreResource($chambre);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Chambre $chambre)
    {
        // Vérifier qu'aucun lit n'est occupé
        if ($chambre->lits()->where('statut', 'occupe')->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer une chambre avec des lits occupés'
            ], 422);
        }

        $chambre->delete();

        return response()->json([
            'message' => 'Chambre supprimée avec succès'
        ]);
    }

    /**
     * Get available rooms
     */
    public function disponibles(Request $request)
    {
        $chambres = Chambre::disponibles()
            ->with(['service', 'lits'])
            ->get();

        return ChambreResource::collection($chambres);
    }
}
