<?php

namespace App\Providers;

use App\Repositories\Contracts\AccountRepositoryInterface;
use App\Repositories\Contracts\AuditLogRepositoryInterface;
use App\Repositories\Contracts\GoalRepositoryInterface;
use App\Repositories\Contracts\TransactionRepositoryInterface;
use App\Repositories\Eloquent\EloquentAccountRepository;
use App\Repositories\Eloquent\EloquentAuditLogRepository;
use App\Repositories\Eloquent\EloquentGoalRepository;
use App\Repositories\Eloquent\EloquentTransactionRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public array $bindings = [
        TransactionRepositoryInterface::class => EloquentTransactionRepository::class,
        AccountRepositoryInterface::class => EloquentAccountRepository::class,
        GoalRepositoryInterface::class => EloquentGoalRepository::class,
        AuditLogRepositoryInterface::class => EloquentAuditLogRepository::class,
    ];
}
