<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validation pour la création d'un rendez-vous
 */
class StoreRendezvousRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Tous les utilisateurs authentifiés peuvent créer un RDV
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'patient_id' => 'required|exists:patients,id',
            'medecin_id' => 'required|exists:medecins,id',
            'date_heure' => 'required|date|after:now',
            'motif' => 'required|string|max:500',
            'statut' => 'sometimes|in:planifie,confirme,annule,termine',
            'notes' => 'nullable|string',
        ];
    }

    /**
     * Messages d'erreur personnalisés
     */
    public function messages(): array
    {
        return [
            'patient_id.required' => 'Le patient est requis',
            'patient_id.exists' => 'Le patient n\'existe pas',
            'medecin_id.required' => 'Le médecin est requis',
            'medecin_id.exists' => 'Le médecin n\'existe pas',
            'date_heure.required' => 'La date et l\'heure sont requises',
            'date_heure.after' => 'Le rendez-vous doit être dans le futur',
            'motif.required' => 'Le motif de consultation est requis',
            'motif.max' => 'Le motif ne doit pas dépasser 500 caractères',
            'statut.in' => 'Le statut doit être: planifié, confirmé, annulé ou terminé',
        ];
    }
}
