/**
 * Demo fixtures mirroring the API payloads exactly. Used when the backend is
 * unreachable or the visitor is exploring without an account, so every screen
 * renders with realistic data. Generated deterministically — no randomness.
 */
import type {
  AdminOverview,
  Dashboard,
  GoalForecast,
  HealthScore,
  InsightsPayload,
  LoginHistoryEntry,
  MonthlyCashFlow,
  Projection,
  ScenarioProjection,
  SeriesPoint,
  SessionInfo,
  Snapshot,
  Timeline,
  User,
} from "./types";

export const demoUser: User = {
  id: 1,
  name: "Andi Pratama",
  email: "demo@nexus.app",
  role: "user",
  currency: "IDR",
  monthly_income: 18_000_000,
  occupation: "Product Designer",
  two_factor_enabled: true,
};

export const demoSnapshot: Snapshot = {
  net_worth: 111_500_000,
  total_assets: 125_500_000,
  total_liabilities: 14_000_000,
  monthly_income: 19_166_000,
  monthly_expense: 14_320_000,
  monthly_surplus: 4_846_000,
  savings_rate: 0.2528,
  debt_ratio: 0.1116,
};

function project(
  name: string,
  label: string,
  incomeGrowth: number,
  expenseGrowth: number,
  annualReturn: number,
  start: number = demoSnapshot.net_worth,
  monthlyDelta = 0,
): ScenarioProjection {
  const monthly = (r: number) => Math.pow(1 + r, 1 / 12) - 1;
  const ret = monthly(annualReturn);
  const ig = monthly(incomeGrowth);
  const eg = monthly(expenseGrowth);

  let wealth = start;
  let income = demoSnapshot.monthly_income;
  let expense = demoSnapshot.monthly_expense + monthlyDelta;

  const today = new Date();
  const series: SeriesPoint[] = [
    { month: 0, date: today.toISOString().slice(0, 10), value: Math.round(wealth) },
  ];
  const horizons: Record<string, number> = {};

  for (let m = 1; m <= 120; m++) {
    wealth = wealth * (1 + ret) + (income - expense);
    income *= 1 + ig;
    expense *= 1 + eg;
    if (m % 3 === 0) {
      const d = new Date(today.getFullYear(), today.getMonth() + m, 1);
      series.push({ month: m, date: d.toISOString().slice(0, 10), value: Math.round(wealth) });
    }
    if ([12, 36, 60, 120].includes(m)) horizons[`${m / 12}y`] = Math.round(wealth);
  }

  return {
    assumptions: {
      name,
      label,
      annual_income_growth: incomeGrowth,
      annual_expense_growth: expenseGrowth,
      annual_return: annualReturn,
    },
    series,
    horizons: horizons as ScenarioProjection["horizons"],
  };
}

export const demoProjection: Projection = {
  snapshot: demoSnapshot,
  scenarios: {
    best: project("best", "Best Case", 0.08, 0.03, 0.09),
    expected: project("expected", "Expected", 0.04, 0.05, 0.06),
    worst: project("worst", "Worst Case", 0.0, 0.08, 0.02),
  },
};

export function demoAdjustedProjection(
  monthlyDelta: number,
  oneTimeCost: number,
): ScenarioProjection {
  return project(
    "expected",
    "Expected",
    0.04,
    0.05,
    0.06,
    demoSnapshot.net_worth - oneTimeCost,
    monthlyDelta,
  );
}

const cashFlowFigures: [number, number][] = [
  [16_500_000, 12_650_000], [16_500_000, 12_890_000], [20_000_000, 13_120_000],
  [16_500_000, 13_040_000], [16_500_000, 13_400_000], [20_000_000, 13_610_000],
  [18_000_000, 13_580_000], [18_000_000, 13_895_000], [21_500_000, 14_060_000],
  [18_000_000, 14_150_000], [18_000_000, 14_390_000], [21_500_000, 14_720_000],
];

export const demoCashFlow: MonthlyCashFlow[] = cashFlowFigures.map(
  ([income, expense], i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (11 - i));
    return { month: d.toISOString().slice(0, 7), income, expense };
  },
);

export const demoHealthScore: HealthScore = {
  score: 72,
  grade: "Good",
  components: [
    { key: "savings_rate", label: "Savings Rate", score: 100, weight: 0.25, value: 0.2528, explanation: "You save 25.3% of your income. A rate of 20% or more earns a full score." },
    { key: "debt_ratio", label: "Debt Ratio", score: 78, weight: 0.2, value: 0.1116, explanation: "Your liabilities are 11.2% of your assets. Keeping this under 30% is healthy." },
    { key: "cash_flow", label: "Monthly Cash Flow", score: 100, weight: 0.2, value: 4_846_000, explanation: "You end the month with a positive cash flow — the raw material of wealth." },
    { key: "emergency_fund", label: "Emergency Fund", score: 70, weight: 0.2, value: 4.2, explanation: "Your liquid savings cover 4.2 months of expenses. Six months is the benchmark." },
    { key: "goal_progress", label: "Goal Progress", score: 51, weight: 0.15, value: 0.51, explanation: "Across 3 goals you are 51% of the way to your targets." },
  ],
};

export const demoDashboard: Dashboard = {
  snapshot: demoSnapshot,
  health_score: demoHealthScore,
  monthly_cash_flow: demoCashFlow,
  expense_by_category: [
    { category: "housing", total: 13_500_000 },
    { category: "food", total: 8_450_000 },
    { category: "shopping", total: 4_690_000 },
    { category: "food_delivery", total: 4_180_000 },
    { category: "transport", total: 3_640_000 },
    { category: "coffee", total: 3_120_000 },
    { category: "utilities", total: 2_790_000 },
    { category: "entertainment", total: 2_480_000 },
  ],
  goal_progress: [
    { id: 1, name: "Emergency Fund", icon: "shield", progress: 0.533, target_amount: 90_000_000, current_amount: 48_000_000 },
    { id: 2, name: "House Down Payment", icon: "home", progress: 0.26, target_amount: 250_000_000, current_amount: 65_000_000 },
    { id: 3, name: "Bali Anniversary Trip", icon: "plane", progress: 0.7, target_amount: 25_000_000, current_amount: 17_500_000 },
  ],
  future_wealth: {
    expected: demoProjection.scenarios.expected.horizons,
    series: demoProjection.scenarios.expected.series,
  },
};

export const demoInsights: InsightsPayload = {
  insights: [
    { type: "conservative_saver", severity: "positive", title: "Conservative saver", body: "You consistently save 25% of your income — well above the 20% benchmark. Your twin projects this compounds into significant long-term wealth." },
    { type: "lifestyle_inflation", severity: "warning", title: "Lifestyle inflation detected", body: "Your spending grew 12% while income grew 9% over the last 6 months. Raises are being absorbed by lifestyle, not wealth." },
    { type: "subscription_waste", severity: "warning", title: "Subscription waste detected", body: "You have 2 subscriptions unused for 45+ days, costing about Rp11.856.000 per year.", data: { yearly_waste: 11_856_000, subscriptions: ["Adobe Creative Cloud", "Fitness+ Membership"] } },
    { type: "overspending_trend", severity: "critical", title: "Overspending trend detected", body: "Your monthly spending has risen three months in a row — up 4% overall. Left unchecked, this delays every goal you have." },
  ],
  trends: {
    monthly_cash_flow: demoCashFlow,
    expense_by_category: demoDashboard.expense_by_category,
  },
};

export const demoGoalForecasts: GoalForecast[] = [
  {
    goal: { id: 1, name: "Emergency Fund", type: "emergency_fund", icon: "shield", target_amount: 90_000_000, current_amount: 48_000_000, monthly_contribution: 2_500_000, target_date: iso(18), status: "active", progress: 0.533 },
    predicted_completion_date: iso(17),
    success_probability: 0.86,
    risk_factors: [],
  },
  {
    goal: { id: 2, name: "House Down Payment", type: "house", icon: "home", target_amount: 250_000_000, current_amount: 65_000_000, monthly_contribution: 4_000_000, target_date: iso(48), status: "active", progress: 0.26 },
    predicted_completion_date: iso(47),
    success_probability: 0.62,
    risk_factors: ["This goal consumes most of your monthly surplus, leaving little buffer for shocks."],
  },
  {
    goal: { id: 3, name: "Bali Anniversary Trip", type: "vacation", icon: "plane", target_amount: 25_000_000, current_amount: 17_500_000, monthly_contribution: 1_500_000, target_date: iso(6), status: "active", progress: 0.7 },
    predicted_completion_date: iso(5),
    success_probability: 0.94,
    risk_factors: [],
  },
];

function iso(monthsFromNow: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + monthsFromNow);
  return d.toISOString().slice(0, 10);
}

export const demoTimeline: Timeline = {
  past: { monthly_cash_flow: demoCashFlow },
  present: { date: new Date().toISOString().slice(0, 10), snapshot: demoSnapshot },
  future: {
    milestones: [
      { kind: "goal", date: iso(5), title: "Bali Anniversary Trip achieved", probability: 0.94 },
      { kind: "goal", date: iso(17), title: "Emergency Fund achieved", probability: 0.86 },
      { kind: "wealth", date: iso(26), title: "Net worth crosses Rp250.000.000", value: 250_000_000 },
      { kind: "goal", date: iso(47), title: "House Down Payment achieved", probability: 0.62 },
      { kind: "wealth", date: iso(60), title: "Net worth crosses Rp500.000.000", value: 500_000_000 },
      { kind: "wealth", date: iso(112), title: "Net worth crosses Rp1.000.000.000", value: 1_000_000_000 },
    ],
    projection: demoProjection.scenarios.expected,
  },
};

export const demoAdminOverview: AdminOverview = {
  users: {
    total_users: 12_847,
    active_last_30d: 8_412,
    with_2fa: 5_206,
    signups_by_month: cashFlowFigures.map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      return { month: d.toISOString().slice(0, 7), count: 420 + i * 118 + (i % 3) * 60 };
    }),
  },
  revenue: { plan_price: 49_000, mrr: 629_503_000, arr: 7_554_036_000, arpu: 49_000 },
  growth: {
    new_users_this_month: 1_812,
    new_users_last_month: 1_540,
    mom_growth: 0.1766,
    simulations_run: 96_204,
    transactions_tracked: 4_812_930,
  },
  risk: {
    critical_insights: 214,
    avg_health_score: 66.4,
    failed_logins_24h: 37,
    users_negative_cash_flow: 1_105,
  },
  system: {
    database: "healthy",
    queue_pending: 3,
    app_version: "1.0.0",
    checked_at: new Date().toISOString(),
  },
};

export const demoSessions: SessionInfo[] = [
  { id: 1, device: "Chrome on Fedora", last_used_at: new Date().toISOString(), created_at: iso(-2), is_current: true },
  { id: 2, device: "NEXUS iOS App", last_used_at: iso(0), created_at: iso(-4), is_current: false },
  { id: 3, device: "Safari on MacBook", last_used_at: iso(-1), created_at: iso(-6), is_current: false },
];

export const demoLoginHistory: LoginHistoryEntry[] = [
  { id: 1, ip_address: "103.28.114.9", device: "Chrome on Fedora", status: "success", created_at: new Date().toISOString() },
  { id: 2, ip_address: "103.28.114.9", device: "NEXUS iOS App", status: "success", created_at: new Date(Date.now() - 864e5).toISOString() },
  { id: 3, ip_address: "45.76.112.20", device: "Unknown device", status: "failed", created_at: new Date(Date.now() - 2 * 864e5).toISOString() },
  { id: 4, ip_address: "103.28.114.9", device: "Safari on MacBook", status: "success", created_at: new Date(Date.now() - 3 * 864e5).toISOString() },
];
