<?php

namespace App\Repositories\Contracts;

use App\Models\Transaction;
use Illuminate\Support\Collection;

interface TransactionRepositoryInterface
{
    public function create(int $userId, array $attributes): Transaction;

    /** @return Collection<int, Transaction> */
    public function forUserBetween(int $userId, string $from, string $to): Collection;

    /**
     * Monthly income/expense aggregates for the trailing N months.
     *
     * @return Collection<int, object{month: string, income: float, expense: float}>
     */
    public function monthlyCashFlow(int $userId, int $months): Collection;

    /**
     * Expense totals per category for the trailing N months.
     *
     * @return Collection<int, object{category: string, total: float}>
     */
    public function expenseByCategory(int $userId, int $months): Collection;

    public function averageMonthlyIncome(int $userId, int $months): float;

    public function averageMonthlyExpense(int $userId, int $months): float;
}
