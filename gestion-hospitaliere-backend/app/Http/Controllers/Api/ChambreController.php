<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chambre;
use App\Http\Requests\StoreChambreRequest;
use App\Http\Resources\ChambreResource;
use App\Repositories\Contracts\ChambreRepositoryInterface;
use Illuminate\Http\Request;

/**
 * Contrôleur pour la gestion des chambres
 */
class ChambreController extends Controller
{
    protected ChambreRepositoryInterface $chambreRepository;

    public function __construct(ChambreRepositoryInterface $chambreRepository)
    {
        $this->chambreRepository = $chambreRepository;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        
        // Si des filtres sont présents, utiliser la méthode avec filtres
        if ($request->hasAny(['service_id', 'type', 'disponible'])) {
            $filters = $request->only(['service_id', 'type', 'disponible']);
            if (isset($filters['disponible'])) {
                $filters['disponible'] = $request->boolean('disponible');
            }
            
            $chambres = $this->chambreRepository->getChambresWithFilters($filters);
            return ChambreResource::collection($chambres);
        }

        // Sinon, pagination normale
        $chambres = $this->chambreRepository->with(['service', 'lits'])->paginate($perPage);
        return ChambreResource::collection($chambres);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreChambreRequest $request)
    {
        $chambre = $this->chambreRepository->create($request->validated());
        $chambreWithRelations = $this->chambreRepository->find($chambre->id, ['service', 'lits']);

        return new ChambreResource($chambreWithRelations);
    }

    /**
     * Display the specified resource.
     */
    public function show(Chambre $chambre)
    {
        $chambreWithRelations = $this->chambreRepository->find($chambre->id, ['service', 'lits.patient.user']);
        return new ChambreResource($chambreWithRelations);
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

        $updatedChambre = $this->chambreRepository->update($chambre->id, $validated);
        $chambreWithRelations = $this->chambreRepository->find($updatedChambre->id, ['service', 'lits']);

        return new ChambreResource($chambreWithRelations);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Chambre $chambre)
    {
        // Vérifier qu'aucun lit n'est occupé
        if (!$this->chambreRepository->canBeDeleted($chambre->id)) {
            return response()->json([
                'message' => 'Impossible de supprimer une chambre avec des lits occupés'
            ], 422);
        }

        $this->chambreRepository->delete($chambre->id);

        return response()->json([
            'message' => 'Chambre supprimée avec succès'
        ]);
    }

    /**
     * Get available rooms
     */
    public function disponibles(Request $request)
    {
        $chambres = $this->chambreRepository->getAvailableChambres();

        return ChambreResource::collection($chambres);
    }
}
