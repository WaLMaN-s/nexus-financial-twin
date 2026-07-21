<?php

namespace App\Services\Admin;

use App\Models\BehaviorInsight;
use App\Models\HealthScoreSnapshot;
use App\Models\LoginHistory;
use App\Models\Simulation;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Platform-level analytics for the admin console.
 */
class AdminAnalyticsService
{
    /** Assumed premium plan price for revenue modeling (IDR / month). */
    private const PLAN_PRICE = 49_000;

    public function userAnalytics(): array
    {
        $monthExpression = match (DB::connection()->getDriverName()) {
            'pgsql' => "to_char(created_at, 'YYYY-MM')",
            'sqlite' => "strftime('%Y-%m', created_at)",
            default => "date_format(created_at, '%Y-%m')",
        };

        $signupsByMonth = User::query()
            ->selectRaw("$monthExpression as month, count(*) as count")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return [
            'total_users' => User::count(),
            'active_last_30d' => User::where('last_active_at', '>=', now()->subDays(30))->count(),
            'with_2fa' => User::whereNotNull('two_factor_enabled_at')->count(),
            'signups_by_month' => $signupsByMonth,
        ];
    }

    public function revenueAnalytics(): array
    {
        $activeUsers = max(1, User::count());
        $mrr = $activeUsers * self::PLAN_PRICE;

        return [
            'plan_price' => self::PLAN_PRICE,
            'mrr' => $mrr,
            'arr' => $mrr * 12,
            'arpu' => self::PLAN_PRICE,
        ];
    }

    public function growthMetrics(): array
    {
        $thisMonth = User::where('created_at', '>=', now()->startOfMonth())->count();
        $lastMonth = User::whereBetween('created_at', [
            now()->subMonthNoOverflow()->startOfMonth(),
            now()->startOfMonth(),
        ])->count();

        return [
            'new_users_this_month' => $thisMonth,
            'new_users_last_month' => $lastMonth,
            'mom_growth' => $lastMonth > 0 ? round(($thisMonth - $lastMonth) / $lastMonth, 4) : null,
            'simulations_run' => Simulation::count(),
            'transactions_tracked' => Transaction::count(),
        ];
    }

    public function riskMonitoring(): array
    {
        return [
            'critical_insights' => BehaviorInsight::where('severity', 'critical')->count(),
            'avg_health_score' => round((float) HealthScoreSnapshot::query()
                ->whereIn('id', function ($query) {
                    $query->selectRaw('max(id)')
                        ->from('health_score_snapshots')
                        ->groupBy('user_id');
                })
                ->avg('score'), 1),
            'failed_logins_24h' => LoginHistory::where('status', 'failed')
                ->where('created_at', '>=', now()->subDay())
                ->count(),
            'users_negative_cash_flow' => $this->usersWithNegativeCashFlow(),
        ];
    }

    public function systemHealth(): array
    {
        $dbOk = true;
        try {
            DB::select('select 1');
        } catch (\Throwable) {
            $dbOk = false;
        }

        return [
            'database' => $dbOk ? 'healthy' : 'down',
            'queue_pending' => (int) DB::table('jobs')->count(),
            'app_version' => config('app.version', '1.0.0'),
            'checked_at' => now()->toIso8601String(),
        ];
    }

    private function usersWithNegativeCashFlow(): int
    {
        $from = now()->subMonthsNoOverflow(3)->startOfMonth()->toDateString();

        return (int) Transaction::query()
            ->where('occurred_at', '>=', $from)
            ->selectRaw("user_id")
            ->selectRaw("sum(case when type = 'income' then amount else -amount end) as net")
            ->groupBy('user_id')
            ->havingRaw("sum(case when type = 'income' then amount else -amount end) < 0")
            ->get()
            ->count();
    }
}
