<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Check if admin exists
$admin = User::where('email', 'admin@hospital.com')->first();

if ($admin) {
    echo "Admin already exists!\n";
    echo "Email: admin@hospital.com\n";
    echo "Password: password\n";
} else {
    // Create admin
    $admin = User::create([
        'name' => 'Administrateur',
        'email' => 'admin@hospital.com',
        'password' => Hash::make('password'),
        'role' => 'Admin',
    ]);
    
    echo "Admin created successfully!\n";
    echo "Email: admin@hospital.com\n";
    echo "Password: password\n";
}
