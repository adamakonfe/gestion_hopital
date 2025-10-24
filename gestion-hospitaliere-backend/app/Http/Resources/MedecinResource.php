<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource pour formater les données médecin en JSON
 */
class MedecinResource extends JsonResource
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
            'specialite' => $this->specialite,
            'service' => [
                'id' => $this->service->id,
                'nom' => $this->service->nom,
            ],
            'disponibilites' => $this->disponibilites,
            'rendezvous_count' => $this->whenCounted('rendezvous'),
            'rendezvous' => RendezvousResource::collection($this->whenLoaded('rendezvous')),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
