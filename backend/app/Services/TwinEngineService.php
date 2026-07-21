<?php

namespace App\Services;

use App\DTO\FinancialSnapshot;
use App\DTO\ProjectionResult;
use App\DTO\ScenarioAssumptions;
use App\DTO\ScenarioProjection;
use App\Models\User;
use App\Repositories\Contracts\AccountRepositoryInterface;
use App\Repositories\Contracts\TransactionRepositoryInterface;

/**
 * The Financial Twin simulation engine.
 *
 * Runs deterministic month-by-month wealth projections under three scenarios
 * (best / expected / worst) over a 10-year horizon. The surplus each month is
 * assumed to compound at the scenario's annual return.
 */
class TwinEngineService
{
    public const HORIZON_MONTHS = 120;

    private const LOOKBACK_MONTHS = 6;

    public function __construct(
        private readonly AccountRepositoryInterface $accounts,
        private readonly TransactionRepositoryInterface $transactions,
    ) {}

    public function snapshot(User $user): FinancialSnapshot
    {
        $income = $this->transactions->averageMonthlyIncome($user->id, self::LOOKBACK_MONTHS);

        // Fall back to the declared income when transaction history is thin.
        if ($income <= 0) {
            $income = (float) $user->monthly_income;
        }

        return new FinancialSnapshot(
            netWorth: $this->accounts->netWorth($user->id),
            totalAssets: $this->accounts->totalAssets($user->id),
            totalLiabilities: $this->accounts->totalLiabilities($user->id),
            monthlyIncome: $income,
            monthlyExpense: $this->transactions->averageMonthlyExpense($user->id, self::LOOKBACK_MONTHS),
        );
    }

    public function project(User $user): ProjectionResult
    {
        $snapshot = $this->snapshot($user);

        $scenarios = [];
        foreach ($this->scenarios() as $key => $assumptions) {
            $scenarios[$key] = $this->runScenario($snapshot, $assumptions);
        }

        return new ProjectionResult($snapshot, $scenarios);
    }

    /**
     * Project with a monthly cash-flow delta and/or an immediate one-time cost —
     * the primitive the Life Decision Simulator builds on.
     */
    public function projectAdjusted(
        FinancialSnapshot $snapshot,
        float $monthlyExpenseDelta = 0.0,
        float $oneTimeCost = 0.0,
        ?int $deltaDurationMonths = null,
    ): ScenarioProjection {
        $assumptions = $this->scenarios()['expected'];

        return $this->runScenario(
            new FinancialSnapshot(
                netWorth: $snapshot->netWorth - $oneTimeCost,
                totalAssets: $snapshot->totalAssets - $oneTimeCost,
                totalLiabilities: $snapshot->totalLiabilities,
                monthlyIncome: $snapshot->monthlyIncome,
                monthlyExpense: $snapshot->monthlyExpense,
            ),
            $assumptions,
            $monthlyExpenseDelta,
            $deltaDurationMonths,
        );
    }

    /** @return array<string, ScenarioAssumptions> */
    public function scenarios(): array
    {
        return [
            'best' => new ScenarioAssumptions('best', 'Best Case', 0.08, 0.03, 0.09),
            'expected' => new ScenarioAssumptions('expected', 'Expected', 0.04, 0.05, 0.06),
            'worst' => new ScenarioAssumptions('worst', 'Worst Case', 0.00, 0.08, 0.02),
        ];
    }

    private function runScenario(
        FinancialSnapshot $snapshot,
        ScenarioAssumptions $assumptions,
        float $monthlyExpenseDelta = 0.0,
        ?int $deltaDurationMonths = null,
    ): ScenarioProjection {
        $monthlyReturn = $this->monthlyRate($assumptions->annualReturn);
        $incomeGrowth = $this->monthlyRate($assumptions->annualIncomeGrowth);
        $expenseGrowth = $this->monthlyRate($assumptions->annualExpenseGrowth);

        $wealth = $snapshot->netWorth;
        $income = $snapshot->monthlyIncome;
        $expense = $snapshot->monthlyExpense;

        $series = [[
            'month' => 0,
            'date' => now()->toDateString(),
            'value' => round($wealth, 2),
        ]];
        $horizons = [];

        for ($month = 1; $month <= self::HORIZON_MONTHS; $month++) {
            $delta = ($deltaDurationMonths === null || $month <= $deltaDurationMonths)
                ? $monthlyExpenseDelta
                : 0.0;

            $wealth = $wealth * (1 + $monthlyReturn) + ($income - $expense - $delta);
            $income *= 1 + $incomeGrowth;
            $expense *= 1 + $expenseGrowth;

            if ($month % 3 === 0) {
                $series[] = [
                    'month' => $month,
                    'date' => now()->addMonths($month)->toDateString(),
                    'value' => round($wealth, 2),
                ];
            }

            if (in_array($month, [12, 36, 60, 120], true)) {
                $horizons[($month / 12).'y'] = round($wealth, 2);
            }
        }

        return new ScenarioProjection($assumptions, $series, $horizons);
    }

    private function monthlyRate(float $annualRate): float
    {
        return (1 + $annualRate) ** (1 / 12) - 1;
    }
}
