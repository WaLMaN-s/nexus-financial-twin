"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Flag, Sparkles, Trophy } from "lucide-react";
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
import { getTimeline } from "@/lib/api";
import { formatDate, formatIDR, formatPercent } from "@/lib/format";
import type { Timeline } from "@/lib/types";

export default function TimelinePage() {
  const [timeline, setTimeline] = React.useState<Timeline | null>(null);

  React.useEffect(() => {
    getTimeline().then(setTimeline);
  }, []);

  if (!timeline) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const snapshot = timeline.present.snapshot;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>The past 12 months</CardTitle>
          <CardDescription>The history your twin learned from</CardDescription>
        </CardHeader>
        <CardContent>
          <CashFlowChart data={timeline.past.monthly_cash_flow} height={200} />
        </CardContent>
      </Card>

      {/* Present marker */}
      <div className="relative rounded-xl border-2 border-primary/50 bg-accent/40 p-5">
        <Badge className="absolute -top-2.5 left-4">Today</Badge>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <div className="text-xs text-muted-foreground">Net worth</div>
            <div className="text-xl font-semibold tabular-nums">
              {formatIDR(snapshot.net_worth, { compact: true })}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Monthly surplus</div>
            <div className="text-xl font-semibold tabular-nums">
              {formatIDR(snapshot.monthly_surplus, { compact: true })}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Savings rate</div>
            <div className="text-xl font-semibold tabular-nums">
              {formatPercent(snapshot.savings_rate, 1)}
            </div>
          </div>
        </div>
      </div>

      {/* Future milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Predicted milestones</CardTitle>
          <CardDescription>
            What your twin sees on the expected path ahead
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="relative ml-3 space-y-6 border-l pl-6">
            {timeline.future.milestones.map((milestone, i) => (
              <motion.li
                key={`${milestone.date}-${milestone.title}`}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="relative"
              >
                <span
                  className={
                    "absolute -left-[31px] flex size-5 items-center justify-center rounded-full ring-4 ring-background " +
                    (milestone.kind === "goal"
                      ? "bg-primary text-primary-foreground"
                      : "bg-[var(--chart-3)] text-white")
                  }
                >
                  {milestone.kind === "goal" ? (
                    <Trophy className="size-3" />
                  ) : (
                    <Flag className="size-3" />
                  )}
                </span>
                <div className="text-xs text-muted-foreground">
                  {formatDate(milestone.date)}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm font-medium">
                  {milestone.title}
                  {milestone.probability !== undefined && (
                    <Badge variant="secondary">
                      <Sparkles /> {formatPercent(milestone.probability)} likely
                    </Badge>
                  )}
                </div>
              </motion.li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
