<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\TransactionRepositoryInterface;

/**
 * Builds the interactive financial timeline: past cash-flow history, the
 * present position, and predicted future milestones.
 */
class TimelineService
{
    private const WEALTH_MILESTONES = [
        50_000_000, 100_000_000, 250_000_000, 500_000_000, 1_000_000_000,
    ];

    public function __construct(
        private readonly TransactionRepositoryInterface $transactions,
        private readonly TwinEngineService $twinEngine,
        private readonly GoalIntelligenceService $goalIntelligence,
    ) {}

    public function build(User $user): array
    {
        $snapshot = $this->twinEngine->snapshot($user);
        $projection = $this->twinEngine->project($user);

        return [
            'past' => [
                'monthly_cash_flow' => $this->transactions->monthlyCashFlow($user->id, 12),
            ],
            'present' => [
                'date' => now()->toDateString(),
                'snapshot' => $snapshot->toArray(),
            ],
            'future' => [
                'milestones' => $this->futureMilestones($user, $projection),
                'projection' => $projection->scenarios['expected']->toArray(),
            ],
        ];
    }

    private function futureMilestones(User $user, \App\DTO\ProjectionResult $projection): array
    {
        $milestones = [];

        // Wealth thresholds crossed along the expected curve.
        $series = $projection->scenarios['expected']->series;
        $startingWealth = $projection->snapshot->netWorth;

        foreach (self::WEALTH_MILESTONES as $threshold) {
            if ($threshold <= $startingWealth) {
                continue;
            }

            foreach ($series as $point) {
                if ($point['value'] >= $threshold) {
                    $milestones[] = [
                        'kind' => 'wealth',
                        'date' => $point['date'],
                        'title' => 'Net worth crosses Rp'.number_format($threshold, 0, ',', '.'),
                        'value' => $threshold,
                    ];
                    break;
                }
            }
        }

        // Predicted goal completions.
        foreach ($this->goalIntelligence->forecastAll($user) as $forecast) {
            if ($forecast['predicted_completion_date'] !== null && $forecast['goal']['status'] === 'active') {
                $milestones[] = [
                    'kind' => 'goal',
                    'date' => $forecast['predicted_completion_date'],
                    'title' => $forecast['goal']['name'].' achieved',
                    'probability' => $forecast['success_probability'],
                ];
            }
        }

        usort($milestones, fn ($a, $b) => strcmp($a['date'], $b['date']));

        return $milestones;
    }
}
