<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource pour formater les données patient en JSON
 */
class PatientResource extends JsonResource
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
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ],
            'date_naissance' => $this->date_naissance?->format('Y-m-d'),
            'age' => $this->age,
            'adresse' => $this->adresse,
            'telephone' => $this->telephone,
            'groupe_sanguin' => $this->groupe_sanguin,
            'historique_medical' => $this->historique_medical,
            'photo' => $this->photo ? asset('storage/' . $this->photo) : null,
            'documents' => $this->documents,
            'lit_actuel' => new LitResource($this->whenLoaded('lit')),
            'rendezvous' => RendezvousResource::collection($this->whenLoaded('rendezvous')),
            'prescriptions' => PrescriptionResource::collection($this->whenLoaded('prescriptions')),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
