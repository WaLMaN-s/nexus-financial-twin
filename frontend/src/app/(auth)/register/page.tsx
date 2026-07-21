"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, register, setToken } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    monthly_income: "",
  });
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  function update(key: keyof typeof form) {
    return (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: event.target.value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        monthly_income: form.monthly_income
          ? Number(form.monthly_income)
          : undefined,
      });
      setToken(result.token);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? Object.values((err.body.errors as Record<string, string[]>) ?? {})
              .flat()
              .join(" ") || err.message
          : "Backend unreachable — try the live demo from the homepage instead.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Create your financial twin
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Two minutes now, a decade of foresight after.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={form.name} onChange={update("name")} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={update("email")}
            autoComplete="email"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={form.password}
            onChange={update("password")}
            autoComplete="new-password"
            minLength={8}
            required
          />
          <p className="text-[11px] text-subtle">
            At least 8 characters with letters and numbers.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="income">Monthly income (IDR, optional)</Label>
          <Input
            id="income"
            type="number"
            min={0}
            step={100000}
            placeholder="15000000"
            value={form.monthly_income}
            onChange={update("monthly_income")}
          />
        </div>

        {error && <p className="text-xs text-critical">{error}</p>}

        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Creating your twin…" : "Create my twin"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have a twin?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
