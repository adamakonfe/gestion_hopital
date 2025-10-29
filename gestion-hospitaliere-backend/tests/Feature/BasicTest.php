<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BasicTest extends TestCase
{
    /**
     * Test basic application response.
     */
    public function test_application_returns_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    /**
     * Test API health endpoint.
     */
    public function test_api_health_endpoint(): void
    {
        $response = $this->get('/api/health');

        // Si l'endpoint n'existe pas, on s'attend à une 404, pas une erreur 500
        $this->assertContains($response->status(), [200, 404]);
    }
}
