<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_returns_full_overview_payload(): void
    {
        $user = User::factory()->create(['monthly_income' => 12_000_000]);
        Account::factory()->for($user)->create(['type' => 'savings', 'balance' => 30_000_000]);
        Transaction::factory()->for($user)->income()->create(['occurred_at' => now()->subMonth()]);
        Transaction::factory()->for($user)->count(5)->create();

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/dashboard')
            ->assertOk()
            ->assertJsonStructure([
                'snapshot' => ['net_worth', 'total_assets', 'savings_rate', 'debt_ratio', 'monthly_surplus'],
                'health_score' => ['score', 'grade', 'components'],
                'monthly_cash_flow',
                'expense_by_category',
                'goal_progress',
                'future_wealth' => ['expected' => ['1y', '3y', '5y', '10y'], 'series'],
            ]);
    }

    public function test_twin_projection_returns_three_scenarios(): void
    {
        $user = User::factory()->create(['monthly_income' => 12_000_000]);
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/twin/projection')
            ->assertOk()
            ->assertJsonStructure([
                'snapshot',
                'scenarios' => ['best' => ['horizons'], 'expected' => ['horizons'], 'worst' => ['horizons']],
            ]);
    }
}
