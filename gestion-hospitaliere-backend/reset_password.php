<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$email = 'elvis@gmail.com';

$user = User::where('email', $email)->first();

if ($user) {
    $user->password = Hash::make('password');
    $user->save();
    
    echo "Password reset successfully for: $email\n";
    echo "New password: password\n";
    echo "Role: {$user->role}\n";
} else {
    echo "User not found: $email\n";
}
