<?php

namespace App\Services;

use App\Models\Simulation;
use App\Models\User;
use App\Repositories\Contracts\GoalRepositoryInterface;

/**
 * The Life Decision Simulator: replay the twin's projection with a decision
 * applied, and report the before/after difference.
 *
 * Every decision reduces to three primitives:
 *   - a one-time cost (down payment, wedding, gadget)
 *   - a recurring monthly cost (installments, childcare, lifestyle)
 *   - an optional monthly investment increase (negative cost)
 */
class DecisionSimulatorService
{
    public function __construct(
        private readonly TwinEngineService $twinEngine,
        private readonly GoalRepositoryInterface $goals,
    ) {}

    public function simulate(User $user, string $decisionType, string $title, array $params): Simulation
    {
        $snapshot = $this->twinEngine->snapshot($user);

        $oneTimeCost = (float) ($params['one_time_cost'] ?? 0);
        $monthlyCost = (float) ($params['monthly_cost'] ?? 0);
        $durationMonths = isset($params['duration_months']) ? (int) $params['duration_months'] : null;

        // Loan-style decisions: derive the installment from principal/rate/term.
        if (isset($params['loan_principal'], $params['loan_months'])) {
            $monthlyCost += $this->installment(
                (float) $params['loan_principal'],
                (float) ($params['loan_annual_rate'] ?? 0.10),
                (int) $params['loan_months'],
            );
            $durationMonths = max($durationMonths ?? 0, (int) $params['loan_months']) ?: null;
        }

        $before = $this->twinEngine->projectAdjusted($snapshot);
        $after = $this->twinEngine->projectAdjusted($snapshot, $monthlyCost, $oneTimeCost, $durationMonths);

        $result = [
            'before' => $before->toArray(),
            'after' => $after->toArray(),
            'impact' => [
                'net_worth_delta_1y' => round($after->horizons['1y'] - $before->horizons['1y'], 2),
                'net_worth_delta_5y' => round($after->horizons['5y'] - $before->horizons['5y'], 2),
                'net_worth_delta_10y' => round($after->horizons['10y'] - $before->horizons['10y'], 2),
                'monthly_cost' => round($monthlyCost, 2),
                'one_time_cost' => round($oneTimeCost, 2),
            ],
            'goal_delays' => $this->goalDelays($user, $monthlyCost),
            'risk' => $this->riskScore($snapshot->monthlyIncome, $snapshot->monthlyExpense, $monthlyCost, $oneTimeCost, $snapshot->totalAssets),
        ];

        return Simulation::create([
            'user_id' => $user->id,
            'decision_type' => $decisionType,
            'title' => $title,
            'parameters' => $params,
            'result' => $result,
        ]);
    }

    /**
     * How many months later each goal completes if the monthly surplus drops.
     */
    private function goalDelays(User $user, float $monthlyCost): array
    {
        return $this->goals->forUser($user->id)
            ->filter(fn ($goal) => $goal->status === 'active' && $goal->monthly_contribution > 0)
            ->map(function ($goal) use ($monthlyCost) {
                $remaining = max(0.0, $goal->target_amount - $goal->current_amount);
                $currentMonths = (int) ceil($remaining / $goal->monthly_contribution);

                // Assume the decision's cost is shared across goals pro-rata is
                // over-modeling; the honest simple model: contribution shrinks
                // by the decision cost, floored at 10% of the original.
                $newContribution = max($goal->monthly_contribution * 0.1, $goal->monthly_contribution - $monthlyCost);
                $newMonths = (int) ceil($remaining / $newContribution);

                return [
                    'goal_id' => $goal->id,
                    'goal_name' => $goal->name,
                    'delay_months' => max(0, $newMonths - $currentMonths),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * 0-100 risk score from payment burden and emergency-fund erosion.
     */
    private function riskScore(float $income, float $expense, float $monthlyCost, float $oneTimeCost, float $assets): array
    {
        $surplus = max(1.0, $income - $expense);
        $burden = min(1.5, $monthlyCost / $surplus);          // share of free cash flow consumed
        $erosion = $assets > 0 ? min(1.0, $oneTimeCost / $assets) : 1.0;

        $score = (int) round(min(100, $burden * 55 + $erosion * 45));

        $level = match (true) {
            $score >= 70 => 'high',
            $score >= 40 => 'moderate',
            default => 'low',
        };

        return [
            'score' => $score,
            'level' => $level,
            'payment_burden' => round($burden, 4),
            'asset_erosion' => round($erosion, 4),
            'summary' => match ($level) {
                'high' => 'This decision consumes most of your free cash flow. Your twin recommends delaying or downsizing it.',
                'moderate' => 'Affordable, but it meaningfully slows your goals. Consider a larger down payment or longer runway.',
                default => 'Comfortably within your means. The long-term impact on your wealth curve is minor.',
            },
        ];
    }

    /** Standard annuity installment. */
    private function installment(float $principal, float $annualRate, int $months): float
    {
        if ($months <= 0) {
            return 0.0;
        }

        $rate = $annualRate / 12;
        if ($rate == 0.0) {
            return $principal / $months;
        }

        return $principal * $rate / (1 - (1 + $rate) ** (-$months));
    }
}
