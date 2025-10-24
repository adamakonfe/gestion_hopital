<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource pour formater les données prescription en JSON
 */
class PrescriptionResource extends JsonResource
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
            ],
            'medecin' => [
                'id' => $this->medecin->id,
                'nom' => $this->medecin->user->name,
                'specialite' => $this->medecin->specialite,
            ],
            'medicaments' => $this->medicaments,
            'posologie' => $this->posologie,
            'duree' => $this->duree,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
