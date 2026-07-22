"use client";

import * as React from "react";
import {
  Activity,
  AlertTriangle,
  Database,
  ShieldAlert,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { axisStyle, chartColors } from "@/components/charts/chart-kit";
import { getAdminOverview } from "@/lib/api";
import { formatIDR, formatMonth, formatPercent } from "@/lib/format";
import type { AdminOverview } from "@/lib/types";

export default function AdminPage() {
  const [overview, setOverview] = React.useState<AdminOverview | null>(null);
  const [denied, setDenied] = React.useState(false);

  React.useEffect(() => {
    getAdminOverview().then((data) => {
      if (data) setOverview(data);
      else setDenied(true);
    });
  }, []);

  if (denied) {
    return (
      <Card className="mx-auto mt-12 max-w-md text-center">
        <CardHeader>
          <ShieldAlert className="mx-auto size-10 text-muted-foreground" />
          <CardTitle>Admin access required</CardTitle>
          <CardDescription>
            Your account does not have the admin role. Sign in with an admin
            account to view platform analytics.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!overview) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: "Total users",
      value: overview.users.total_users.toLocaleString("id-ID"),
      sub: `${overview.users.active_last_30d.toLocaleString("id-ID")} active in 30d`,
      icon: Users,
    },
    {
      label: "MRR",
      value: formatIDR(overview.revenue.mrr, { compact: true }),
      sub: `ARR ${formatIDR(overview.revenue.arr, { compact: true })} · ARPU ${formatIDR(overview.revenue.arpu, { compact: true })}`,
      icon: TrendingUp,
    },
    {
      label: "MoM growth",
      value:
        overview.growth.mom_growth !== null
          ? formatPercent(overview.growth.mom_growth, 1)
          : "—",
      sub: `${overview.growth.new_users_this_month.toLocaleString("id-ID")} new this month`,
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                {stat.label}
                <stat.icon className="size-4 text-subtle" />
              </div>
              <div className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-subtle">{stat.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Signups by month</CardTitle>
            <CardDescription>New twins created, trailing 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={overview.users.signups_by_month}
                margin={{ top: 4, right: 8, left: 8, bottom: 0 }}
              >
                <CartesianGrid stroke={chartColors.grid} strokeWidth={1} vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={axisStyle}
                  tickLine={false}
                  axisLine={{ stroke: chartColors.axis }}
                  tickFormatter={formatMonth}
                  interval="preserveStartEnd"
                />
                <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={40} />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
                        <div className="font-medium text-muted-foreground">
                          {formatMonth(String(label))}
                        </div>
                        <div className="mt-1 font-medium tabular-nums">
                          {Number(payload[0].value).toLocaleString("id-ID")} signups
                        </div>
                      </div>
                    ) : null
                  }
                />
                <Bar
                  name="Signups"
                  dataKey="count"
                  fill={chartColors.s1}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={22}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="size-4 text-serious" /> Risk monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              {(
                [
                  ["Critical insights", overview.risk.critical_insights, AlertTriangle],
                  ["Avg health score", overview.risk.avg_health_score, Activity],
                  ["Failed logins (24h)", overview.risk.failed_logins_24h, ShieldAlert],
                  ["Negative cash flow users", overview.risk.users_negative_cash_flow, Users],
                ] as const
              ).map(([label, value, Icon]) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="size-3.5 text-muted-foreground" />
                  <span className="flex-1 text-muted-foreground">{label}</span>
                  <span className="font-medium tabular-nums">
                    {typeof value === "number" ? value.toLocaleString("id-ID") : value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="size-4 text-muted-foreground" /> System health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Database</span>
                <Badge
                  variant={overview.system.database === "healthy" ? "good" : "critical"}
                >
                  {overview.system.database}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Queue backlog</span>
                <span className="font-medium tabular-nums">
                  {overview.system.queue_pending}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-mono text-xs">{overview.system.app_version}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Simulations run</span>
                <span className="font-medium tabular-nums">
                  {overview.growth.simulations_run.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Transactions tracked</span>
                <span className="font-medium tabular-nums">
                  {overview.growth.transactions_tracked.toLocaleString("id-ID")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
