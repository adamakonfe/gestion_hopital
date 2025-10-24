<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource pour formater les données rendez-vous en JSON
 */
class RendezvousResource extends JsonResource
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
            'patient' => [
                'id' => $this->patient->id,
                'nom' => $this->patient->user->name,
                'telephone' => $this->patient->telephone,
            ],
            'medecin' => [
                'id' => $this->medecin->id,
                'nom' => $this->medecin->user->name,
                'specialite' => $this->medecin->specialite,
            ],
            'date_heure' => $this->date_heure?->format('Y-m-d H:i'),
            'motif' => $this->motif,
            'statut' => $this->statut,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
