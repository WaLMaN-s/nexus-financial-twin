"use client";

import type { CategorySpend } from "@/lib/types";
import { formatIDR } from "@/lib/format";

const CATEGORY_LABELS: Record<string, string> = {
  housing: "Housing",
  food: "Food & groceries",
  shopping: "Shopping",
  food_delivery: "Food delivery",
  transport: "Transport",
  coffee: "Coffee",
  utilities: "Utilities",
  entertainment: "Entertainment",
  health: "Health",
};

/** Magnitude across categories: single-hue bar list with direct labels. */
export function CategoryBars({ data }: { data: CategorySpend[] }) {
  const max = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="space-y-2.5">
      {data.map((row) => (
        <div key={row.category} className="grid grid-cols-[7.5rem_1fr_auto] items-center gap-3 text-xs">
          <span className="truncate text-muted-foreground">
            {CATEGORY_LABELS[row.category] ?? row.category}
          </span>
          <div className="h-4 rounded-r-[4px] bg-[var(--chart-1)]/90"
            style={{ width: `${Math.max(2, (row.total / max) * 100)}%` }}
          />
          <span className="tabular-nums font-medium">
            {formatIDR(row.total, { compact: true })}
          </span>
        </div>
      ))}
    </div>
  );
}
