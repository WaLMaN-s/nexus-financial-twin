<?php

namespace App\DTO;

/**
 * The twin's current view of a user's finances — the input to every projection.
 */
final readonly class FinancialSnapshot
{
    public function __construct(
        public float $netWorth,
        public float $totalAssets,
        public float $totalLiabilities,
        public float $monthlyIncome,
        public float $monthlyExpense,
    ) {}

    public function monthlySurplus(): float
    {
        return $this->monthlyIncome - $this->monthlyExpense;
    }

    public function savingsRate(): float
    {
        return $this->monthlyIncome > 0
            ? max(0.0, $this->monthlySurplus() / $this->monthlyIncome)
            : 0.0;
    }

    public function debtRatio(): float
    {
        return $this->totalAssets > 0
            ? $this->totalLiabilities / $this->totalAssets
            : ($this->totalLiabilities > 0 ? 1.0 : 0.0);
    }

    public function toArray(): array
    {
        return [
            'net_worth' => round($this->netWorth, 2),
            'total_assets' => round($this->totalAssets, 2),
            'total_liabilities' => round($this->totalLiabilities, 2),
            'monthly_income' => round($this->monthlyIncome, 2),
            'monthly_expense' => round($this->monthlyExpense, 2),
            'monthly_surplus' => round($this->monthlySurplus(), 2),
            'savings_rate' => round($this->savingsRate(), 4),
            'debt_ratio' => round($this->debtRatio(), 4),
        ];
    }
}
