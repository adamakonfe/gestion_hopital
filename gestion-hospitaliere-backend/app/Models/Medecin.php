<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Service;
use App\Models\Rendezvous;
use App\Models\Prescription;

class Medecin extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'specialite',
        'service_id',
        'disponibilites',
    ];

    protected $casts = [
        'disponibilites' => 'array',
    ];

    /**
     * Get the user that owns the medecin record.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the service that the medecin belongs to.
     */
    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Get the rendezvous for the medecin.
     */
    public function rendezvous()
    {
        return $this->hasMany(Rendezvous::class);
    }

    /**
     * Get the prescriptions for the medecin.
     */
    public function prescriptions()
    {
        return $this->hasMany(Prescription::class);
    }
}
