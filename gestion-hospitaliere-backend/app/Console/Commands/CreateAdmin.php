<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-admin {--email= : Email de l\'administrateur} {--name= : Nom de l\'administrateur}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Créer un compte administrateur';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->option('email') ?: $this->ask('Adresse email de l\'administrateur');
        $name = $this->option('name') ?: $this->ask('Nom complet de l\'administrateur');

        // Vérifier si l'utilisateur existe déjà
        $existingUser = User::where('email', $email)->first();
        if ($existingUser) {
            if ($existingUser->role === 'Admin') {
                $this->error('Cet utilisateur est déjà un administrateur.');
                return 1;
            }

            // Promouvoir l'utilisateur existant au rôle d'administrateur
            $existingUser->update(['role' => 'Admin']);
            $this->info("L'utilisateur {$email} a été promu administrateur.");
            return 0;
        }

        // Créer un nouveau mot de passe temporaire
        $password = 'Admin123!'; // Mot de passe par défaut

        // Créer le nouvel administrateur
        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'role' => 'Admin',
        ]);

        $this->info("Administrateur créé avec succès !");
        $this->info("Email: {$email}");
        $this->info("Mot de passe temporaire: {$password}");
        $this->warn("⚠️  N'oubliez pas de changer ce mot de passe après la première connexion !");

        return 0;
    }
}
