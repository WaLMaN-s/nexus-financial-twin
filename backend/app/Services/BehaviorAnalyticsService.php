<?php

namespace App\Services;

use App\Models\BehaviorInsight;
use App\Models\User;
use App\Repositories\Contracts\TransactionRepositoryInterface;
use Illuminate\Support\Collection;

/**
 * Detects behavioral patterns in spending — the twin's "personality read".
 */
class BehaviorAnalyticsService
{
    private const IMPULSE_CATEGORIES = ['shopping', 'entertainment', 'food_delivery', 'coffee'];

    private const SUBSCRIPTION_IDLE_DAYS = 45;

    public function __construct(
        private readonly TransactionRepositoryInterface $transactions,
    ) {}

    /**
     * Re-run all detectors and persist fresh insights.
     *
     * @return Collection<int, BehaviorInsight>
     */
    public function analyze(User $user): Collection
    {
        $cashFlow = $this->transactions->monthlyCashFlow($user->id, 6);
        $byCategory = $this->transactions->expenseByCategory($user->id, 3);

        $insights = collect([
            $this->detectImpulsiveSpending($byCategory),
            $this->detectLifestyleInflation($cashFlow),
            $this->detectOverspendingTrend($cashFlow),
            $this->detectSubscriptionWaste($user),
            $this->detectConservativeSaver($cashFlow),
        ])->filter()->values();

        $user->behaviorInsights()->delete();

        return $insights->map(fn (array $insight) => BehaviorInsight::create([
            ...$insight,
            'user_id' => $user->id,
            'detected_at' => now(),
        ]));
    }

    /** Monthly expense trend by category, for the behavior trend chart. */
    public function trends(User $user): array
    {
        return [
            'monthly_cash_flow' => $this->transactions->monthlyCashFlow($user->id, 12),
            'expense_by_category' => $this->transactions->expenseByCategory($user->id, 3),
        ];
    }

    private function detectImpulsiveSpending(Collection $byCategory): ?array
    {
        $total = $byCategory->sum('total');
        if ($total <= 0) {
            return null;
        }

        $impulse = $byCategory
            ->filter(fn ($row) => in_array($row->category, self::IMPULSE_CATEGORIES, true))
            ->sum('total');
        $share = $impulse / $total;

        if ($share < 0.35) {
            return null;
        }

        return [
            'type' => 'impulsive_spender',
            'severity' => 'warning',
            'title' => 'Impulsive spending pattern',
            'body' => sprintf(
                '%.0f%% of your spending in the last 3 months went to impulse categories '.
                '(shopping, entertainment, delivery, coffee). Your twin flags anything above 35%%.',
                $share * 100,
            ),
            'data' => ['share' => round($share, 4), 'amount' => round($impulse, 2)],
        ];
    }

    private function detectLifestyleInflation(Collection $cashFlow): ?array
    {
        if ($cashFlow->count() < 6) {
            return null;
        }

        $firstHalf = $cashFlow->take(3);
        $secondHalf = $cashFlow->slice(-3);

        $incomeGrowth = $this->growth($firstHalf->avg('income'), $secondHalf->avg('income'));
        $expenseGrowth = $this->growth($firstHalf->avg('expense'), $secondHalf->avg('expense'));

        if ($expenseGrowth <= $incomeGrowth + 0.05 || $expenseGrowth <= 0) {
            return null;
        }

        return [
            'type' => 'lifestyle_inflation',
            'severity' => 'warning',
            'title' => 'Lifestyle inflation detected',
            'body' => sprintf(
                'Your spending grew %.0f%% while income grew %.0f%% over the last 6 months. '.
                'Raises are being absorbed by lifestyle, not wealth.',
                $expenseGrowth * 100,
                $incomeGrowth * 100,
            ),
            'data' => [
                'expense_growth' => round($expenseGrowth, 4),
                'income_growth' => round($incomeGrowth, 4),
            ],
        ];
    }

    private function detectOverspendingTrend(Collection $cashFlow): ?array
    {
        if ($cashFlow->count() < 3) {
            return null;
        }

        $last3 = $cashFlow->slice(-3)->values();
        $rising = $last3[2]->expense > $last3[1]->expense
            && $last3[1]->expense > $last3[0]->expense;
        $growth = $this->growth($last3[0]->expense, $last3[2]->expense);

        if (! $rising || $growth < 0.10) {
            return null;
        }

        return [
            'type' => 'overspending_trend',
            'severity' => 'critical',
            'title' => 'Overspending trend detected',
            'body' => sprintf(
                'Your monthly spending has risen three months in a row — up %.0f%% overall. '.
                'Left unchecked, this delays every goal you have.',
                $growth * 100,
            ),
            'data' => ['growth' => round($growth, 4)],
        ];
    }

    private function detectSubscriptionWaste(User $user): ?array
    {
        $idle = $user->subscriptions()
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('last_used_at')
                    ->orWhere('last_used_at', '<', now()->subDays(self::SUBSCRIPTION_IDLE_DAYS));
            })
            ->get();

        if ($idle->isEmpty()) {
            return null;
        }

        $yearlyWaste = $idle->sum(fn ($sub) => $sub->monthlyCost() * 12);

        return [
            'type' => 'subscription_waste',
            'severity' => 'warning',
            'title' => 'Subscription waste detected',
            'body' => sprintf(
                'You have %d subscriptions unused for %d+ days, costing about Rp%s per year.',
                $idle->count(),
                self::SUBSCRIPTION_IDLE_DAYS,
                number_format($yearlyWaste, 0, ',', '.'),
            ),
            'data' => [
                'count' => $idle->count(),
                'yearly_waste' => round($yearlyWaste, 2),
                'subscriptions' => $idle->pluck('name'),
            ],
        ];
    }

    private function detectConservativeSaver(Collection $cashFlow): ?array
    {
        $income = $cashFlow->sum('income');
        if ($income <= 0) {
            return null;
        }

        $rate = ($income - $cashFlow->sum('expense')) / $income;
        if ($rate < 0.30) {
            return null;
        }

        return [
            'type' => 'conservative_saver',
            'severity' => 'positive',
            'title' => 'Conservative saver',
            'body' => sprintf(
                'You consistently save %.0f%% of your income — well above the 20%% benchmark. '.
                'Your twin projects this compounds into significant long-term wealth.',
                $rate * 100,
            ),
            'data' => ['savings_rate' => round($rate, 4)],
        ];
    }

    private function growth(float $from, float $to): float
    {
        return $from > 0 ? ($to - $from) / $from : 0.0;
    }
}
