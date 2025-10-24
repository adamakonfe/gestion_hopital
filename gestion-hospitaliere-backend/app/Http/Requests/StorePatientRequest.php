<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validation pour la création d'un patient
 */
class StorePatientRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Seuls les admins et médecins peuvent créer des patients
        return $this->user()->hasRole(['Admin', 'Médecin']);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'user_id' => 'required|exists:users,id',
            'date_naissance' => 'required|date|before:today',
            'adresse' => 'required|string|max:255',
            'telephone' => 'required|string|regex:/^[0-9]{10}$/',
            'groupe_sanguin' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'historique_medical' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048', // 2MB max
            'documents.*' => 'nullable|file|mimes:pdf,jpeg,png,jpg|max:5120', // 5MB max par fichier
        ];
    }

    /**
     * Messages d'erreur personnalisés
     */
    public function messages(): array
    {
        return [
            'user_id.required' => 'L\'utilisateur est requis',
            'user_id.exists' => 'L\'utilisateur n\'existe pas',
            'date_naissance.required' => 'La date de naissance est requise',
            'date_naissance.before' => 'La date de naissance doit être antérieure à aujourd\'hui',
            'telephone.regex' => 'Le numéro de téléphone doit contenir 10 chiffres',
            'groupe_sanguin.in' => 'Le groupe sanguin doit être: A+, A-, B+, B-, AB+, AB-, O+ ou O-',
            'photo.image' => 'Le fichier doit être une image',
            'photo.max' => 'La photo ne doit pas dépasser 2MB',
            'documents.*.mimes' => 'Les documents doivent être au format PDF, JPEG ou PNG',
            'documents.*.max' => 'Chaque document ne doit pas dépasser 5MB',
        ];
    }
}
