<?php

namespace Tests\Unit;

use App\DTO\FinancialSnapshot;
use App\Repositories\Contracts\AccountRepositoryInterface;
use App\Repositories\Contracts\TransactionRepositoryInterface;
use App\Services\TwinEngineService;
use Mockery;
use PHPUnit\Framework\TestCase;

class TwinEngineServiceTest extends TestCase
{
    private TwinEngineService $engine;

    protected function setUp(): void
    {
        parent::setUp();

        $this->engine = new TwinEngineService(
            Mockery::mock(AccountRepositoryInterface::class),
            Mockery::mock(TransactionRepositoryInterface::class),
        );
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_positive_surplus_grows_wealth_across_all_horizons(): void
    {
        $snapshot = new FinancialSnapshot(
            netWorth: 100_000_000,
            totalAssets: 110_000_000,
            totalLiabilities: 10_000_000,
            monthlyIncome: 15_000_000,
            monthlyExpense: 10_000_000,
        );

        $projection = $this->engine->projectAdjusted($snapshot);

        $this->assertGreaterThan(100_000_000, $projection->horizons['1y']);
        $this->assertGreaterThan($projection->horizons['1y'], $projection->horizons['3y']);
        $this->assertGreaterThan($projection->horizons['3y'], $projection->horizons['5y']);
        $this->assertGreaterThan($projection->horizons['5y'], $projection->horizons['10y']);
    }

    public function test_monthly_expense_delta_reduces_projected_wealth(): void
    {
        $snapshot = new FinancialSnapshot(50_000_000, 50_000_000, 0, 12_000_000, 9_000_000);

        $baseline = $this->engine->projectAdjusted($snapshot);
        $withCost = $this->engine->projectAdjusted($snapshot, monthlyExpenseDelta: 1_000_000);

        $this->assertLessThan($baseline->horizons['5y'], $withCost->horizons['5y']);
        // Roughly 60 months x 1M plus compounding lost.
        $this->assertGreaterThan(
            55_000_000,
            $baseline->horizons['5y'] - $withCost->horizons['5y'],
        );
    }

    public function test_one_time_cost_lowers_the_starting_point(): void
    {
        $snapshot = new FinancialSnapshot(80_000_000, 80_000_000, 0, 10_000_000, 8_000_000);

        $baseline = $this->engine->projectAdjusted($snapshot);
        $withPurchase = $this->engine->projectAdjusted($snapshot, oneTimeCost: 20_000_000);

        $this->assertEqualsWithDelta(
            $baseline->series[0]['value'] - 20_000_000,
            $withPurchase->series[0]['value'],
            0.01,
        );
    }

    public function test_delta_duration_limits_the_impact_window(): void
    {
        $snapshot = new FinancialSnapshot(50_000_000, 50_000_000, 0, 12_000_000, 9_000_000);

        $forever = $this->engine->projectAdjusted($snapshot, monthlyExpenseDelta: 1_000_000);
        $twoYears = $this->engine->projectAdjusted($snapshot, monthlyExpenseDelta: 1_000_000, deltaDurationMonths: 24);

        $this->assertGreaterThan($forever->horizons['10y'], $twoYears->horizons['10y']);
    }

    public function test_snapshot_derives_savings_rate_and_debt_ratio(): void
    {
        $snapshot = new FinancialSnapshot(90_000_000, 100_000_000, 10_000_000, 10_000_000, 7_500_000);

        $this->assertEqualsWithDelta(0.25, $snapshot->savingsRate(), 0.0001);
        $this->assertEqualsWithDelta(0.10, $snapshot->debtRatio(), 0.0001);
        $this->assertEqualsWithDelta(2_500_000, $snapshot->monthlySurplus(), 0.01);
    }
}
