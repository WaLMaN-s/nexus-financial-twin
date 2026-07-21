<?php

namespace App\Repositories\Eloquent;

use App\Enums\AccountType;
use App\Models\Account;
use App\Repositories\Contracts\AccountRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentAccountRepository implements AccountRepositoryInterface
{
    private const LIABILITY_TYPES = [AccountType::Loan, AccountType::CreditCard];

    public function forUser(int $userId): Collection
    {
        return Account::query()->where('user_id', $userId)->orderBy('name')->get();
    }

    public function totalAssets(int $userId): float
    {
        return (float) Account::query()
            ->where('user_id', $userId)
            ->whereNotIn('type', array_column(self::LIABILITY_TYPES, 'value'))
            ->sum('balance');
    }

    public function totalLiabilities(int $userId): float
    {
        return (float) Account::query()
            ->where('user_id', $userId)
            ->whereIn('type', array_column(self::LIABILITY_TYPES, 'value'))
            ->sum('balance');
    }

    public function netWorth(int $userId): float
    {
        return $this->totalAssets($userId) - $this->totalLiabilities($userId);
    }
}
