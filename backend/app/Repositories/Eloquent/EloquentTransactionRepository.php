<?php

namespace App\Repositories\Eloquent;

use App\Enums\TransactionType;
use App\Models\Transaction;
use App\Repositories\Contracts\TransactionRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class EloquentTransactionRepository implements TransactionRepositoryInterface
{
    public function create(int $userId, array $attributes): Transaction
    {
        return Transaction::create([...$attributes, 'user_id' => $userId]);
    }

    public function forUserBetween(int $userId, string $from, string $to): Collection
    {
        return Transaction::query()
            ->where('user_id', $userId)
            ->whereBetween('occurred_at', [$from, $to])
            ->orderBy('occurred_at')
            ->get();
    }

    public function monthlyCashFlow(int $userId, int $months): Collection
    {
        $from = now()->subMonthsNoOverflow($months)->startOfMonth()->toDateString();

        return Transaction::query()
            ->where('user_id', $userId)
            ->where('occurred_at', '>=', $from)
            ->selectRaw($this->monthExpression().' as month')
            ->selectRaw("sum(case when type = ? then amount else 0 end) as income", [TransactionType::Income->value])
            ->selectRaw("sum(case when type = ? then amount else 0 end) as expense", [TransactionType::Expense->value])
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn ($row) => (object) [
                'month' => $row->month,
                'income' => (float) $row->income,
                'expense' => (float) $row->expense,
            ]);
    }

    public function expenseByCategory(int $userId, int $months): Collection
    {
        $from = now()->subMonthsNoOverflow($months)->startOfMonth()->toDateString();

        return Transaction::query()
            ->where('user_id', $userId)
            ->where('type', TransactionType::Expense->value)
            ->where('occurred_at', '>=', $from)
            ->groupBy('category')
            ->orderByDesc(DB::raw('sum(amount)'))
            ->selectRaw('category, sum(amount) as total')
            ->get()
            ->map(fn ($row) => (object) [
                'category' => $row->category,
                'total' => (float) $row->total,
            ]);
    }

    public function averageMonthlyIncome(int $userId, int $months): float
    {
        return $this->averageMonthly($userId, $months, TransactionType::Income);
    }

    public function averageMonthlyExpense(int $userId, int $months): float
    {
        return $this->averageMonthly($userId, $months, TransactionType::Expense);
    }

    /** Month-bucket expression for the active SQL dialect. */
    private function monthExpression(): string
    {
        return match (DB::connection()->getDriverName()) {
            'pgsql' => "to_char(occurred_at, 'YYYY-MM')",
            'sqlite' => "strftime('%Y-%m', occurred_at)",
            default => "date_format(occurred_at, '%Y-%m')",
        };
    }

    private function averageMonthly(int $userId, int $months, TransactionType $type): float
    {
        $from = now()->subMonthsNoOverflow($months)->startOfMonth()->toDateString();

        $total = (float) Transaction::query()
            ->where('user_id', $userId)
            ->where('type', $type->value)
            ->where('occurred_at', '>=', $from)
            ->sum('amount');

        return $months > 0 ? $total / $months : 0.0;
    }
}
