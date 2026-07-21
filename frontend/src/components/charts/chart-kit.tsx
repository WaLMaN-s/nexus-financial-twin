"use client";

/**
 * Shared chart primitives. All colors come from the theme's CSS variables so
 * light/dark each get their validated palette step.
 */
import { formatIDR } from "@/lib/format";

export const chartColors = {
  s1: "var(--chart-1)",
  s2: "var(--chart-2)",
  s3: "var(--chart-3)",
  s4: "var(--chart-4)",
  s5: "var(--chart-5)",
  grid: "var(--chart-grid)",
  axis: "var(--chart-axis)",
  label: "var(--chart-label)",
};

export const axisStyle = {
  fontSize: 11,
  fill: "var(--chart-label)",
  fontVariantNumeric: "tabular-nums" as const,
};

interface TooltipEntry {
  dataKey?: string | number;
  name?: string | number;
  value?: number | string;
  color?: string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  labelFormatter?: (label: string) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      {label !== undefined && (
        <div className="mb-1 font-medium text-muted-foreground">
          {labelFormatter ? labelFormatter(String(label)) : String(label)}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ background: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto pl-4 font-medium tabular-nums text-foreground">
              {formatIDR(Number(entry.value), { compact: true })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartLegend({
  items,
}: {
  items: { label: string; color: string; dashed?: boolean }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          {item.dashed ? (
            <svg width="14" height="2" className="shrink-0">
              <line
                x1="0"
                y1="1"
                x2="14"
                y2="1"
                stroke={item.color}
                strokeWidth="2"
                strokeDasharray="3 3"
              />
            </svg>
          ) : (
            <span
              className="h-0.5 w-3.5 rounded-full"
              style={{ background: item.color }}
            />
          )}
          {item.label}
        </span>
      ))}
    </div>
  );
}
