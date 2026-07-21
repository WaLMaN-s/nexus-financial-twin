<?php

namespace App\Services;

use App\Models\User;

/**
 * The conversational layer over the twin: a deterministic intent engine that
 * answers affordability, savings and debt-vs-invest questions from the user's
 * real numbers. Deliberately rule-based — every answer is explainable and
 * reproducible from the twin's state.
 */
class AdvisorService
{
    public function __construct(
        private readonly TwinEngineService $twinEngine,
        private readonly HealthScoreService $healthScore,
    ) {}

    public function ask(User $user, string $message): array
    {
        $snapshot = $this->twinEngine->snapshot($user);
        $amount = $this->extractAmount($message);
        $normalized = mb_strtolower($message);

        $reply = match (true) {
            $this->matches($normalized, ['afford', 'beli', 'buy']) && $amount !== null
                => $this->affordability($snapshot, $amount),
            $this->matches($normalized, ['save', 'saving', 'nabung', 'menabung']) && $amount !== null
                => $this->extraSavings($snapshot, $amount),
            $this->matches($normalized, ['debt', 'utang', 'hutang', 'invest'])
                => $this->debtVersusInvest($user, $snapshot),
            default => $this->general($user, $snapshot),
        };

        return [
            'message' => $message,
            'reply' => $reply['text'],
            'data' => $reply['data'] ?? null,
            'suggestions' => [
                'Can I afford a Rp15,000,000 laptop?',
                'What happens if I save Rp500,000 more per month?',
                'Should I pay debt first or invest?',
            ],
        ];
    }

    /** True when the message contains any of the given keywords. */
    private function matches(string $message, array $keywords): bool
    {
        foreach ($keywords as $keyword) {
            if (str_contains($message, $keyword)) {
                return true;
            }
        }

        return false;
    }

    private function affordability(\App\DTO\FinancialSnapshot $snapshot, float $amount): array
    {
        $surplus = $snapshot->monthlySurplus();
        $liquidShare = $snapshot->totalAssets > 0 ? $amount / $snapshot->totalAssets : 1.0;
        $monthsOfSurplus = $surplus > 0 ? $amount / $surplus : INF;

        $projection = $this->twinEngine->projectAdjusted($snapshot, 0, $amount);
        $baseline = $this->twinEngine->projectAdjusted($snapshot);
        $fiveYearCost = $baseline->horizons['5y'] - $projection->horizons['5y'];

        if ($liquidShare < 0.1 && $monthsOfSurplus <= 3) {
            $verdict = sprintf(
                'Yes — comfortably. Rp%s is %.0f%% of your assets and about %.1f months of your surplus.',
                $this->idr($amount), $liquidShare * 100, $monthsOfSurplus,
            );
        } elseif ($liquidShare < 0.25 && $monthsOfSurplus <= 8) {
            $verdict = sprintf(
                'Yes, but plan it. Rp%s equals %.1f months of your current surplus — save toward it rather than draining reserves.',
                $this->idr($amount), $monthsOfSurplus,
            );
        } else {
            $verdict = sprintf(
                'Not yet. Rp%s is %.0f%% of your total assets. Your twin recommends building your surplus first.',
                $this->idr($amount), $liquidShare * 100,
            );
        }

        return [
            'text' => $verdict.sprintf(
                ' Opportunity cost: spending it today lowers your projected 5-year wealth by about Rp%s.',
                $this->idr($fiveYearCost),
            ),
            'data' => [
                'amount' => $amount,
                'five_year_opportunity_cost' => round($fiveYearCost, 2),
                'months_of_surplus' => is_finite($monthsOfSurplus) ? round($monthsOfSurplus, 1) : null,
            ],
        ];
    }

    private function extraSavings(\App\DTO\FinancialSnapshot $snapshot, float $amount): array
    {
        // A negative expense delta = extra monthly savings.
        $boosted = $this->twinEngine->projectAdjusted($snapshot, -$amount);
        $baseline = $this->twinEngine->projectAdjusted($snapshot);

        $delta5y = $boosted->horizons['5y'] - $baseline->horizons['5y'];
        $delta10y = $boosted->horizons['10y'] - $baseline->horizons['10y'];

        return [
            'text' => sprintf(
                'Saving Rp%s more per month grows your projected wealth by about Rp%s in 5 years '.
                'and Rp%s in 10 years, assuming your twin\'s expected scenario (6%% annual return).',
                $this->idr($amount), $this->idr($delta5y), $this->idr($delta10y),
            ),
            'data' => [
                'monthly_amount' => $amount,
                'delta_5y' => round($delta5y, 2),
                'delta_10y' => round($delta10y, 2),
                'series_before' => $baseline->series,
                'series_after' => $boosted->series,
            ],
        ];
    }

    private function debtVersusInvest(User $user, \App\DTO\FinancialSnapshot $snapshot): array
    {
        $loans = $user->accounts()->whereIn('type', ['loan', 'credit_card'])->get();
        $maxRate = (float) $loans->max('interest_rate');
        $expectedReturn = 6.0;

        if ($loans->isEmpty()) {
            return [
                'text' => 'You have no recorded debt — invest your surplus. At a 6% expected return, every Rp1,000,000 invested monthly compounds meaningfully within 5 years.',
            ];
        }

        $text = $maxRate > $expectedReturn
            ? sprintf(
                'Pay debt first. Your most expensive liability costs %.1f%% per year, more than the %.0f%% your investments are expected to return — paying it down is a guaranteed %.1f%% return.',
                $maxRate, $expectedReturn, $maxRate,
            )
            : sprintf(
                'Split it. Your debt costs at most %.1f%% per year, below the %.0f%% expected investment return — keep minimum payments and invest the rest, but hold a 3-month emergency buffer first.',
                $maxRate, $expectedReturn,
            );

        return [
            'text' => $text,
            'data' => [
                'max_debt_rate' => $maxRate,
                'expected_return' => $expectedReturn,
                'total_debt' => round($snapshot->totalLiabilities, 2),
            ],
        ];
    }

    private function general(User $user, \App\DTO\FinancialSnapshot $snapshot): array
    {
        $health = $this->healthScore->compute($user);
        $weakest = collect($health->components)->sortBy('score')->first();

        return [
            'text' => sprintf(
                'Your financial health score is %d/100 (%s). Your weakest area is %s — %s '.
                'Ask me about affordability ("Can I afford…?"), savings ("What if I save…?") or debt strategy.',
                $health->score, $health->grade, $weakest['label'], $weakest['explanation'],
            ),
            'data' => ['health_score' => $health->score, 'weakest_component' => $weakest],
        ];
    }

    /**
     * Pulls an IDR amount out of free text: "15 juta", "Rp500.000", "1,5jt", "2m".
     */
    private function extractAmount(string $message): ?float
    {
        $normalized = mb_strtolower(str_replace(['rp', ' '], '', $message));

        if (preg_match('/([\d.,]+)\s*(juta|jt|m\b|million|miliar|billion|b\b|ribu|k\b)?/u', $normalized, $matches) !== 1 || $matches[1] === '') {
            return null;
        }

        $raw = $matches[1];
        $unit = $matches[2] ?? '';

        // With a unit ("15 juta", "1,5jt") the number is a decimal; without one
        // ("15.000.000", "500,000") dots/commas are thousand separators.
        $number = $unit !== ''
            ? (float) str_replace(',', '.', $raw)
            : (float) str_replace(['.', ','], '', $raw);

        $multiplier = match (true) {
            in_array($unit, ['juta', 'jt', 'm', 'million'], true) => 1_000_000,
            in_array($unit, ['miliar', 'billion', 'b'], true) => 1_000_000_000,
            in_array($unit, ['ribu', 'k'], true) => 1_000,
            default => 1,
        };

        $amount = $number * $multiplier;

        return $amount >= 1_000 ? $amount : null;
    }

    private function idr(float $amount): string
    {
        return number_format($amount, 0, ',', '.');
    }
}
