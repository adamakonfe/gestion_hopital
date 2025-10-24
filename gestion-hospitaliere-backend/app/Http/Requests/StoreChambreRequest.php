<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validation pour la création d'une chambre
 */
class StoreChambreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasRole('Admin');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'numero' => 'required|string|unique:chambres,numero|max:50',
            'service_id' => 'required|exists:services,id',
            'type' => 'required|in:standard,vip,soins_intensifs,urgence',
            'capacite' => 'required|integer|min:1|max:10',
            'tarif_journalier' => 'required|numeric|min:0',
            'disponible' => 'sometimes|boolean',
            'equipements' => 'nullable|array',
            'equipements.*' => 'string',
            'notes' => 'nullable|string',
        ];
    }

    /**
     * Messages d'erreur personnalisés
     */
    public function messages(): array
    {
        return [
            'numero.required' => 'Le numéro de chambre est requis',
            'numero.unique' => 'Ce numéro de chambre existe déjà',
            'service_id.required' => 'Le service est requis',
            'service_id.exists' => 'Le service n\'existe pas',
            'type.required' => 'Le type de chambre est requis',
            'type.in' => 'Le type doit être: standard, vip, soins_intensifs ou urgence',
            'capacite.required' => 'La capacité est requise',
            'capacite.min' => 'La capacité doit être au moins 1',
            'capacite.max' => 'La capacité ne peut pas dépasser 10',
            'tarif_journalier.required' => 'Le tarif journalier est requis',
            'tarif_journalier.min' => 'Le tarif doit être positif',
        ];
    }
}
