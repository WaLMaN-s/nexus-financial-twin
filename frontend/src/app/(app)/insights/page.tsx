"use client";

import * as React from "react";
import {
  AlertTriangle,
  Flame,
  Repeat,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CashFlowChart } from "@/components/charts/cashflow-chart";
import { CategoryBars } from "@/components/charts/category-bars";
import { getInsights } from "@/lib/api";
import type { InsightsPayload } from "@/lib/types";

const severityMeta = {
  positive: { badge: "good" as const, icon: ShieldCheck, label: "Strength" },
  info: { badge: "secondary" as const, icon: TrendingUp, label: "Insight" },
  warning: { badge: "warning" as const, icon: AlertTriangle, label: "Watch" },
  critical: { badge: "critical" as const, icon: Flame, label: "Act now" },
};

const typeIcons: Record<string, React.ElementType> = {
  subscription_waste: Repeat,
  lifestyle_inflation: TrendingUp,
  overspending_trend: Flame,
  conservative_saver: ShieldCheck,
  impulsive_spender: AlertTriangle,
};

export default function InsightsPage() {
  const [payload, setPayload] = React.useState<InsightsPayload | null>(null);

  React.useEffect(() => {
    getInsights().then(setPayload);
  }, []);

  if (!payload) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">
          Your twin&apos;s read on your behavior
        </h1>
        <p className="text-sm text-muted-foreground">
          Patterns detected in the last 6 months of activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {payload.insights.map((insight) => {
          const meta = severityMeta[insight.severity];
          const Icon = typeIcons[insight.type] ?? meta.icon;
          return (
            <Card key={insight.type}>
              <CardContent className="flex gap-4 p-5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{insight.title}</span>
                    <Badge variant={meta.badge}>{meta.label}</Badge>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {insight.body}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Behavior trend</CardTitle>
            <CardDescription>
              Income vs spending over 12 months — the gap is your future
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CashFlowChart data={payload.trends.monthly_cash_flow} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Where it goes</CardTitle>
            <CardDescription>Spending by category, 3 months</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryBars data={payload.trends.expense_by_category} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
