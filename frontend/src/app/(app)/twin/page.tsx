"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WealthChart } from "@/components/charts/wealth-chart";
import { getProjection } from "@/lib/api";
import { formatIDR, formatPercent } from "@/lib/format";
import type { Projection } from "@/lib/types";

const HORIZONS = ["1y", "3y", "5y", "10y"] as const;

export default function TwinPage() {
  const [projection, setProjection] = React.useState<Projection | null>(null);

  React.useEffect(() => {
    getProjection().then(setProjection);
  }, []);

  if (!projection) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-80" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Financial Twin Engine</CardTitle>
          <CardDescription>
            Deterministic month-by-month simulation of your wealth across three
            futures, from a net worth of{" "}
            {formatIDR(projection.snapshot.net_worth, { compact: true })} and a
            monthly surplus of{" "}
            {formatIDR(projection.snapshot.monthly_surplus, { compact: true })}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WealthChart projection={projection} height={320} />
        </CardContent>
      </Card>

      <Tabs defaultValue="expected">
        <TabsList>
          <TabsTrigger value="best">Best Case</TabsTrigger>
          <TabsTrigger value="expected">Expected</TabsTrigger>
          <TabsTrigger value="worst">Worst Case</TabsTrigger>
        </TabsList>

        {(["best", "expected", "worst"] as const).map((key) => {
          const scenario = projection.scenarios[key];
          return (
            <TabsContent key={key} value={key}>
              <Card>
                <CardHeader>
                  <CardTitle>{scenario.assumptions.label} scenario</CardTitle>
                  <CardDescription>
                    Income growth{" "}
                    {formatPercent(scenario.assumptions.annual_income_growth)} /yr
                    · expense growth{" "}
                    {formatPercent(scenario.assumptions.annual_expense_growth)} /yr
                    · investment return{" "}
                    {formatPercent(scenario.assumptions.annual_return)} /yr
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {HORIZONS.map((horizon) => {
                      const value = scenario.horizons[horizon];
                      const delta = value - projection.snapshot.net_worth;
                      return (
                        <div key={horizon} className="rounded-xl border p-4">
                          <div className="text-xs text-muted-foreground">
                            {horizon.replace("y", " year")}
                            {horizon !== "1y" && "s"} from now
                          </div>
                          <div className="mt-1 text-xl font-semibold tracking-tight tabular-nums">
                            {formatIDR(value, { compact: true })}
                          </div>
                          <div
                            className={
                              "mt-0.5 text-xs tabular-nums " +
                              (delta >= 0 ? "text-good-text" : "text-critical")
                            }
                          >
                            {delta >= 0 ? "+" : ""}
                            {formatIDR(delta, { compact: true })} vs today
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
