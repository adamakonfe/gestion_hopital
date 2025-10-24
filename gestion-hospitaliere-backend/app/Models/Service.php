<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Medecin;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'description',
    ];

    /**
     * Get the medecins for the service.
     */
    public function medecins()
    {
        return $this->hasMany(Medecin::class);
    }

    /**
     * Get the chambres for the service.
     */
    public function chambres()
    {
        return $this->hasMany(Chambre::class);
    }
}
