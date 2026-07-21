# NEXUS Financial Twin

**See your financial future before it happens.**

NEXUS is a Digital Financial Twin platform — not a budgeting app. Every user
owns a digital clone of their finances that continuously simulates income,
spending habits, debts, goals and life decisions to predict long-term outcomes:

> *"If you continue spending Rp50.000/day on coffee, you will spend
> Rp91.250.000 in 5 years."*

---

## Product

| Feature | What it does |
|---|---|
| **Smart Dashboard** | Net worth, savings rate, debt ratio, cash flow, health score, goal progress and a 10-year wealth projection in one screen |
| **Twin Engine** | Deterministic month-by-month simulation across best / expected / worst scenarios over 1, 3, 5 and 10-year horizons |
| **Life Decision Simulator** | Test a house, motorcycle, wedding, child, business or loan — see before/after wealth curves, goal delays and a 0–100 risk score |
| **Behavioral Analytics** | Detects lifestyle inflation, subscription waste, impulse spending, overspending trends and saver strengths |
| **AI Financial Advisor** | Conversational answers computed from your real numbers — affordability, savings scenarios, debt vs invest |
| **Financial Health Score** | Weighted 0–100 score (savings 25%, debt 20%, cash flow 20%, emergency fund 20%, goals 15%) with per-component explanations |
| **Goal Intelligence** | Predicted completion dates, success probabilities and risk factors per goal |
| **Financial Timeline** | Past cash-flow history → present position → predicted future milestones |
| **Security** | TOTP 2FA with recovery codes, device/session management, login history, audit logs, rate limiting |
| **Admin Platform** | User/revenue/growth analytics, risk monitoring, system health, platform audit logs |

## Architecture

```
├── frontend/   Next.js 15 · TypeScript · Tailwind v4 · shadcn-style UI · Framer Motion · Recharts
├── backend/    Laravel 12 · Sanctum · Service Layer · Repository Pattern · DTOs · Policies
├── docker/     Nginx · PHP-FPM · Node runtime images
└── docker-compose.yml   nginx + backend + queue + scheduler + frontend + PostgreSQL 16 + Redis 7
```

**Backend layering:** Controllers → Form Requests → Services (`TwinEngineService`,
`DecisionSimulatorService`, `BehaviorAnalyticsService`, `HealthScoreService`,
`AdvisorService`, `GoalIntelligenceService`, `TimelineService`) → Repository
interfaces (bound in `RepositoryServiceProvider`) → Eloquent. Simulation
results, projections and scores travel as immutable DTOs.

**Frontend:** every read endpoint has a demo fixture — without a backend the
whole product renders with realistic data and a "Demo data" badge, and the
simulator/advisor run a client-side mirror of the twin engine.

## Quick start

### Docker (full stack)

```bash
docker compose up -d --build
docker compose exec backend php artisan migrate --seed
```

Open **http://localhost:8080** — sign in with:

| Account | Email | Password |
|---|---|---|
| Demo user | `demo@nexus.app` | `password` |
| Admin | `admin@nexus.app` | `password` |

The demo user ships with 13 months of realistic transactions, 4 accounts,
3 goals and 5 subscriptions (two idle — the twin notices).

### Local development

```bash
# Backend (uses SQLite out of the box)
cd backend
composer install
cp .env.example .env            # set DB_CONNECTION=sqlite for zero-config local dev
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8000

# Frontend
cd frontend
npm install
npm run dev                     # proxies /api → localhost:8000
```

Open **http://localhost:3000**.

## API documentation

OpenAPI 3.1 spec: [`backend/public/docs/openapi.yaml`](backend/public/docs/openapi.yaml)
· Swagger UI served at **`/docs`**.

All endpoints live under `/api/v1`. Authentication is Sanctum bearer tokens;
login returns `202 two_factor_required` when 2FA is enabled. Rate limits:
10/min auth, 120/min API, 30/min advisor.

## Testing & quality

```bash
cd backend && php artisan test      # 18 tests, 83 assertions (unit + feature)
cd backend && ./vendor/bin/pint     # Laravel code style
cd frontend && npm run lint         # ESLint
cd frontend && npx tsc --noEmit     # strict TypeScript
```

CI (GitHub Actions) runs Pint, the Laravel suite against PostgreSQL 16 + Redis,
ESLint, `tsc`, the Next.js build, and a full Docker image build on `main`.

## Engineering notes

- **The twin's math is deterministic and explainable** — no black box. Scenario
  assumptions (income growth, expense growth, return) are visible in every
  response, and loan decisions use standard annuity installments.
- **Money is IDR throughout**; the advisor parses free-text amounts
  ("15 juta", "Rp500.000", "1,5jt").
- **Charts follow a validated accessible palette** (colorblind-safe adjacent
  pairs, separate light/dark steps), with legends, tabular numerals and
  hairline grids.
- Simulations are projections, not financial advice.
