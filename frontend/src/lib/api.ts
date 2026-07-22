/**
 * API client for the NEXUS backend.
 *
 * Every read endpoint has a demo fixture; when there is no auth token or the
 * backend is unreachable, callers receive the fixture and `isDemo()` reports
 * true, so the product remains fully explorable without infrastructure.
 */
import {
  demoAdminOverview,
  demoAdjustedProjection,
  demoDashboard,
  demoGoalForecasts,
  demoInsights,
  demoLoginHistory,
  demoProjection,
  demoSessions,
  demoSnapshot,
  demoTimeline,
  demoUser,
} from "./demo-data";
import { formatIDR } from "./format";
import type {
  AdminOverview,
  AdvisorReply,
  Dashboard,
  GoalForecast,
  InsightsPayload,
  LoginHistoryEntry,
  Projection,
  SessionInfo,
  Simulation,
  SimulationResult,
  Timeline,
  User,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";
const TOKEN_KEY = "nexus.token";

let demoMode = false;

export function isDemo(): boolean {
  return demoMode;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Device-Name": typeof navigator === "undefined" ? "web" : navigator.userAgent.includes("Mobile") ? "Mobile browser" : "Desktop browser",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(response.status, body.message ?? response.statusText, body);
  }

  return response.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

/** Read endpoint with a demo fallback. */
async function readOrDemo<T>(path: string, fixture: T): Promise<T> {
  if (!getToken()) {
    demoMode = true;
    return fixture;
  }
  try {
    const data = await request<T>(path);
    demoMode = false;
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) setToken(null);
    demoMode = true;
    return fixture;
  }
}

// ---- Auth ----

export async function login(email: string, password: string, twoFactorCode?: string) {
  return request<{ user?: User; token?: string; two_factor_required?: boolean }>(
    "/auth/login",
    { method: "POST", body: JSON.stringify({ email, password, two_factor_code: twoFactorCode }) },
  );
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  monthly_income?: number;
}) {
  return request<{ user: User; token: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logout() {
  try {
    await request("/auth/logout", { method: "POST" });
  } finally {
    setToken(null);
  }
}

export const getMe = () => readOrDemo<User>("/auth/me", demoUser);

// ---- Twin ----

export const getDashboard = () => readOrDemo<Dashboard>("/dashboard", demoDashboard);
export const getProjection = () => readOrDemo<Projection>("/twin/projection", demoProjection);
export const getTimeline = () => readOrDemo<Timeline>("/timeline", demoTimeline);
export const getInsights = () => readOrDemo<InsightsPayload>("/insights", demoInsights);
export const getGoals = () => readOrDemo<GoalForecast[]>("/goals", demoGoalForecasts);

export async function createGoal(payload: Record<string, unknown>) {
  return request("/goals", { method: "POST", body: JSON.stringify(payload) });
}

// ---- Simulator ----

export async function runSimulation(
  decisionType: string,
  title: string,
  parameters: Record<string, number>,
): Promise<Simulation> {
  if (!getToken()) {
    demoMode = true;
    return demoSimulation(decisionType, title, parameters);
  }
  try {
    const result = await request<Simulation>("/simulations", {
      method: "POST",
      body: JSON.stringify({ decision_type: decisionType, title, parameters }),
    });
    demoMode = false;
    return result;
  } catch {
    demoMode = true;
    return demoSimulation(decisionType, title, parameters);
  }
}

/** Client-side twin math, mirroring the backend engine for demo mode. */
function demoSimulation(
  decisionType: string,
  title: string,
  parameters: Record<string, number>,
): Simulation {
  const oneTime = parameters.one_time_cost ?? 0;
  let monthly = parameters.monthly_cost ?? 0;

  if (parameters.loan_principal && parameters.loan_months) {
    const rate = (parameters.loan_annual_rate ?? 0.1) / 12;
    monthly +=
      rate === 0
        ? parameters.loan_principal / parameters.loan_months
        : (parameters.loan_principal * rate) /
          (1 - Math.pow(1 + rate, -parameters.loan_months));
  }

  const before = demoAdjustedProjection(0, 0);
  const after = demoAdjustedProjection(monthly, oneTime);

  const surplus = Math.max(1, demoSnapshot.monthly_surplus);
  const burden = Math.min(1.5, monthly / surplus);
  const erosion = Math.min(1, oneTime / demoSnapshot.total_assets);
  const score = Math.round(Math.min(100, burden * 55 + erosion * 45));
  const level = score >= 70 ? "high" : score >= 40 ? "moderate" : "low";

  const result: SimulationResult = {
    before,
    after,
    impact: {
      net_worth_delta_1y: after.horizons["1y"] - before.horizons["1y"],
      net_worth_delta_5y: after.horizons["5y"] - before.horizons["5y"],
      net_worth_delta_10y: after.horizons["10y"] - before.horizons["10y"],
      monthly_cost: Math.round(monthly),
      one_time_cost: oneTime,
    },
    goal_delays: demoGoalForecasts.map((f) => ({
      goal_id: f.goal.id,
      goal_name: f.goal.name,
      delay_months: Math.max(
        0,
        Math.ceil(
          (f.goal.target_amount - f.goal.current_amount) /
            Math.max(f.goal.monthly_contribution * 0.1, f.goal.monthly_contribution - monthly),
        ) -
          Math.ceil(
            (f.goal.target_amount - f.goal.current_amount) / f.goal.monthly_contribution,
          ),
      ),
    })),
    risk: {
      score,
      level,
      summary:
        level === "high"
          ? "This decision consumes most of your free cash flow. Your twin recommends delaying or downsizing it."
          : level === "moderate"
            ? "Affordable, but it meaningfully slows your goals. Consider a larger down payment or longer runway."
            : "Comfortably within your means. The long-term impact on your wealth curve is minor.",
    },
  };

  return { id: Date.now(), decision_type: decisionType, title, parameters, result };
}

// ---- Advisor ----

export async function askAdvisor(message: string): Promise<AdvisorReply> {
  if (getToken()) {
    try {
      const reply = await request<AdvisorReply>("/advisor/ask", {
        method: "POST",
        body: JSON.stringify({ message }),
      });
      demoMode = false;
      return reply;
    } catch {
      demoMode = true;
    }
  } else {
    demoMode = true;
  }
  return demoAdvisorReply(message);
}

function demoAdvisorReply(message: string): AdvisorReply {
  const suggestions = [
    "Can I afford a Rp15,000,000 laptop?",
    "What happens if I save Rp500,000 more per month?",
    "Should I pay debt first or invest?",
  ];
  const normalized = message.toLowerCase();
  const amountMatch = normalized
    .replace(/rp|\s/g, "")
    .match(/([\d.,]+)\s*(juta|jt|million|m\b|ribu|k\b)?/);

  let amount: number | null = null;
  if (amountMatch && amountMatch[1]) {
    const unit = amountMatch[2] ?? "";
    const n = unit
      ? parseFloat(amountMatch[1].replace(",", "."))
      : parseFloat(amountMatch[1].replace(/[.,]/g, ""));
    const multiplier = /juta|jt|million|m/.test(unit) ? 1e6 : /ribu|k/.test(unit) ? 1e3 : 1;
    amount = n * multiplier >= 1000 ? n * multiplier : null;
  }

  if (/afford|beli|buy/.test(normalized) && amount) {
    const months = amount / demoSnapshot.monthly_surplus;
    const before = demoAdjustedProjection(0, 0);
    const after = demoAdjustedProjection(0, amount);
    const cost = before.horizons["5y"] - after.horizons["5y"];
    const verdict =
      months <= 3
        ? `Yes — comfortably. ${formatIDR(amount)} is about ${months.toFixed(1)} months of your surplus.`
        : months <= 8
          ? `Yes, but plan it. ${formatIDR(amount)} equals ${months.toFixed(1)} months of your current surplus — save toward it rather than draining reserves.`
          : `Not yet. ${formatIDR(amount)} is a large share of your assets. Your twin recommends building your surplus first.`;
    return {
      reply: `${verdict} Opportunity cost: spending it today lowers your projected 5-year wealth by about ${formatIDR(cost)}.`,
      suggestions,
    };
  }

  if (/save|saving|nabung/.test(normalized) && amount) {
    const boosted = demoAdjustedProjection(-amount, 0);
    const baseline = demoAdjustedProjection(0, 0);
    return {
      reply: `Saving ${formatIDR(amount)} more per month grows your projected wealth by about ${formatIDR(boosted.horizons["5y"] - baseline.horizons["5y"])} in 5 years and ${formatIDR(boosted.horizons["10y"] - baseline.horizons["10y"])} in 10 years, assuming your twin's expected scenario (6% annual return).`,
      suggestions,
    };
  }

  if (/debt|utang|hutang|invest/.test(normalized)) {
    return {
      reply:
        "Pay debt first. Your motorcycle loan costs 9.5% per year, more than the 6% your investments are expected to return — paying it down is a guaranteed 9.5% return.",
      suggestions,
    };
  }

  return {
    reply:
      "Your financial health score is 72/100 (Good). Your weakest area is Goal Progress — across 3 goals you are 51% of the way to your targets. Ask me about affordability (\"Can I afford…?\"), savings (\"What if I save…?\") or debt strategy.",
    suggestions,
  };
}

// ---- Security & admin ----

export const getSessions = () => readOrDemo<SessionInfo[]>("/security/sessions", demoSessions);
export const getLoginHistory = () =>
  readOrDemo<LoginHistoryEntry[]>("/security/login-history", demoLoginHistory);
/**
 * Admin analytics. Unlike other reads, a 403 must NOT fall back to the demo
 * fixture — a signed-in non-admin would see convincing fake platform data.
 * Returns null when the caller is authenticated but not an admin.
 */
export async function getAdminOverview(): Promise<AdminOverview | null> {
  if (!getToken()) {
    demoMode = true;
    return demoAdminOverview;
  }
  try {
    const data = await request<AdminOverview>("/admin/overview");
    demoMode = false;
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) return null;
    if (error instanceof ApiError && error.status === 401) setToken(null);
    demoMode = true;
    return demoAdminOverview;
  }
}

export async function revokeSession(id: number) {
  return request(`/security/sessions/${id}`, { method: "DELETE" });
}
