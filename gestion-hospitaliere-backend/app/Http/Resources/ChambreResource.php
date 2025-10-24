<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource pour formater les données chambre en JSON
 */
class ChambreResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'numero' => $this->numero,
            'service' => [
                'id' => $this->service->id,
                'nom' => $this->service->nom,
            ],
            'type' => $this->type,
            'capacite' => $this->capacite,
            'tarif_journalier' => (float) $this->tarif_journalier,
            'disponible' => $this->disponible,
            'equipements' => $this->equipements,
            'notes' => $this->notes,
            'lits' => LitResource::collection($this->whenLoaded('lits')),
            'lits_disponibles_count' => $this->lits_disponibles_count,
            'taux_occupation' => $this->taux_occupation,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
