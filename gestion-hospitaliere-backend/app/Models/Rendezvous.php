<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rendezvous extends Model
{
    use HasFactory;

    /**
     * Explicit table name to avoid incorrect pluralization ("rendezvouses").
     */
    protected $table = 'rendezvous';

    protected $fillable = [
        'patient_id',
        'medecin_id',
        'date_heure',
        'statut',
        'motif',
        'notes',
    ];

    protected $casts = [
        'date_heure' => 'datetime',
    ];

    /**
     * Get the patient that owns the rendezvous.
     */
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * Get the medecin that owns the rendezvous.
     */
    public function medecin()
    {
        return $this->belongsTo(Medecin::class);
    }
}
