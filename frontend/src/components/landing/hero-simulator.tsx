"use client";

/**
 * The interactive hero: a live mini twin-engine. Dragging the sliders reruns
 * the projection and animates the wealth curve — the product promise in one
 * component.
 */
import * as React from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { formatIDR } from "@/lib/format";
import { axisStyle, chartColors, ChartTooltip } from "@/components/charts/chart-kit";

function simulate(monthlySaving: number, annualReturn: number) {
  const monthlyReturn = Math.pow(1 + annualReturn, 1 / 12) - 1;
  let wealth = 25_000_000;
  const series = [{ year: 0, value: wealth }];
  for (let m = 1; m <= 120; m++) {
    wealth = wealth * (1 + monthlyReturn) + monthlySaving;
    if (m % 6 === 0) series.push({ year: m / 12, value: Math.round(wealth) });
  }
  return series;
}

export function HeroSimulator() {
  const [saving, setSaving] = React.useState(2_000_000);
  const [returnPct, setReturnPct] = React.useState(7);

  const series = React.useMemo(
    () => simulate(saving, returnPct / 100),
    [saving, returnPct],
  );
  const finalValue = series[series.length - 1].value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.35 }}
      className="rounded-2xl border bg-card/80 p-5 shadow-xl shadow-indigo-500/5 backdrop-blur"
    >
      <div className="mb-1 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-muted-foreground">
            Your twin predicts · 10 years
          </div>
          <div className="text-2xl font-semibold tracking-tight tabular-nums">
            {formatIDR(finalValue, { compact: true })}
          </div>
        </div>
        <Badge variant="accent">Live simulation</Badge>
      </div>

      <ResponsiveContainer width="100%" height={190}>
        <AreaChart data={series} margin={{ top: 12, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="hero-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="year"
            tick={axisStyle}
            tickLine={false}
            axisLine={false}
            ticks={[0, 2, 4, 6, 8, 10]}
            tickFormatter={(v: number) => (v === 0 ? "Now" : `${v}y`)}
            type="number"
            domain={[0, 10]}
          />
          <YAxis hide domain={["dataMin", "auto"]} />
          <Tooltip
            content={
              <ChartTooltip
                labelFormatter={(l) =>
                  Number(l) === 0 ? "Today" : `Year ${Number(l)}`
                }
              />
            }
          />
          <Area
            name="Projected wealth"
            dataKey="value"
            stroke={chartColors.s1}
            strokeWidth={2.5}
            fill="url(#hero-fill)"
            dot={false}
            activeDot={{ r: 4 }}
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Monthly investment</span>
            <span className="font-medium tabular-nums">
              {formatIDR(saving, { compact: true })}
            </span>
          </div>
          <Slider
            value={[saving]}
            min={250_000}
            max={10_000_000}
            step={250_000}
            onValueChange={([v]) => setSaving(v)}
            aria-label="Monthly investment"
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Annual return</span>
            <span className="font-medium tabular-nums">{returnPct}%</span>
          </div>
          <Slider
            value={[returnPct]}
            min={2}
            max={12}
            step={0.5}
            onValueChange={([v]) => setReturnPct(v)}
            aria-label="Annual return"
          />
        </div>
      </div>
    </motion.div>
  );
}
