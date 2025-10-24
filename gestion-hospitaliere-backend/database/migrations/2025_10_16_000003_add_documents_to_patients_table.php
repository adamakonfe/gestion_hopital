<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Ajoute le support des documents médicaux pour les patients
     */
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->text('documents')->nullable()->after('groupe_sanguin'); // JSON: liste des fichiers uploadés
            $table->text('historique_medical')->nullable()->after('documents'); // Historique médical texte
            $table->string('photo')->nullable()->after('historique_medical'); // Photo du patient
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn(['documents', 'historique_medical', 'photo']);
        });
    }
};
