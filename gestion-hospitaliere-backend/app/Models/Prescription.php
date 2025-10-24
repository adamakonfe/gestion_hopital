<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Patient;
use App\Models\Medecin;

class Prescription extends Model
{
    use HasFactory;

    /**
     * Explicit table name to avoid incorrect pluralization ("rendezvouses").
     */
    protected $table = 'prescriptions';

    protected $fillable = [
        'patient_id',
        'medecin_id',
        'contenu',
        'fichier_pdf',
        'date',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    /**
     * Get the patient that owns the prescription.
     */
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * Get the medecin that owns the prescription.
     */
    public function medecin()
    {
        return $this->belongsTo(Medecin::class);
    }
}
