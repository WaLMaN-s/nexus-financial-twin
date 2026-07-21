"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  Scale,
  Wallet,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { CashFlowChart } from "@/components/charts/cashflow-chart";
import { CategoryBars } from "@/components/charts/category-bars";
import { HealthRing } from "@/components/charts/health-ring";
import { WealthChart } from "@/components/charts/wealth-chart";
import { getDashboard, getProjection } from "@/lib/api";
import { formatIDR, formatPercent } from "@/lib/format";
import type { Dashboard, Projection } from "@/lib/types";

export default function DashboardPage() {
  const [dashboard, setDashboard] = React.useState<Dashboard | null>(null);
  const [projection, setProjection] = React.useState<Projection | null>(null);

  React.useEffect(() => {
    getDashboard().then(setDashboard);
    getProjection().then(setProjection);
  }, []);

  if (!dashboard) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const { snapshot, health_score } = dashboard;

  const stats = [
    {
      label: "Net Worth",
      value: formatIDR(snapshot.net_worth, { compact: true }),
      icon: Wallet,
      sub: `${formatIDR(snapshot.total_assets, { compact: true })} assets · ${formatIDR(snapshot.total_liabilities, { compact: true })} debt`,
    },
    {
      label: "Monthly Cash Flow",
      value: formatIDR(snapshot.monthly_surplus, { compact: true }),
      icon: snapshot.monthly_surplus >= 0 ? ArrowUpRight : ArrowDownRight,
      positive: snapshot.monthly_surplus >= 0,
      sub: `${formatIDR(snapshot.monthly_income, { compact: true })} in · ${formatIDR(snapshot.monthly_expense, { compact: true })} out`,
    },
    {
      label: "Savings Rate",
      value: formatPercent(snapshot.savings_rate, 1),
      icon: PiggyBank,
      sub: "of income kept each month",
    },
    {
      label: "Debt Ratio",
      value: formatPercent(snapshot.debt_ratio, 1),
      icon: Scale,
      sub: "liabilities vs assets",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  {stat.label}
                  <stat.icon
                    className={
                      "size-4 " +
                      (stat.positive === undefined
                        ? "text-subtle"
                        : stat.positive
                          ? "text-good-text"
                          : "text-critical")
                    }
                  />
                </div>
                <div className="mt-1.5 text-2xl font-semibold tracking-tight">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-subtle">{stat.sub}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Future wealth */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Future Wealth Projection</CardTitle>
            <CardDescription>
              Your twin&apos;s 10-year forecast under three scenarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projection ? (
              <WealthChart projection={projection} />
            ) : (
              <Skeleton className="h-[280px]" />
            )}
            {projection && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(["1y", "3y", "5y", "10y"] as const).map((horizon) => (
                  <div key={horizon} className="rounded-lg bg-muted/60 p-3">
                    <div className="text-[11px] text-muted-foreground">
                      In {horizon.replace("y", " year")}
                      {horizon !== "1y" && "s"}
                    </div>
                    <div className="text-sm font-semibold tabular-nums">
                      {formatIDR(projection.scenarios.expected.horizons[horizon], { compact: true })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health score */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Health Score</CardTitle>
            <CardDescription>{health_score.grade}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <HealthRing score={health_score.score} label="/ 100" />
            <div className="mt-4 w-full space-y-2.5">
              {health_score.components.map((component) => (
                <div key={component.key}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">{component.label}</span>
                    <span className="font-medium tabular-nums">{component.score}</span>
                  </div>
                  <Progress value={component.score} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Cash flow */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Cash Flow</CardTitle>
            <CardDescription>Income vs expenses, last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <CashFlowChart data={dashboard.monthly_cash_flow} />
          </CardContent>
        </Card>

        {/* Goals + categories */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Goal Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5">
              {dashboard.goal_progress.map((goal) => (
                <div key={goal.id}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium">{goal.name}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {formatPercent(goal.progress)}
                    </span>
                  </div>
                  <Progress value={goal.progress * 100} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Spending</CardTitle>
              <CardDescription>Last 3 months</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryBars data={dashboard.expense_by_category.slice(0, 5)} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
