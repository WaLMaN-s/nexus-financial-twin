"use client";

import * as React from "react";
import {
  Fingerprint,
  Laptop,
  LogIn,
  Smartphone,
  Trash2,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  getLoginHistory,
  getMe,
  getSessions,
  getToken,
  revokeSession,
} from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { LoginHistoryEntry, SessionInfo, User } from "@/lib/types";

export default function SecurityPage() {
  const [user, setUser] = React.useState<User | null>(null);
  const [sessions, setSessions] = React.useState<SessionInfo[] | null>(null);
  const [history, setHistory] = React.useState<LoginHistoryEntry[] | null>(null);

  React.useEffect(() => {
    getMe().then(setUser);
    getSessions().then(setSessions);
    getLoginHistory().then(setHistory);
  }, []);

  async function revoke(id: number) {
    if (getToken()) await revokeSession(id).catch(() => undefined);
    setSessions((s) => s?.filter((session) => session.id !== id) ?? null);
  }

  return (
    <div className="space-y-4">
      {/* 2FA */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Fingerprint className="size-5" />
            </div>
            <div>
              <CardTitle>Two-factor authentication</CardTitle>
              <CardDescription>
                TOTP codes from an authenticator app, with recovery keys
              </CardDescription>
            </div>
          </div>
          {user ? (
            <Switch
              checked={user.two_factor_enabled}
              aria-label="Two-factor authentication"
              onCheckedChange={(checked) =>
                setUser((u) => (u ? { ...u, two_factor_enabled: checked } : u))
              }
            />
          ) : (
            <Skeleton className="h-5 w-9 rounded-full" />
          )}
        </CardHeader>
        {user?.two_factor_enabled && (
          <CardContent>
            <Badge variant="good">Enabled</Badge>
            <p className="mt-2 text-xs text-muted-foreground">
              Codes are required at every sign-in. Manage enrollment via the API
              (<code className="font-mono">/security/2fa</code>) — the flow issues
              a QR provisioning URL and 8 one-time recovery codes.
            </p>
          </CardContent>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Devices */}
        <Card>
          <CardHeader>
            <CardTitle>Active devices</CardTitle>
            <CardDescription>
              Every session holding a valid token
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions === null ? (
              <Skeleton className="h-32" />
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  {/iOS|Android|Mobile/i.test(session.device) ? (
                    <Smartphone className="size-4 text-muted-foreground" />
                  ) : (
                    <Laptop className="size-4 text-muted-foreground" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className="truncate">{session.device}</span>
                      {session.is_current && (
                        <Badge variant="accent">This device</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last active{" "}
                      {session.last_used_at
                        ? formatDate(session.last_used_at)
                        : "recently"}
                    </div>
                  </div>
                  {!session.is_current && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Revoke ${session.device}`}
                      onClick={() => revoke(session.id)}
                    >
                      <Trash2 className="text-critical" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Login history */}
        <Card>
          <CardHeader>
            <CardTitle>Login history</CardTitle>
            <CardDescription>Recent authentication attempts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {history === null ? (
              <Skeleton className="h-32" />
            ) : (
              history.map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 text-sm">
                  <LogIn className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">{entry.device ?? "Unknown"}</span>
                    <span className="ml-2 text-xs text-muted-foreground tabular-nums">
                      {entry.ip_address}
                    </span>
                  </div>
                  <Badge
                    variant={entry.status === "success" ? "good" : "critical"}
                  >
                    {entry.status}
                  </Badge>
                  <span className="hidden text-xs text-muted-foreground sm:block">
                    {formatDate(entry.created_at)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
