<?php

namespace App\Services;

use App\Models\Goal;
use App\Models\User;
use App\Repositories\Contracts\GoalRepositoryInterface;
use Carbon\CarbonImmutable;

/**
 * Predicts completion dates, success probability and risk factors for goals.
 */
class GoalIntelligenceService
{
    public function __construct(
        private readonly GoalRepositoryInterface $goals,
        private readonly TwinEngineService $twinEngine,
    ) {}

    public function forecastAll(User $user): array
    {
        $snapshot = $this->twinEngine->snapshot($user);
        $surplus = $snapshot->monthlySurplus();

        return $this->goals->forUser($user->id)
            ->map(fn (Goal $goal) => $this->forecast($goal, $surplus))
            ->all();
    }

    public function forecast(Goal $goal, float $monthlySurplus): array
    {
        $remaining = max(0.0, $goal->target_amount - $goal->current_amount);
        $contribution = $goal->monthly_contribution;

        $monthsToTarget = (int) now()->startOfMonth()->diffInMonths($goal->target_date, false);

        if ($remaining <= 0.0 || $goal->status === 'achieved') {
            return $this->result($goal, now()->toDateString(), 1.0, []);
        }

        if ($contribution <= 0) {
            return $this->result($goal, null, 0.05, [
                'No monthly contribution is set — this goal will not fund itself.',
            ]);
        }

        $monthsNeeded = (int) ceil($remaining / $contribution);
        $completionDate = CarbonImmutable::now()->addMonths($monthsNeeded)->toDateString();

        $probability = $this->probability($monthsNeeded, $monthsToTarget, $contribution, $monthlySurplus);

        return $this->result($goal, $completionDate, $probability, $this->riskFactors(
            $monthsNeeded, $monthsToTarget, $contribution, $monthlySurplus,
        ));
    }

    private function probability(int $monthsNeeded, int $monthsToTarget, float $contribution, float $surplus): float
    {
        // Schedule pressure: on-track = 1, needing twice the time = 0.
        $schedule = $monthsToTarget > 0
            ? max(0.0, min(1.0, 2 - $monthsNeeded / $monthsToTarget))
            : 0.3;

        // Affordability: contribution comfortably within surplus = 1.
        $affordability = $surplus > 0
            ? max(0.1, min(1.0, $surplus / max(1.0, $contribution) / 1.2))
            : 0.1;

        return round(max(0.02, min(0.98, $schedule * 0.6 + $affordability * 0.4)), 2);
    }

    private function riskFactors(int $monthsNeeded, int $monthsToTarget, float $contribution, float $surplus): array
    {
        $factors = [];

        if ($monthsToTarget > 0 && $monthsNeeded > $monthsToTarget) {
            $factors[] = sprintf(
                'At the current pace this completes %d months after your target date.',
                $monthsNeeded - $monthsToTarget,
            );
        }

        if ($contribution > $surplus) {
            $factors[] = 'The monthly contribution exceeds your free cash flow — it is not sustainable without cuts elsewhere.';
        } elseif ($surplus > 0 && $contribution > $surplus * 0.7) {
            $factors[] = 'This goal consumes most of your monthly surplus, leaving little buffer for shocks.';
        }

        if ($monthsToTarget <= 0) {
            $factors[] = 'The target date has passed. Move the date or increase the contribution.';
        }

        return $factors;
    }

    private function result(Goal $goal, ?string $completionDate, float $probability, array $riskFactors): array
    {
        return [
            'goal' => [
                'id' => $goal->id,
                'name' => $goal->name,
                'type' => $goal->type,
                'icon' => $goal->icon,
                'target_amount' => $goal->target_amount,
                'current_amount' => $goal->current_amount,
                'monthly_contribution' => $goal->monthly_contribution,
                'target_date' => $goal->target_date->toDateString(),
                'status' => $goal->status,
                'progress' => round($goal->progress(), 4),
            ],
            'predicted_completion_date' => $completionDate,
            'success_probability' => $probability,
            'risk_factors' => $riskFactors,
        ];
    }
}
