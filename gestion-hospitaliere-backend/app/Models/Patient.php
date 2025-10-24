<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Rendezvous;
use App\Models\Prescription;
use App\Models\Facture;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date_naissance',
        'adresse',
        'telephone',
        'groupe_sanguin',
        'documents',
        'historique_medical',
        'photo',
    ];

    protected $casts = [
        'date_naissance' => 'date',
        'documents' => 'array', // Stocké en JSON
    ];

    /**
     * Get the user that owns the patient record.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the rendezvous for the patient.
     */
    public function rendezvous()
    {
        return $this->hasMany(Rendezvous::class);
    }

    /**
     * Get the prescriptions for the patient.
     */
    public function prescriptions()
    {
        return $this->hasMany(Prescription::class);
    }

    /**
     * Get the factures for the patient.
     */
    public function factures()
    {
        return $this->hasMany(Facture::class);
    }

    /**
     * Relation: Lit actuellement occupé par le patient
     */
    public function lit()
    {
        return $this->hasOne(Lit::class);
    }

    /**
     * Méthode: Ajouter un document médical
     */
    public function ajouterDocument($nomFichier, $typeFichier, $cheminFichier)
    {
        $documents = $this->documents ?? [];
        $documents[] = [
            'nom' => $nomFichier,
            'type' => $typeFichier,
            'chemin' => $cheminFichier,
            'date_upload' => now()->toDateTimeString(),
        ];
        $this->update(['documents' => $documents]);
    }

    /**
     * Accesseur: Âge du patient
     */
    public function getAgeAttribute()
    {
        return $this->date_naissance ? $this->date_naissance->age : null;
    }
}
