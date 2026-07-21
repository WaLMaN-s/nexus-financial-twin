"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyCashFlow } from "@/lib/types";
import { formatIDR, formatMonth } from "@/lib/format";
import { axisStyle, chartColors, ChartLegend, ChartTooltip } from "./chart-kit";

export function CashFlowChart({
  data,
  height = 240,
}: {
  data: MonthlyCashFlow[];
  height?: number;
}) {
  return (
    <div className="space-y-2">
      <ChartLegend
        items={[
          { label: "Income", color: chartColors.s1 },
          { label: "Expenses", color: chartColors.s2 },
        ]}
      />
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }} barGap={2}>
          <CartesianGrid stroke={chartColors.grid} strokeWidth={1} vertical={false} />
          <XAxis
            dataKey="month"
            tick={axisStyle}
            tickLine={false}
            axisLine={{ stroke: chartColors.axis }}
            tickFormatter={formatMonth}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={axisStyle}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(v: number) => formatIDR(v, { compact: true })}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.5 }}
            content={<ChartTooltip labelFormatter={formatMonth} />}
          />
          <Bar name="Income" dataKey="income" fill={chartColors.s1} radius={[4, 4, 0, 0]} maxBarSize={14} />
          <Bar name="Expenses" dataKey="expense" fill={chartColors.s2} radius={[4, 4, 0, 0]} maxBarSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
