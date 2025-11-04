<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

// Interfaces
use App\Repositories\Contracts\PatientRepositoryInterface;
use App\Repositories\Contracts\MedecinRepositoryInterface;
use App\Repositories\Contracts\RendezvousRepositoryInterface;

// Implémentations
use App\Repositories\PatientRepository;
use App\Repositories\MedecinRepository;
use App\Repositories\RendezvousRepository;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Liaison des interfaces avec leurs implémentations
        $this->app->bind(PatientRepositoryInterface::class, PatientRepository::class);
        $this->app->bind(MedecinRepositoryInterface::class, MedecinRepository::class);
        $this->app->bind(RendezvousRepositoryInterface::class, RendezvousRepository::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
