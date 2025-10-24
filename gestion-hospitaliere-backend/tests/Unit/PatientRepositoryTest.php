<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Patient;
use App\Models\User;
use App\Repositories\PatientRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PatientRepositoryTest extends TestCase
{
    use RefreshDatabase;

    protected PatientRepository $patientRepository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->patientRepository = new PatientRepository();
    }

    /** @test */
    public function it_can_create_a_patient()
    {
        $user = User::factory()->create(['role' => 'Patient']);
        
        $patientData = [
            'user_id' => $user->id,
            'date_naissance' => '1990-01-01',
            'adresse' => '123 Rue Test',
            'telephone' => '0123456789',
            'groupe_sanguin' => 'O+',
        ];

        $patient = $this->patientRepository->create($patientData);

        $this->assertInstanceOf(Patient::class, $patient);
        $this->assertEquals($user->id, $patient->user_id);
        $this->assertEquals('O+', $patient->groupe_sanguin);
    }

    /** @test */
    public function it_can_search_patients_by_name_or_email()
    {
        $user1 = User::factory()->create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'role' => 'Patient'
        ]);
        $user2 = User::factory()->create([
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'role' => 'Patient'
        ]);

        Patient::factory()->create(['user_id' => $user1->id]);
        Patient::factory()->create(['user_id' => $user2->id]);

        $results = $this->patientRepository->searchByNameOrEmail('John');
        
        $this->assertCount(1, $results);
        $this->assertEquals('John Doe', $results->first()->user->name);
    }

    /** @test */
    public function it_can_get_patients_by_blood_group()
    {
        $user1 = User::factory()->create(['role' => 'Patient']);
        $user2 = User::factory()->create(['role' => 'Patient']);
        $user3 = User::factory()->create(['role' => 'Patient']);

        Patient::factory()->create(['user_id' => $user1->id, 'groupe_sanguin' => 'A+']);
        Patient::factory()->create(['user_id' => $user2->id, 'groupe_sanguin' => 'A+']);
        Patient::factory()->create(['user_id' => $user3->id, 'groupe_sanguin' => 'O-']);

        $results = $this->patientRepository->getPatientsByBloodGroup('A+');
        
        $this->assertCount(2, $results);
        $results->each(function ($patient) {
            $this->assertEquals('A+', $patient->groupe_sanguin);
        });
    }

    /** @test */
    public function it_can_add_document_to_patient()
    {
        $user = User::factory()->create(['role' => 'Patient']);
        $patient = Patient::factory()->create(['user_id' => $user->id]);

        $updatedPatient = $this->patientRepository->addDocument(
            $patient->id,
            'test-document.pdf',
            'application/pdf',
            'documents/test-document.pdf'
        );

        $this->assertNotEmpty($updatedPatient->documents);
        $this->assertEquals('test-document.pdf', $updatedPatient->documents[0]['nom']);
    }
}
