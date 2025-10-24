<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Patient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

/**
 * Tests pour l'API Patient
 * 
 * @group patient
 */
class PatientTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $admin;
    protected $medecin;
    protected $patient;

    /**
     * Setup avant chaque test
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Créer les utilisateurs de test
        $this->admin = User::factory()->create(['role' => 'Admin']);
        $this->medecin = User::factory()->create(['role' => 'Médecin']);
        $this->patient = User::factory()->create(['role' => 'Patient']);
    }

    /**
     * Test: Admin peut lister tous les patients
     */
    public function test_admin_can_list_all_patients()
    {
        // Créer des patients
        Patient::factory()->count(5)->create();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/patients');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'user',
                        'date_naissance',
                        'adresse',
                        'telephone',
                    ]
                ]
            ]);
    }

    /**
     * Test: Médecin peut lister ses patients
     */
    public function test_medecin_can_list_their_patients()
    {
        $response = $this->actingAs($this->medecin, 'sanctum')
            ->getJson('/api/patients');

        $response->assertStatus(200);
    }

    /**
     * Test: Patient ne peut pas lister les patients
     */
    public function test_patient_cannot_list_patients()
    {
        $response = $this->actingAs($this->patient, 'sanctum')
            ->getJson('/api/patients');

        $response->assertStatus(403);
    }

    /**
     * Test: Utilisateur non authentifié ne peut pas accéder
     */
    public function test_unauthenticated_user_cannot_access_patients()
    {
        $response = $this->getJson('/api/patients');

        $response->assertStatus(401);
    }

    /**
     * Test: Admin peut voir les détails d'un patient
     */
    public function test_admin_can_view_patient_details()
    {
        $patient = Patient::factory()->create();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/patients/{$patient->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $patient->id,
                ]
            ]);
    }

    /**
     * Test: Admin peut mettre à jour un patient
     */
    public function test_admin_can_update_patient()
    {
        $patient = Patient::factory()->create();

        $updateData = [
            'adresse' => '123 Nouvelle Rue',
            'telephone' => '0612345678',
            'groupe_sanguin' => 'A+',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/patients/{$patient->id}", $updateData);

        $response->assertStatus(200);

        $this->assertDatabaseHas('patients', [
            'id' => $patient->id,
            'adresse' => '123 Nouvelle Rue',
            'telephone' => '0612345678',
        ]);
    }

    /**
     * Test: Validation du numéro de téléphone
     */
    public function test_phone_number_validation()
    {
        $patient = Patient::factory()->create();

        $invalidData = [
            'telephone' => '123', // Invalide (pas 10 chiffres)
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/patients/{$patient->id}", $invalidData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['telephone']);
    }

    /**
     * Test: Validation du groupe sanguin
     */
    public function test_blood_type_validation()
    {
        $patient = Patient::factory()->create();

        $invalidData = [
            'groupe_sanguin' => 'Z+', // Invalide
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/patients/{$patient->id}", $invalidData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['groupe_sanguin']);
    }

    /**
     * Test: Admin peut supprimer un patient
     */
    public function test_admin_can_delete_patient()
    {
        $patient = Patient::factory()->create();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/patients/{$patient->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('patients', [
            'id' => $patient->id,
        ]);
    }

    /**
     * Test: Recherche de patients
     */
    public function test_can_search_patients()
    {
        $patient1 = Patient::factory()->create();
        $patient1->user->update(['name' => 'Jean Dupont']);

        $patient2 = Patient::factory()->create();
        $patient2->user->update(['name' => 'Marie Martin']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/patients?search=Jean');

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Jean Dupont']);
    }

    /**
     * Test: Pagination fonctionne
     */
    public function test_patients_are_paginated()
    {
        Patient::factory()->count(20)->create();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/patients?per_page=10');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'current_page',
                'last_page',
                'per_page',
                'total',
            ]);

        $this->assertCount(10, $response->json('data'));
    }
}
