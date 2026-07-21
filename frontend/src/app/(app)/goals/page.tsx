"use client";

import * as React from "react";
import {
  AlertCircle,
  CalendarCheck,
  Home,
  Plane,
  Shield,
  Target,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { getGoals } from "@/lib/api";
import { formatDate, formatIDR, formatPercent } from "@/lib/format";
import type { GoalForecast } from "@/lib/types";

const goalIcons: Record<string, React.ElementType> = {
  shield: Shield,
  home: Home,
  plane: Plane,
};

export default function GoalsPage() {
  const [forecasts, setForecasts] = React.useState<GoalForecast[] | null>(null);

  React.useEffect(() => {
    getGoals().then(setForecasts);
  }, []);

  if (!forecasts) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Goal Intelligence</h1>
        <p className="text-sm text-muted-foreground">
          Every goal gets a predicted completion date and a probability of
          success, recomputed as your behavior changes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {forecasts.map((forecast) => {
          const goal = forecast.goal;
          const Icon = goalIcons[goal.icon ?? ""] ?? Target;
          const probability = forecast.success_probability;
          const probabilityVariant =
            probability >= 0.75 ? "good" : probability >= 0.5 ? "warning" : "critical";

          return (
            <Card key={goal.id} className="flex flex-col">
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="size-5" />
                </div>
                <div>
                  <CardTitle>{goal.name}</CardTitle>
                  <div className="text-xs text-muted-foreground">
                    Target {formatDate(goal.target_date)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <div>
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <span className="text-xl font-semibold tabular-nums">
                      {formatIDR(goal.current_amount, { compact: true })}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      of {formatIDR(goal.target_amount, { compact: true })}
                    </span>
                  </div>
                  <Progress value={goal.progress * 100} />
                  <div className="mt-1 text-right text-xs text-muted-foreground tabular-nums">
                    {formatPercent(goal.progress)}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Success probability</span>
                    <Badge variant={probabilityVariant}>
                      {formatPercent(probability)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Predicted completion</span>
                    <span className="inline-flex items-center gap-1 font-medium">
                      <CalendarCheck className="size-3.5 text-muted-foreground" />
                      {forecast.predicted_completion_date
                        ? formatDate(forecast.predicted_completion_date)
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Monthly contribution</span>
                    <span className="font-medium tabular-nums">
                      {formatIDR(goal.monthly_contribution, { compact: true })}
                    </span>
                  </div>
                </div>

                {forecast.risk_factors.length > 0 && (
                  <div className="mt-auto rounded-lg border border-warning/40 bg-warning/10 p-3">
                    {forecast.risk_factors.map((risk) => (
                      <p key={risk} className="flex gap-2 text-xs leading-relaxed">
                        <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-serious" />
                        {risk}
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
