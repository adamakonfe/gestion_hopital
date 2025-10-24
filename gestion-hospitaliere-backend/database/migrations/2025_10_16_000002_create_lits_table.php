<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Table pour gérer les lits individuels dans chaque chambre
     */
    public function up(): void
    {
        Schema::create('lits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chambre_id')->constrained()->onDelete('cascade'); // Chambre à laquelle appartient le lit
            $table->string('numero'); // Numéro du lit (ex: "1", "A", "B")
            $table->enum('statut', ['disponible', 'occupe', 'maintenance', 'reserve'])->default('disponible');
            $table->foreignId('patient_id')->nullable()->constrained()->onDelete('set null'); // Patient actuellement assigné
            $table->date('date_occupation')->nullable(); // Date d'occupation
            $table->date('date_liberation_prevue')->nullable(); // Date prévue de libération
            $table->text('notes')->nullable(); // Notes sur l'état du lit ou besoins spéciaux
            $table->timestamps();
            
            // Index pour recherche rapide
            $table->index(['chambre_id', 'statut']);
            $table->unique(['chambre_id', 'numero']); // Numéro unique par chambre
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lits');
    }
};
