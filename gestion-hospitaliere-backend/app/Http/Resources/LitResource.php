<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource pour formater les données lit en JSON
 */
class LitResource extends JsonResource
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
            'chambre' => [
                'id' => $this->chambre->id,
                'numero' => $this->chambre->numero,
                'type' => $this->chambre->type,
            ],
            'numero' => $this->numero,
            'identifiant_complet' => $this->identifiant_complet,
            'statut' => $this->statut,
            'patient' => $this->when($this->patient_id, function() {
                return [
                    'id' => $this->patient->id,
                    'nom' => $this->patient->user->name,
                    'telephone' => $this->patient->telephone,
                ];
            }),
            'date_occupation' => $this->date_occupation?->format('Y-m-d'),
            'date_liberation_prevue' => $this->date_liberation_prevue?->format('Y-m-d'),
            'notes' => $this->notes,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
