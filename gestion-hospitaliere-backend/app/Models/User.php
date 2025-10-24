<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Patient;
use App\Models\Medecin;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the patient record associated with the user.
     */
    public function patient()
    {
        return $this->hasOne(Patient::class);
    }

    /**
     * Get the medecin record associated with the user.
     */
    public function medecin()
    {
        return $this->hasOne(Medecin::class);
    }

    /**
     * Check if user has a specific role or one of multiple roles
     * 
     * @param string|array $roles
     * @return bool
     */
    public function hasRole($roles)
    {
        if (is_array($roles)) {
            return in_array($this->role, $roles);
        }
        return $this->role === $roles;
    }

    /**
     * Check if user is admin
     */
    public function isAdmin()
    {
        return $this->role === 'Admin';
    }

    /**
     * Check if user is medecin
     */
    public function isMedecin()
    {
        return $this->role === 'Médecin';
    }

    /**
     * Check if user is patient
     */
    public function isPatient()
    {
        return $this->role === 'Patient';
    }
}
