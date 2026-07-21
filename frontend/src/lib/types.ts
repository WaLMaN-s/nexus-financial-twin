export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  currency: string;
  monthly_income: number;
  occupation?: string | null;
  two_factor_enabled: boolean;
}

export interface Snapshot {
  net_worth: number;
  total_assets: number;
  total_liabilities: number;
  monthly_income: number;
  monthly_expense: number;
  monthly_surplus: number;
  savings_rate: number;
  debt_ratio: number;
}

export interface SeriesPoint {
  month: number;
  date: string;
  value: number;
}

export interface ScenarioProjection {
  assumptions: {
    name: string;
    label: string;
    annual_income_growth: number;
    annual_expense_growth: number;
    annual_return: number;
  };
  series: SeriesPoint[];
  horizons: Record<"1y" | "3y" | "5y" | "10y", number>;
}

export interface Projection {
  snapshot: Snapshot;
  scenarios: Record<"best" | "expected" | "worst", ScenarioProjection>;
}

export interface HealthComponent {
  key: string;
  label: string;
  score: number;
  weight: number;
  value: number;
  explanation: string;
}

export interface HealthScore {
  score: number;
  grade: string;
  components: HealthComponent[];
}

export interface MonthlyCashFlow {
  month: string;
  income: number;
  expense: number;
}

export interface CategorySpend {
  category: string;
  total: number;
}

export interface GoalProgress {
  id: number;
  name: string;
  icon?: string | null;
  progress: number;
  target_amount: number;
  current_amount: number;
}

export interface Dashboard {
  snapshot: Snapshot;
  health_score: HealthScore;
  monthly_cash_flow: MonthlyCashFlow[];
  expense_by_category: CategorySpend[];
  goal_progress: GoalProgress[];
  future_wealth: {
    expected: Record<string, number>;
    series: SeriesPoint[];
  };
}

export interface Insight {
  id?: number;
  type: string;
  severity: "info" | "warning" | "critical" | "positive";
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
}

export interface InsightsPayload {
  insights: Insight[];
  trends: {
    monthly_cash_flow: MonthlyCashFlow[];
    expense_by_category: CategorySpend[];
  };
}

export interface GoalForecast {
  goal: {
    id: number;
    name: string;
    type: string;
    icon?: string | null;
    target_amount: number;
    current_amount: number;
    monthly_contribution: number;
    target_date: string;
    status: string;
    progress: number;
  };
  predicted_completion_date: string | null;
  success_probability: number;
  risk_factors: string[];
}

export interface SimulationResult {
  before: ScenarioProjection;
  after: ScenarioProjection;
  impact: {
    net_worth_delta_1y: number;
    net_worth_delta_5y: number;
    net_worth_delta_10y: number;
    monthly_cost: number;
    one_time_cost: number;
  };
  goal_delays: { goal_id: number; goal_name: string; delay_months: number }[];
  risk: {
    score: number;
    level: "low" | "moderate" | "high";
    summary: string;
  };
}

export interface Simulation {
  id: number;
  decision_type: string;
  title: string;
  parameters: Record<string, number>;
  result: SimulationResult;
  created_at?: string;
}

export interface TimelineMilestone {
  kind: "wealth" | "goal";
  date: string;
  title: string;
  value?: number;
  probability?: number;
}

export interface Timeline {
  past: { monthly_cash_flow: MonthlyCashFlow[] };
  present: { date: string; snapshot: Snapshot };
  future: { milestones: TimelineMilestone[]; projection: ScenarioProjection };
}

export interface AdvisorReply {
  reply: string;
  data?: Record<string, unknown> | null;
  suggestions: string[];
}

export interface AdminOverview {
  users: {
    total_users: number;
    active_last_30d: number;
    with_2fa: number;
    signups_by_month: { month: string; count: number }[];
  };
  revenue: { plan_price: number; mrr: number; arr: number; arpu: number };
  growth: {
    new_users_this_month: number;
    new_users_last_month: number;
    mom_growth: number | null;
    simulations_run: number;
    transactions_tracked: number;
  };
  risk: {
    critical_insights: number;
    avg_health_score: number;
    failed_logins_24h: number;
    users_negative_cash_flow: number;
  };
  system: {
    database: string;
    queue_pending: number;
    app_version: string;
    checked_at: string;
  };
}

export interface SessionInfo {
  id: number;
  device: string;
  last_used_at: string | null;
  created_at: string;
  is_current: boolean;
}

export interface LoginHistoryEntry {
  id: number;
  ip_address: string;
  device: string | null;
  status: string;
  created_at: string;
}
