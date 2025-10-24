<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Modèle Lit - Gestion des lits individuels
 * 
 * @property int $id
 * @property int $chambre_id
 * @property string $numero
 * @property string $statut
 * @property int $patient_id
 * @property string $date_occupation
 * @property string $date_liberation_prevue
 * @property string $notes
 */
class Lit extends Model
{
    use HasFactory;

    protected $fillable = [
        'chambre_id',
        'numero',
        'statut',
        'patient_id',
        'date_occupation',
        'date_liberation_prevue',
        'notes',
    ];

    protected $casts = [
        'date_occupation' => 'date',
        'date_liberation_prevue' => 'date',
    ];

    /**
     * Relation: Un lit appartient à une chambre
     */
    public function chambre()
    {
        return $this->belongsTo(Chambre::class);
    }

    /**
     * Relation: Un lit peut être occupé par un patient
     */
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * Scope: Lits disponibles
     */
    public function scopeDisponibles($query)
    {
        return $query->where('statut', 'disponible');
    }

    /**
     * Scope: Lits occupés
     */
    public function scopeOccupes($query)
    {
        return $query->where('statut', 'occupe');
    }

    /**
     * Méthode: Assigner un patient au lit
     */
    public function assignerPatient($patientId, $dateLiberation = null)
    {
        $this->update([
            'patient_id' => $patientId,
            'statut' => 'occupe',
            'date_occupation' => now(),
            'date_liberation_prevue' => $dateLiberation,
        ]);
    }

    /**
     * Méthode: Libérer le lit
     */
    public function liberer()
    {
        $this->update([
            'patient_id' => null,
            'statut' => 'disponible',
            'date_occupation' => null,
            'date_liberation_prevue' => null,
        ]);
    }

    /**
     * Accesseur: Identifiant complet du lit (ex: "101-A")
     */
    public function getIdentifiantCompletAttribute()
    {
        return $this->chambre->numero . '-' . $this->numero;
    }
}
