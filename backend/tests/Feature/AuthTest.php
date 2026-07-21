<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_receives_token(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User',
            'email' => 'new@example.com',
            'password' => 'secret123',
            'monthly_income' => 10_000_000,
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['user' => ['id', 'email'], 'token']);

        $this->assertDatabaseHas('users', ['email' => 'new@example.com']);
    }

    public function test_login_returns_token_and_records_history(): void
    {
        $user = User::factory()->create(['email' => 'login@example.com']);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'login@example.com',
            'password' => 'password',
        ]);

        $response->assertOk()->assertJsonStructure(['user', 'token']);

        $this->assertDatabaseHas('login_histories', [
            'user_id' => $user->id,
            'status' => 'success',
        ]);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create(['email' => 'wrong@example.com']);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'wrong@example.com',
            'password' => 'not-the-password',
        ])->assertStatus(422);
    }

    public function test_protected_routes_reject_guests(): void
    {
        $this->getJson('/api/v1/dashboard')->assertUnauthorized();
    }
}
