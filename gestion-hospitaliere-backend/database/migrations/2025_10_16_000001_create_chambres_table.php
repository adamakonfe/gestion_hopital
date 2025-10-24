<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Table pour gérer les chambres de l'hôpital
     */
    public function up(): void
    {
        Schema::create('chambres', function (Blueprint $table) {
            $table->id();
            $table->string('numero')->unique(); // Numéro de chambre (ex: "101", "A-205")
            $table->foreignId('service_id')->constrained()->onDelete('cascade'); // Service auquel appartient la chambre
            $table->enum('type', ['standard', 'vip', 'soins_intensifs', 'urgence'])->default('standard');
            $table->integer('capacite')->default(1); // Nombre de lits maximum
            $table->decimal('tarif_journalier', 10, 2)->default(0); // Prix par jour
            $table->boolean('disponible')->default(true); // Disponibilité globale de la chambre
            $table->text('equipements')->nullable(); // JSON: climatisation, TV, salle de bain privée, etc.
            $table->text('notes')->nullable(); // Notes administratives
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chambres');
    }
};
