<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Facture extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'montant',
        'statut',
        'date',
        'fichier_pdf',
        'description',
    ];

    protected $casts = [
        'date' => 'date',
        'montant' => 'decimal:2',
    ];

    /**
     * Get the patient that owns the facture.
     */
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
