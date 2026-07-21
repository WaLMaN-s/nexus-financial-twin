"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  CalendarClock,
  Fingerprint,
  GitBranch,
  HeartPulse,
  LineChart,
  Lock,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeroSimulator } from "./hero-simulator";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 },
};

const features = [
  {
    icon: Brain,
    title: "Financial Twin Engine",
    body: "A digital clone of your finances runs best, expected and worst-case scenarios across 1–10 year horizons — continuously.",
  },
  {
    icon: GitBranch,
    title: "Life Decision Simulator",
    body: "Test a house, a wedding, a business, a loan — before committing. See the wealth curve with and without the decision.",
  },
  {
    icon: Sparkles,
    title: "Behavioral Analytics",
    body: "Your twin learns your patterns: lifestyle inflation, subscription waste, impulse spending — and quantifies each one.",
  },
  {
    icon: MessageSquareText,
    title: "AI Financial Advisor",
    body: "“Can I afford a Rp15jt laptop?” Every answer comes from your real numbers, with the opportunity cost attached.",
  },
  {
    icon: HeartPulse,
    title: "Financial Health Score",
    body: "One 0–100 score across savings, debt, cash flow, emergency fund and goals — with an explanation for every point.",
  },
  {
    icon: Target,
    title: "Goal Intelligence",
    body: "Every goal gets a predicted completion date, a success probability and its risk factors, updated as you live.",
  },
];

const steps = [
  {
    icon: LineChart,
    title: "Connect your money",
    body: "Add income, accounts, spending and goals. Your twin builds a living model of your financial behavior.",
  },
  {
    icon: TrendingUp,
    title: "See your future",
    body: "The engine projects your wealth across three scenarios and finds the milestones on your path.",
  },
  {
    icon: CalendarClock,
    title: "Decide with certainty",
    body: "Simulate decisions, follow your twin's recommendations, and watch your projected future improve.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b bg-background/75 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/"><Logo /></Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#security" className="hover:text-foreground transition-colors">Security</a>
          </nav>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent)]"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 md:grid-cols-2 md:pt-24">
          <div>
            <motion.div {...fadeUp}>
              <Badge variant="accent" className="mb-5">
                <Sparkles /> Your digital financial clone
              </Badge>
            </motion.div>
            <motion.h1
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl"
            >
              See your financial future{" "}
              <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400 bg-clip-text text-transparent">
                before it happens.
              </span>
            </motion.h1>
            <motion.p
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.16 }}
              className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg"
            >
              NEXUS builds a digital twin of your finances that simulates every
              habit, debt and decision — and shows you the decade ahead.
            </motion.p>
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.24 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Button size="lg" asChild>
                <Link href="/register">
                  Create your twin <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/dashboard">Explore the live demo</Link>
              </Button>
            </motion.div>
            <motion.p
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-4 text-xs text-subtle"
            >
              No credit card required · Bank-grade encryption · 2FA built in
            </motion.p>
          </div>

          <HeroSimulator />
        </div>
      </section>

      {/* Insight strip */}
      <section className="border-y bg-card/50">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm md:grid-cols-3">
          {[
            ["Rp91.250.000", "is what Rp50rb/day of coffee becomes in 5 years. Your twin sees it first."],
            ["8 months earlier", "is when your emergency fund completes if delivery spending drops 20%."],
            ["Rp850.000.000", "projected wealth at 40 when Rp1jt/month is invested. Compounding, visualized."],
          ].map(([stat, caption], i) => (
            <motion.div
              key={stat}
              {...fadeUp}
              transition={{ duration: 0.55, delay: i * 0.08 }}
            >
              <div className="text-2xl font-semibold tracking-tight tabular-nums">{stat}</div>
              <p className="mt-1 leading-relaxed text-muted-foreground">{caption}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20">
        <motion.div {...fadeUp} className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            An engine, not a spreadsheet
          </h2>
          <p className="mt-3 text-muted-foreground">
            Budget apps record the past. Your twin computes the future — and
            tells you how to change it.
          </p>
        </motion.div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              {...fadeUp}
              transition={{ duration: 0.55, delay: (i % 3) * 0.08 }}
              className="group rounded-xl border bg-card p-6 transition-shadow hover:shadow-lg hover:shadow-indigo-500/5"
            >
              <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <feature.icon className="size-5" />
              </div>
              <h3 className="font-semibold tracking-tight">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <motion.h2 {...fadeUp} className="text-center text-3xl font-semibold tracking-tight">
            Three steps to your future self
          </motion.h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                {...fadeUp}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                className="relative"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                  <step.icon className="size-5 text-muted-foreground" />
                </div>
                <h3 className="font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <motion.div {...fadeUp}>
            <Badge variant="accent" className="mb-4">
              <ShieldCheck /> Security first
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight">
              Your future deserves bank-grade protection
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Two-factor authentication, device management, full audit trails
              and aggressive rate limiting are not premium add-ons — they are
              the default.
            </p>
          </motion.div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [Fingerprint, "TOTP 2FA", "Authenticator-app codes with one-time recovery keys."],
              [Lock, "Session control", "See every device, revoke any session instantly."],
              [ShieldCheck, "Audit logs", "Every sensitive action recorded, forever reviewable."],
              [HeartPulse, "Rate limiting", "Login and API throttles that shut down abuse."],
            ].map(([Icon, title, body], i) => {
              const IconComponent = Icon as typeof Fingerprint;
              return (
                <motion.div
                  key={title as string}
                  {...fadeUp}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className="rounded-xl border bg-card p-4"
                >
                  <IconComponent className="mb-2 size-5 text-primary" />
                  <div className="text-sm font-semibold">{title as string}</div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {body as string}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <motion.div
          {...fadeUp}
          className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-indigo-600 to-violet-700 px-6 py-16 text-center text-white"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(255,255,255,0.18),transparent)]"
          />
          <h2 className="relative text-3xl font-semibold tracking-tight md:text-4xl">
            Meet your financial twin today
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-indigo-100">
            It takes two minutes to create your twin — and it will spend the
            next decade working for you.
          </p>
          <Button
            size="lg"
            className="relative mt-8 bg-white text-indigo-700 hover:bg-indigo-50"
            asChild
          >
            <Link href="/register">
              Get started free <ArrowRight />
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-xs text-muted-foreground md:flex-row">
          <Logo className="opacity-80" />
          <p>
            © {new Date().getFullYear()} NEXUS Financial Twin. Simulations are
            projections, not guarantees.
          </p>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-foreground">Sign in</Link>
            <a href="/docs" className="hover:text-foreground">API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
