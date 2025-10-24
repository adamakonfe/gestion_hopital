<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Modèle Chambre - Gestion des chambres d'hôpital
 * 
 * @property int $id
 * @property string $numero
 * @property int $service_id
 * @property string $type
 * @property int $capacite
 * @property float $tarif_journalier
 * @property bool $disponible
 * @property array $equipements
 * @property string $notes
 */
class Chambre extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero',
        'service_id',
        'type',
        'capacite',
        'tarif_journalier',
        'disponible',
        'equipements',
        'notes',
    ];

    protected $casts = [
        'disponible' => 'boolean',
        'capacite' => 'integer',
        'tarif_journalier' => 'decimal:2',
        'equipements' => 'array', // Stocké en JSON
    ];

    /**
     * Relation: Une chambre appartient à un service
     */
    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Relation: Une chambre contient plusieurs lits
     */
    public function lits()
    {
        return $this->hasMany(Lit::class);
    }

    /**
     * Scope: Chambres disponibles
     */
    public function scopeDisponibles($query)
    {
        return $query->where('disponible', true);
    }

    /**
     * Scope: Chambres par type
     */
    public function scopeParType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Accesseur: Nombre de lits disponibles dans la chambre
     */
    public function getLitsDisponiblesCountAttribute()
    {
        return $this->lits()->where('statut', 'disponible')->count();
    }

    /**
     * Accesseur: Taux d'occupation de la chambre
     */
    public function getTauxOccupationAttribute()
    {
        $total = $this->lits()->count();
        if ($total === 0) return 0;
        
        $occupes = $this->lits()->where('statut', 'occupe')->count();
        return round(($occupes / $total) * 100, 2);
    }
}
