"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot,
  CalendarRange,
  GitBranch,
  LayoutDashboard,
  LineChart,
  LogOut,
  Menu,
  ShieldCheck,
  Sparkles,
  Target,
  UserCog,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { getMe, getToken, isDemo, logout } from "@/lib/api";
import type { User } from "@/lib/types";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/twin", label: "Twin Engine", icon: LineChart },
  { href: "/simulator", label: "Decision Simulator", icon: GitBranch },
  { href: "/insights", label: "Behavior", icon: Sparkles },
  { href: "/advisor", label: "AI Advisor", icon: Bot },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/timeline", label: "Timeline", icon: CalendarRange },
  { href: "/security", label: "Security", icon: ShieldCheck },
  { href: "/admin", label: "Admin", icon: UserCog },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [demo, setDemo] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    getMe().then((me) => {
      setUser(me);
      setDemo(isDemo());
    });
  }, [pathname]);

  async function handleLogout() {
    if (getToken()) await logout().catch(() => undefined);
    router.push("/");
  }

  const initials = (user?.name ?? "?")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  const nav = (
    <nav className="flex flex-1 flex-col gap-0.5">
      {navigation.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-accent font-medium text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-6 border-r bg-card/50 p-4 lg:flex">
        <Link href="/"><Logo /></Link>
        {nav}
        <div className="flex items-center gap-2 border-t pt-4">
          <Avatar><AvatarFallback>{initials}</AvatarFallback></Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{user?.name ?? "…"}</div>
            <div className="truncate text-xs text-muted-foreground">{user?.email}</div>
          </div>
          <Button variant="ghost" size="icon" aria-label="Log out" onClick={handleLogout}>
            <LogOut />
          </Button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col gap-6 border-r bg-background p-4">
            <div className="flex items-center justify-between">
              <Logo />
              <Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setMobileOpen(false)}>
                <X />
              </Button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/75 px-4 backdrop-blur-lg">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu />
          </Button>
          <div className="text-sm font-medium">
            {navigation.find((item) => pathname.startsWith(item.href))?.label}
          </div>
          {demo && (
            <Badge variant="warning" className="hidden sm:inline-flex">
              Demo data — sign in for your own twin
            </Badge>
          )}
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
