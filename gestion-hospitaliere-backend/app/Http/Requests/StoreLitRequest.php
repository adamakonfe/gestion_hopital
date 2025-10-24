<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validation pour la création d'un lit
 */
class StoreLitRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasRole(['Admin', 'Infirmier']);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'chambre_id' => 'required|exists:chambres,id',
            'numero' => 'required|string|max:10',
            'statut' => 'sometimes|in:disponible,occupe,maintenance,reserve',
            'patient_id' => 'nullable|exists:patients,id',
            'date_occupation' => 'nullable|date',
            'date_liberation_prevue' => 'nullable|date|after:date_occupation',
            'notes' => 'nullable|string',
        ];
    }

    /**
     * Messages d'erreur personnalisés
     */
    public function messages(): array
    {
        return [
            'chambre_id.required' => 'La chambre est requise',
            'chambre_id.exists' => 'La chambre n\'existe pas',
            'numero.required' => 'Le numéro de lit est requis',
            'statut.in' => 'Le statut doit être: disponible, occupé, maintenance ou réservé',
            'patient_id.exists' => 'Le patient n\'existe pas',
            'date_liberation_prevue.after' => 'La date de libération doit être après la date d\'occupation',
        ];
    }
}
