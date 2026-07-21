"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Projection } from "@/lib/types";
import { formatIDR } from "@/lib/format";
import { axisStyle, chartColors, ChartLegend, ChartTooltip } from "./chart-kit";

/** Three-scenario wealth projection: expected as filled area, best/worst as lines. */
export function WealthChart({
  projection,
  height = 280,
}: {
  projection: Projection;
  height?: number;
}) {
  const { best, expected, worst } = projection.scenarios;
  const data = expected.series.map((point, i) => ({
    month: point.month,
    year: point.month / 12,
    expected: point.value,
    best: best.series[i]?.value,
    worst: worst.series[i]?.value,
  }));

  return (
    <div className="space-y-2">
      <ChartLegend
        items={[
          { label: "Expected", color: chartColors.s1 },
          { label: "Best case", color: chartColors.s3, dashed: true },
          { label: "Worst case", color: chartColors.s2, dashed: true },
        ]}
      />
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="wealth-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={chartColors.grid} strokeWidth={1} vertical={false} />
          <XAxis
            dataKey="year"
            tick={axisStyle}
            tickLine={false}
            axisLine={{ stroke: chartColors.axis }}
            ticks={[0, 1, 3, 5, 10]}
            tickFormatter={(v: number) => (v === 0 ? "Now" : `${v}y`)}
            type="number"
            domain={[0, 10]}
          />
          <YAxis
            tick={axisStyle}
            tickLine={false}
            axisLine={false}
            width={52}
            tickFormatter={(v: number) => formatIDR(v, { compact: true })}
          />
          <Tooltip
            content={
              <ChartTooltip
                labelFormatter={(l) =>
                  Number(l) === 0 ? "Today" : `In ${Number(l).toFixed(2).replace(/\.?0+$/, "")} years`
                }
              />
            }
          />
          <Area
            name="Worst case"
            dataKey="worst"
            stroke={chartColors.s2}
            strokeWidth={2}
            strokeDasharray="4 4"
            fill="none"
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Area
            name="Best case"
            dataKey="best"
            stroke={chartColors.s3}
            strokeWidth={2}
            strokeDasharray="4 4"
            fill="none"
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Area
            name="Expected"
            dataKey="expected"
            stroke={chartColors.s1}
            strokeWidth={2.5}
            fill="url(#wealth-fill)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
