"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, login, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("demo@nexus.app");
  const [password, setPassword] = React.useState("password");
  const [code, setCode] = React.useState("");
  const [needsCode, setNeedsCode] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await login(email, password, code || undefined);
      if (result.two_factor_required) {
        setNeedsCode(true);
        return;
      }
      if (result.token) {
        setToken(result.token);
        router.push("/dashboard");
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Backend unreachable — use “Explore the live demo” instead, or start the API with docker compose up.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Your twin has been running while you were away.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        {needsCode && (
          <div className="space-y-1.5 rounded-lg border bg-accent/40 p-3">
            <Label htmlFor="code" className="flex items-center gap-1.5">
              <KeyRound className="size-3.5" /> Two-factor code
            </Label>
            <Input
              id="code"
              inputMode="numeric"
              placeholder="123 456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
            />
          </div>
        )}

        {error && <p className="text-xs text-critical">{error}</p>}

        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Signing in…" : needsCode ? "Verify & sign in" : "Sign in"}
        </Button>
      </form>

      <div className="mt-6 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
        Demo account: <span className="font-medium text-foreground">demo@nexus.app</span> /{" "}
        <span className="font-medium text-foreground">password</span> — or{" "}
        <Link href="/dashboard" className="text-primary underline-offset-2 hover:underline">
          browse without an account
        </Link>
        .
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        No twin yet?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
