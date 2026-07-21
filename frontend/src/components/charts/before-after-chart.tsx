"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ScenarioProjection } from "@/lib/types";
import { formatIDR } from "@/lib/format";
import { axisStyle, chartColors, ChartLegend, ChartTooltip } from "./chart-kit";

export function BeforeAfterChart({
  before,
  after,
  height = 260,
}: {
  before: ScenarioProjection;
  after: ScenarioProjection;
  height?: number;
}) {
  const data = before.series.map((point, i) => ({
    year: point.month / 12,
    before: point.value,
    after: after.series[i]?.value,
  }));

  return (
    <div className="space-y-2">
      <ChartLegend
        items={[
          { label: "Without decision", color: chartColors.s1 },
          { label: "With decision", color: chartColors.s2 },
        ]}
      />
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
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
          <Line
            name="Without decision"
            dataKey="before"
            stroke={chartColors.s1}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            name="With decision"
            dataKey="after"
            stroke={chartColors.s2}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
