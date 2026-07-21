<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SimulationTest extends TestCase
{
    use RefreshDatabase;

    public function test_decision_simulation_returns_before_after_and_risk(): void
    {
        $user = User::factory()->create(['monthly_income' => 15_000_000]);
        Account::factory()->for($user)->create(['type' => 'savings', 'balance' => 60_000_000]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/simulations', [
            'decision_type' => 'buy_vehicle',
            'title' => 'Buy a motorcycle',
            'parameters' => [
                'one_time_cost' => 5_000_000,
                'loan_principal' => 25_000_000,
                'loan_months' => 36,
                'loan_annual_rate' => 0.095,
            ],
        ]);

        $response->assertCreated()
            ->assertJsonStructure([
                'result' => [
                    'before' => ['horizons'],
                    'after' => ['horizons'],
                    'impact' => ['net_worth_delta_5y', 'monthly_cost'],
                    'goal_delays',
                    'risk' => ['score', 'level', 'summary'],
                ],
            ]);

        $result = $response->json('result');
        $this->assertLessThan(
            $result['before']['horizons']['5y'],
            $result['after']['horizons']['5y'],
        );
    }

    public function test_admin_routes_reject_regular_users(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/v1/admin/overview')->assertForbidden();
    }
}
