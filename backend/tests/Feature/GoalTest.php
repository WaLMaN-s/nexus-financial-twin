<?php

namespace Tests\Feature;

use App\Models\Goal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class GoalTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_a_goal(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/goals', [
            'name' => 'Emergency Fund',
            'type' => 'emergency_fund',
            'target_amount' => 60_000_000,
            'monthly_contribution' => 2_000_000,
            'target_date' => now()->addYears(2)->toDateString(),
        ])->assertCreated();

        $this->assertDatabaseHas('goals', ['name' => 'Emergency Fund']);
    }

    public function test_goal_index_returns_forecasts(): void
    {
        $user = User::factory()->create(['monthly_income' => 15_000_000]);
        Goal::factory()->for($user)->create([
            'target_amount' => 50_000_000,
            'current_amount' => 10_000_000,
            'monthly_contribution' => 2_000_000,
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/goals')
            ->assertOk()
            ->assertJsonStructure([
                ['goal' => ['id', 'name', 'progress'], 'predicted_completion_date', 'success_probability', 'risk_factors'],
            ]);
    }

    public function test_user_cannot_update_someone_elses_goal(): void
    {
        $goal = Goal::factory()->create();
        Sanctum::actingAs(User::factory()->create());

        $this->putJson("/api/v1/goals/{$goal->id}", ['name' => 'Hijacked'])
            ->assertForbidden();
    }
}
