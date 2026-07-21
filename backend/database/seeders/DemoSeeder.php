<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Goal;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Models\User;
use App\Services\BehaviorAnalyticsService;
use App\Services\HealthScoreService;
use Illuminate\Database\Seeder;

/**
 * Seeds a demo user with 12 months of realistic financial behavior so every
 * chart, insight and projection has meaningful data on first login.
 *
 * demo@nexus.app / password — regular user
 * admin@nexus.app / password — admin console
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $demo = User::factory()->create([
            'name' => 'Andi Pratama',
            'email' => 'demo@nexus.app',
            'monthly_income' => 18_000_000,
            'birth_year' => 1996,
            'occupation' => 'Product Designer',
        ]);

        User::factory()->create([
            'name' => 'NEXUS Admin',
            'email' => 'admin@nexus.app',
        ])->forceFill(['role' => 'admin'])->save();

        $this->seedAccounts($demo);
        $this->seedTransactions($demo);
        $this->seedGoals($demo);
        $this->seedSubscriptions($demo);

        app(BehaviorAnalyticsService::class)->analyze($demo);
        app(HealthScoreService::class)->computeAndStore($demo);
    }

    private function seedAccounts(User $user): void
    {
        foreach ([
            ['name' => 'BCA Payroll', 'type' => 'cash', 'balance' => 12_500_000],
            ['name' => 'Mandiri Savings', 'type' => 'savings', 'balance' => 48_000_000, 'interest_rate' => 3.5],
            ['name' => 'Bibit Index Portfolio', 'type' => 'investment', 'balance' => 65_000_000, 'interest_rate' => 7.0],
            ['name' => 'Motorcycle Loan', 'type' => 'loan', 'balance' => 14_000_000, 'interest_rate' => 9.5],
        ] as $account) {
            Account::create([...$account, 'user_id' => $user->id]);
        }
    }

    private function seedTransactions(User $user): void
    {
        $rows = [];

        for ($monthsAgo = 12; $monthsAgo >= 0; $monthsAgo--) {
            $month = now()->subMonthsNoOverflow($monthsAgo)->startOfMonth();
            // Salary with a raise 6 months ago; lifestyle creeps up faster.
            $salary = $monthsAgo > 6 ? 16_500_000 : 18_000_000;
            $creep = 1 + (12 - $monthsAgo) * 0.018;

            $rows[] = $this->row($user, 'income', 'salary', 'Monthly salary', $salary, $month->copy()->addDays(24), true);

            if ($monthsAgo % 3 === 0) {
                $rows[] = $this->row($user, 'income', 'freelance', 'Freelance project', 3_500_000, $month->copy()->addDays(14));
            }

            foreach ([
                ['housing', 'Apartment rent', 4_500_000, 1, true],
                ['utilities', 'Electricity & internet', 850_000 * $creep, 5, true],
                ['transport', 'Fuel & ride hailing', 1_100_000 * $creep, 8, false],
                ['food', 'Groceries & meals', 2_600_000 * $creep, 12, false],
                ['coffee', 'Coffee shops', 950_000 * $creep, 16, false],
                ['food_delivery', 'GoFood & GrabFood', 1_250_000 * $creep, 18, false],
                ['shopping', 'Online shopping', 1_400_000 * $creep, 20, false],
                ['entertainment', 'Streaming & outings', 750_000 * $creep, 22, false],
                ['health', 'Gym & pharmacy', 400_000, 25, false],
            ] as [$category, $description, $amount, $day, $recurring]) {
                $rows[] = $this->row($user, 'expense', $category, $description, $amount, $month->copy()->addDays($day - 1), $recurring);
            }
        }

        foreach (array_chunk($rows, 200) as $chunk) {
            Transaction::insert($chunk);
        }
    }

    private function row(User $user, string $type, string $category, string $description, float $amount, \DateTimeInterface $date, bool $recurring = false): array
    {
        return [
            'user_id' => $user->id,
            'type' => $type,
            'category' => $category,
            'description' => $description,
            'amount' => round($amount, 2),
            'occurred_at' => $date->format('Y-m-d'),
            'is_recurring' => $recurring,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    private function seedGoals(User $user): void
    {
        foreach ([
            ['name' => 'Emergency Fund', 'type' => 'emergency_fund', 'icon' => 'shield', 'target_amount' => 90_000_000, 'current_amount' => 48_000_000, 'monthly_contribution' => 2_500_000, 'target_date' => now()->addMonths(18)],
            ['name' => 'House Down Payment', 'type' => 'house', 'icon' => 'home', 'target_amount' => 250_000_000, 'current_amount' => 65_000_000, 'monthly_contribution' => 4_000_000, 'target_date' => now()->addYears(4)],
            ['name' => 'Bali Anniversary Trip', 'type' => 'vacation', 'icon' => 'plane', 'target_amount' => 25_000_000, 'current_amount' => 17_500_000, 'monthly_contribution' => 1_500_000, 'target_date' => now()->addMonths(6)],
        ] as $goal) {
            Goal::create([...$goal, 'user_id' => $user->id, 'status' => 'active']);
        }
    }

    private function seedSubscriptions(User $user): void
    {
        foreach ([
            ['name' => 'Netflix', 'category' => 'entertainment', 'amount' => 186_000, 'billing_cycle' => 'monthly', 'last_used_at' => now()->subDays(2)],
            ['name' => 'Spotify', 'category' => 'entertainment', 'amount' => 54_990, 'billing_cycle' => 'monthly', 'last_used_at' => now()->subDays(1)],
            ['name' => 'iCloud 200GB', 'category' => 'productivity', 'amount' => 49_000, 'billing_cycle' => 'monthly', 'last_used_at' => now()->subDays(3)],
            ['name' => 'Adobe Creative Cloud', 'category' => 'productivity', 'amount' => 8_268_000, 'billing_cycle' => 'yearly', 'last_used_at' => now()->subDays(80)],
            ['name' => 'Fitness+ Membership', 'category' => 'health', 'amount' => 299_000, 'billing_cycle' => 'monthly', 'last_used_at' => now()->subDays(95)],
        ] as $subscription) {
            Subscription::create([...$subscription, 'user_id' => $user->id, 'status' => 'active']);
        }
    }
}
