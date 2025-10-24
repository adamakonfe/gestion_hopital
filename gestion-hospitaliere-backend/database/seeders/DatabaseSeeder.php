<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Service;
use App\Models\Medecin;
use App\Models\Patient;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create services
        $service1 = Service::create([
            'nom' => 'Médecine générale',
            'description' => 'Consultations générales'
        ]);

        $service2 = Service::create([
            'nom' => 'Cardiologie',
            'description' => 'Spécialiste du cœur'
        ]);

        $service3 = Service::create([
            'nom' => 'Pédiatrie',
            'description' => 'Médecine des enfants'
        ]);

        $service4 = Service::create([
            'nom' => 'Dermatologie',
            'description' => 'Spécialiste de la peau'
        ]);

        $service5 = Service::create([
            'nom' => 'Ophtalmologie',
            'description' => 'Spécialiste des yeux'
        ]);

        // Create medecins
        $user1 = User::create([
            'name' => 'Dr. Dupont',
            'email' => 'dupont@example.com',
            'password' => Hash::make('password'),
            'role' => 'Médecin',
        ]);

        $user1->medecin()->create([
            'service_id' => $service1->id,
            'specialite' => 'Médecine générale'
        ]);

        $user2 = User::create([
            'name' => 'Dr. Martin',
            'email' => 'martin@example.com',
            'password' => Hash::make('password'),
            'role' => 'Médecin',
        ]);

        $user2->medecin()->create([
            'service_id' => $service2->id,
            'specialite' => 'Cardiologie'
        ]);

        $user3 = User::create([
            'name' => 'Dr. Petit',
            'email' => 'petit@example.com',
            'password' => Hash::make('password'),
            'role' => 'Médecin',
        ]);

        $user3->medecin()->create([
            'service_id' => $service3->id,
            'specialite' => 'Pédiatrie'
        ]);

        $user4 = User::create([
            'name' => 'Dr. Leroy',
            'email' => 'leroy@example.com',
            'password' => Hash::make('password'),
            'role' => 'Médecin',
        ]);

        $user4->medecin()->create([
            'service_id' => $service4->id,
            'specialite' => 'Dermatologie'
        ]);

        $user5 = User::create([
            'name' => 'Dr. Moreau',
            'email' => 'moreau@example.com',
            'password' => Hash::make('password'),
            'role' => 'Médecin',
        ]);

        $user5->medecin()->create([
            'service_id' => $service5->id,
            'specialite' => 'Ophtalmologie'
        ]);

        // Create a test patient if not exists
        $testPatient = User::where('email', 'patient@example.com')->first();
        if (!$testPatient) {
            $testPatient = User::create([
                'name' => 'Patient Test',
                'email' => 'patient@example.com',
                'password' => Hash::make('password'),
                'role' => 'Patient',
            ]);
            $testPatient->patient()->create([]);
        }
    }
}
