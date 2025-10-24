<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validation pour la mise à jour d'un patient
 */
class UpdatePatientRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasRole(['Admin', 'Médecin']);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'date_naissance' => 'sometimes|date|before:today',
            'adresse' => 'sometimes|string|max:255',
            'telephone' => 'sometimes|string|regex:/^[0-9]{10}$/',
            'groupe_sanguin' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'historique_medical' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'documents.*' => 'nullable|file|mimes:pdf,jpeg,png,jpg|max:5120',
        ];
    }

    /**
     * Messages d'erreur personnalisés
     */
    public function messages(): array
    {
        return [
            'date_naissance.before' => 'La date de naissance doit être antérieure à aujourd\'hui',
            'telephone.regex' => 'Le numéro de téléphone doit contenir 10 chiffres',
            'groupe_sanguin.in' => 'Le groupe sanguin doit être: A+, A-, B+, B-, AB+, AB-, O+ ou O-',
            'photo.max' => 'La photo ne doit pas dépasser 2MB',
            'documents.*.max' => 'Chaque document ne doit pas dépasser 5MB',
        ];
    }
}
