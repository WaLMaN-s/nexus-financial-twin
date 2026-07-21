<?php

namespace App\Services;

use App\DTO\FinancialSnapshot;
use App\DTO\HealthScoreResult;
use App\Models\HealthScoreSnapshot;
use App\Models\User;
use App\Repositories\Contracts\GoalRepositoryInterface;

/**
 * Composite 0-100 financial health score.
 *
 * Weights: savings rate 25%, debt 20%, cash flow 20%, emergency fund 20%,
 * goal progress 15%.
 */
class HealthScoreService
{
    public function __construct(
        private readonly TwinEngineService $twinEngine,
        private readonly GoalRepositoryInterface $goals,
    ) {}

    public function compute(User $user): HealthScoreResult
    {
        $snapshot = $this->twinEngine->snapshot($user);

        $components = [
            $this->savingsComponent($snapshot),
            $this->debtComponent($snapshot),
            $this->cashFlowComponent($snapshot),
            $this->emergencyFundComponent($user, $snapshot),
            $this->goalComponent($user),
        ];

        $score = (int) round(
            array_sum(array_map(fn ($c) => $c['score'] * $c['weight'], $components))
        );
        $score = max(0, min(100, $score));

        return new HealthScoreResult($score, $this->grade($score), $components);
    }

    public function computeAndStore(User $user): HealthScoreResult
    {
        $result = $this->compute($user);

        HealthScoreSnapshot::create([
            'user_id' => $user->id,
            'score' => $result->score,
            'components' => $result->components,
            'computed_at' => now(),
        ]);

        return $result;
    }

    private function savingsComponent(FinancialSnapshot $snapshot): array
    {
        $rate = $snapshot->savingsRate();
        // 20%+ savings rate scores full marks.
        $score = (int) round(min(1.0, $rate / 0.20) * 100);

        return [
            'key' => 'savings_rate',
            'label' => 'Savings Rate',
            'score' => $score,
            'weight' => 0.25,
            'value' => round($rate, 4),
            'explanation' => sprintf(
                'You save %.1f%% of your income. A rate of 20%% or more earns a full score.',
                $rate * 100,
            ),
        ];
    }

    private function debtComponent(FinancialSnapshot $snapshot): array
    {
        $ratio = $snapshot->debtRatio();
        // 0% debt = 100; 50%+ of assets in debt = 0.
        $score = (int) round(max(0.0, 1 - $ratio / 0.5) * 100);

        return [
            'key' => 'debt_ratio',
            'label' => 'Debt Ratio',
            'score' => $score,
            'weight' => 0.20,
            'value' => round($ratio, 4),
            'explanation' => sprintf(
                'Your liabilities are %.1f%% of your assets. Keeping this under 30%% is healthy.',
                $ratio * 100,
            ),
        ];
    }

    private function cashFlowComponent(FinancialSnapshot $snapshot): array
    {
        $surplus = $snapshot->monthlySurplus();
        $target = $snapshot->monthlyIncome * 0.25;
        $score = $target > 0
            ? (int) round(max(0.0, min(1.0, $surplus / $target)) * 100)
            : 0;

        return [
            'key' => 'cash_flow',
            'label' => 'Monthly Cash Flow',
            'score' => $score,
            'weight' => 0.20,
            'value' => round($surplus, 2),
            'explanation' => $surplus >= 0
                ? 'You end the month with a positive cash flow — the raw material of wealth.'
                : 'You spend more than you earn. Reversing this is the single highest-impact move.',
        ];
    }

    private function emergencyFundComponent(User $user, FinancialSnapshot $snapshot): array
    {
        $expense = max(1.0, $snapshot->monthlyExpense);
        $liquid = $user->accounts()
            ->whereIn('type', ['cash', 'savings'])
            ->sum('balance');
        $monthsCovered = (float) $liquid / $expense;
        // 6 months of expenses = full score.
        $score = (int) round(min(1.0, $monthsCovered / 6) * 100);

        return [
            'key' => 'emergency_fund',
            'label' => 'Emergency Fund',
            'score' => $score,
            'weight' => 0.20,
            'value' => round($monthsCovered, 1),
            'explanation' => sprintf(
                'Your liquid savings cover %.1f months of expenses. Six months is the benchmark.',
                $monthsCovered,
            ),
        ];
    }

    private function goalComponent(User $user): array
    {
        $goals = $this->goals->forUser($user->id);

        if ($goals->isEmpty()) {
            return [
                'key' => 'goal_progress',
                'label' => 'Goal Progress',
                'score' => 50,
                'weight' => 0.15,
                'value' => 0.0,
                'explanation' => 'No goals yet — your twin scores this neutrally until you set one.',
            ];
        }

        $avgProgress = $goals->avg(fn ($goal) => $goal->progress());
        $score = (int) round($avgProgress * 100);

        return [
            'key' => 'goal_progress',
            'label' => 'Goal Progress',
            'score' => $score,
            'weight' => 0.15,
            'value' => round($avgProgress, 4),
            'explanation' => sprintf(
                'Across %d goals you are %.0f%% of the way to your targets.',
                $goals->count(),
                $avgProgress * 100,
            ),
        ];
    }

    private function grade(int $score): string
    {
        return match (true) {
            $score >= 85 => 'Excellent',
            $score >= 70 => 'Good',
            $score >= 50 => 'Fair',
            $score >= 30 => 'At Risk',
            default => 'Critical',
        };
    }
}
