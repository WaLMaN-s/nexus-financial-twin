<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface AccountRepositoryInterface
{
    /** @return Collection<int, \App\Models\Account> */
    public function forUser(int $userId): Collection;

    public function totalAssets(int $userId): float;

    public function totalLiabilities(int $userId): float;

    public function netWorth(int $userId): float;
}
