<?php

namespace App\DTO;

final readonly class ScenarioAssumptions
{
    public function __construct(
        public string $name,
        public string $label,
        public float $annualIncomeGrowth,
        public float $annualExpenseGrowth,
        public float $annualReturn,
    ) {}

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'label' => $this->label,
            'annual_income_growth' => $this->annualIncomeGrowth,
            'annual_expense_growth' => $this->annualExpenseGrowth,
            'annual_return' => $this->annualReturn,
        ];
    }
}
