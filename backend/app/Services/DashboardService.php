<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\TransactionRepositoryInterface;

/**
 * Aggregates the twin's state into the single dashboard payload.
 */
class DashboardService
{
    public function __construct(
        private readonly TwinEngineService $twinEngine,
        private readonly HealthScoreService $healthScore,
        private readonly TransactionRepositoryInterface $transactions,
    ) {}

    public function overview(User $user): array
    {
        $projection = $this->twinEngine->project($user);
        $health = $this->healthScore->compute($user);

        $goals = $user->goals()->where('status', '!=', 'paused')->get();

        return [
            'snapshot' => $projection->snapshot->toArray(),
            'health_score' => $health->toArray(),
            'monthly_cash_flow' => $this->transactions->monthlyCashFlow($user->id, 12),
            'expense_by_category' => $this->transactions->expenseByCategory($user->id, 3),
            'goal_progress' => $goals->map(fn ($goal) => [
                'id' => $goal->id,
                'name' => $goal->name,
                'icon' => $goal->icon,
                'progress' => round($goal->progress(), 4),
                'target_amount' => $goal->target_amount,
                'current_amount' => $goal->current_amount,
            ]),
            'future_wealth' => [
                'expected' => $projection->scenarios['expected']->horizons,
                'series' => $projection->scenarios['expected']->series,
            ],
        ];
    }
}
