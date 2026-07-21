"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Baby,
  Bike,
  Briefcase,
  Gem,
  HandCoins,
  Home,
  Laptop,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BeforeAfterChart } from "@/components/charts/before-after-chart";
import { runSimulation } from "@/lib/api";
import { formatIDR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Simulation } from "@/lib/types";

interface Field {
  key: string;
  label: string;
  default: number;
}

interface Decision {
  type: string;
  title: string;
  icon: React.ElementType;
  blurb: string;
  fields: Field[];
}

const decisions: Decision[] = [
  {
    type: "buy_vehicle",
    title: "Buy a motorcycle",
    icon: Bike,
    blurb: "Down payment plus a 3-year loan",
    fields: [
      { key: "one_time_cost", label: "Down payment", default: 5_000_000 },
      { key: "loan_principal", label: "Loan amount", default: 25_000_000 },
      { key: "loan_months", label: "Loan term (months)", default: 36 },
    ],
  },
  {
    type: "buy_house",
    title: "Buy a house",
    icon: Home,
    blurb: "The big one — mortgage over 15 years",
    fields: [
      { key: "one_time_cost", label: "Down payment", default: 150_000_000 },
      { key: "loan_principal", label: "Mortgage amount", default: 600_000_000 },
      { key: "loan_months", label: "Term (months)", default: 180 },
    ],
  },
  {
    type: "buy_gadget",
    title: "Buy a laptop",
    icon: Laptop,
    blurb: "One-time purchase, paid in cash",
    fields: [{ key: "one_time_cost", label: "Price", default: 15_000_000 }],
  },
  {
    type: "marriage",
    title: "Get married",
    icon: Gem,
    blurb: "Wedding cost plus shared living changes",
    fields: [
      { key: "one_time_cost", label: "Wedding cost", default: 120_000_000 },
      { key: "monthly_cost", label: "Monthly lifestyle change", default: 1_000_000 },
    ],
  },
  {
    type: "children",
    title: "Have a child",
    icon: Baby,
    blurb: "Recurring costs for the long run",
    fields: [
      { key: "one_time_cost", label: "First-year setup", default: 30_000_000 },
      { key: "monthly_cost", label: "Monthly cost", default: 3_000_000 },
    ],
  },
  {
    type: "start_business",
    title: "Start a business",
    icon: Briefcase,
    blurb: "Capital now, runway for 18 months",
    fields: [
      { key: "one_time_cost", label: "Initial capital", default: 75_000_000 },
      { key: "monthly_cost", label: "Monthly runway", default: 2_500_000 },
      { key: "duration_months", label: "Runway months", default: 18 },
    ],
  },
  {
    type: "take_loan",
    title: "Take a loan",
    icon: HandCoins,
    blurb: "Any personal loan, modeled honestly",
    fields: [
      { key: "loan_principal", label: "Loan amount", default: 50_000_000 },
      { key: "loan_months", label: "Term (months)", default: 24 },
    ],
  },
  {
    type: "invest_more",
    title: "Increase investment",
    icon: TrendingUp,
    blurb: "The one decision that runs in reverse",
    fields: [
      { key: "monthly_cost", label: "Extra monthly investment (as saving)", default: -1_000_000 },
    ],
  },
];

export default function SimulatorPage() {
  const [selected, setSelected] = React.useState<Decision>(decisions[0]);
  const [values, setValues] = React.useState<Record<string, number>>(() =>
    Object.fromEntries(decisions[0].fields.map((f) => [f.key, f.default])),
  );
  const [simulation, setSimulation] = React.useState<Simulation | null>(null);
  const [busy, setBusy] = React.useState(false);

  function pick(decision: Decision) {
    setSelected(decision);
    setValues(Object.fromEntries(decision.fields.map((f) => [f.key, f.default])));
    setSimulation(null);
  }

  async function simulate() {
    setBusy(true);
    try {
      const params: Record<string, number> = { ...values };
      if (params.loan_principal) params.loan_annual_rate = 0.1;
      setSimulation(await runSimulation(selected.type, selected.title, params));
    } finally {
      setBusy(false);
    }
  }

  const result = simulation?.result;

  return (
    <div className="space-y-4">
      {/* Decision picker */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {decisions.map((decision) => (
          <button
            key={decision.type}
            onClick={() => pick(decision)}
            className={cn(
              "rounded-xl border bg-card p-4 text-left transition-all hover:shadow-md cursor-pointer",
              selected.type === decision.type &&
                "border-primary ring-2 ring-primary/25",
            )}
          >
            <decision.icon className="mb-2 size-5 text-primary" />
            <div className="text-sm font-medium">{decision.title}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {decision.blurb}
            </div>
          </button>
        ))}
      </div>

      {/* Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>{selected.title}</CardTitle>
          <CardDescription>
            Adjust the numbers, then let your twin replay the next 10 years.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {selected.fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  type="number"
                  value={values[field.key] ?? 0}
                  onChange={(e) =>
                    setValues((v) => ({
                      ...v,
                      [field.key]: Number(e.target.value),
                    }))
                  }
                />
              </div>
            ))}
          </div>
          <Button className="mt-4" onClick={simulate} disabled={busy}>
            {busy ? "Simulating…" : "Run simulation"}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Before vs after</CardTitle>
                <CardDescription>
                  Projected net worth with and without “{simulation.title}”
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BeforeAfterChart before={result.before} after={result.after} />
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Risk assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-semibold tabular-nums">
                      {result.risk.score}
                    </span>
                    <Badge
                      variant={
                        result.risk.level === "high"
                          ? "critical"
                          : result.risk.level === "moderate"
                            ? "warning"
                            : "good"
                      }
                    >
                      {result.risk.level} risk
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {result.risk.summary}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Financial impact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {(
                    [
                      ["Monthly cost", result.impact.monthly_cost],
                      ["5-year wealth impact", result.impact.net_worth_delta_5y],
                      ["10-year wealth impact", result.impact.net_worth_delta_10y],
                    ] as const
                  ).map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-muted-foreground">{label}</span>
                      <span
                        className={cn(
                          "font-medium tabular-nums",
                          label !== "Monthly cost" &&
                            (value >= 0 ? "text-good-text" : "text-critical"),
                        )}
                      >
                        {value >= 0 && label !== "Monthly cost" ? "+" : ""}
                        {formatIDR(value, { compact: true })}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {result.goal_delays.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Goal timeline impact</CardTitle>
                <CardDescription>
                  How this decision shifts your goals
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                {result.goal_delays.map((delay) => (
                  <div key={delay.goal_id} className="rounded-lg border p-3">
                    <div className="text-sm font-medium">{delay.goal_name}</div>
                    <div
                      className={cn(
                        "mt-1 text-xs",
                        delay.delay_months > 0
                          ? "text-critical"
                          : "text-good-text",
                      )}
                    >
                      {delay.delay_months > 0
                        ? `Delayed ${delay.delay_months} month${delay.delay_months > 1 ? "s" : ""}`
                        : "No delay"}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}
