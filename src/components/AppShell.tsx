import { Link, useLocation } from "@tanstack/react-router";
import {
  CalendarDays,
  Compass,
  LayoutDashboard,
  MapPinned,
  Moon,
  Network,
  Sun,
  Trophy,
  Menu,
  X,
  Lock,
  LogOut,
  Home,
  CheckCircle2,
  Sliders,
  Terminal,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { colleges } from "@/lib/data";
import { GoogleLogo } from "./GoogleAuthModal";

export const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, isProtected: true },
  { to: "/explore", label: "Explore Events", icon: Compass, isProtected: false },
  { to: "/nearby", label: "Nearby Radar", icon: MapPinned, isProtected: true },
  { to: "/calendar", label: "My Calendar", icon: CalendarDays, isProtected: true },
  { to: "/rank", label: "EventRank AI", icon: Trophy, isProtected: true },
  { to: "/campus", label: "CampusConnect", icon: Network, isProtected: true },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, set, profile, user, logout, setAuthModalOpen } = useStore();
  const loc = useLocation();
  const [open, setOpen] = useState(false);

  // If we are on the Landing / Main page ("/"), don't render the dashboard sidebar!
  // The landing page has its own dedicated futuristic header and full-bleed layout.
  if (loc.pathname === "/") {
    return <>{children}</>;
  }

  const sidebar = (
    <div className="flex h-full flex-col gap-5 p-4 overflow-y-auto">
      {/* Brand Header & Home Link */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-1 group"
            onClick={() => setOpen(false)}
          >
            <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/30 transition-transform group-hover:scale-105">
              <MapPinned className="size-4.5" />
            </div>
            <div>
              <span className="text-[15px] font-bold tracking-tight text-foreground block leading-tight">
                EventRoute
              </span>
              <span className="font-mono text-[10px] text-primary block leading-none">
                SYS_CORE v2.4
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="rounded-md border border-border/80 px-2 py-1 text-[11px] font-mono text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Return to Landing Page"
          >
            <Home className="inline size-3 mr-1" />
            Home
          </Link>
        </div>

        {/* Auth status indicator pill */}
        <div className="mt-1">
          {user ? (
            <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs text-emerald-400">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="size-3.5 text-emerald-400" />
                Google Verified
              </span>
              <span className="font-mono text-[10px] text-muted-foreground uppercase">{user.collegeId}</span>
            </div>
          ) : (
            <div
              onClick={() => setAuthModalOpen(true)}
              className="flex cursor-pointer items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-300 hover:bg-amber-500/20 transition-colors"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Lock className="size-3.5 text-amber-400" />
                Guest Mode (Limited)
              </span>
              <span className="text-[10px] underline font-medium">Sign in</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex flex-col gap-1">
        <p className="px-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground/70">
          Navigation Mesh
        </p>
        {navItems.map((n) => {
          const active = loc.pathname === n.to || loc.pathname.startsWith(n.to + "/");
          const isGated = n.isProtected && !user;

          return (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-sm font-medium transition-all ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <n.icon className={`size-4 ${active ? "text-primary-foreground" : "text-muted-foreground"}`} />
                <span className="truncate">{n.label}</span>
              </div>
              {isGated && (
                <span className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-mono font-semibold text-amber-400 bg-amber-500/15">
                  <Lock className="size-2.5" />
                  AUTH
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section & Google Auth */}
      <div className="mt-auto flex flex-col gap-3">
        {user ? (
          <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="size-9 rounded-full object-cover ring-1 ring-border"
                />
                <div className="absolute -bottom-0.5 -right-0.5 grid size-3.5 place-items-center rounded-full bg-background shadow-xs">
                  <GoogleLogo className="size-2.5" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">{user.name}</p>
                <p className="truncate text-[10px] text-muted-foreground">{user.email}</p>
              </div>
              <button
                onClick={logout}
                title="Sign out of Google"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <LogOut className="size-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-center">
            <div className="mx-auto flex size-8 items-center justify-center rounded-lg bg-background border border-border shadow-xs">
              <GoogleLogo className="size-4.5" />
            </div>
            <p className="mt-2 text-xs font-semibold text-foreground">Google Auth Required</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Sign in to unlock all sidebar telemetry & routing tools.
            </p>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 active:scale-98 transition-all"
            >
              <GoogleLogo className="size-3.5" />
              Sign in with Google
            </button>
          </div>
        )}

        {/* Global Controls: College & Budget & Theme */}
        <div className="space-y-2.5 rounded-xl border border-sidebar-border bg-card/40 p-3">
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Home Campus Node</span>
              <Sliders className="size-3 text-muted-foreground" />
            </div>
            <select
              value={profile.collegeId}
              onChange={(e) => set((s) => ({ ...s, profile: { ...s.profile, collegeId: e.target.value } }))}
              className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs outline-none"
            >
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.short} — {c.name.split(" ")[0]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Event Budget</span>
              <span className="font-mono text-xs font-semibold text-foreground">₹{profile.budget}</span>
            </div>
            <input
              type="range"
              min={100}
              max={3000}
              step={50}
              value={profile.budget}
              onChange={(e) => set((s) => ({ ...s, profile: { ...s.profile, budget: +e.target.value } }))}
              className="mt-1 w-full accent-primary"
            />
          </div>

          <button
            onClick={() => set((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }))}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-input py-1 text-xs text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
          >
            {theme === "dark" ? <Sun className="size-3" /> : <Moon className="size-3" />}
            {theme === "dark" ? "Switch Light Mode" : "Switch Dark Mode"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-sidebar-border bg-sidebar md:block">
        {sidebar}
      </aside>

      {/* Mobile Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-sidebar-border bg-sidebar shadow-2xl">
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="min-w-0 flex-1 glow-bg">
        {/* Mobile Header Bar */}
        <header className="flex items-center justify-between border-b px-4 py-3 md:hidden bg-card/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              className="rounded-md border p-1.5 text-foreground"
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight">EventRoute</span>
              <span className="rounded bg-primary/20 px-1 py-0.5 font-mono text-[9px] text-primary">v2.4</span>
            </div>
          </div>

          <div>
            {user ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="size-7 rounded-full object-cover ring-1 ring-primary"
              />
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground"
              >
                <GoogleLogo className="size-3" />
                Sign In
              </button>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 fade-up">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function Chip({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "primary" | "warning" | "success" | "destructive";
}) {
  const tones = {
    default: "bg-secondary text-secondary-foreground",
    primary: "bg-accent text-accent-foreground",
    warning: "bg-warning/15 text-warning",
    success: "bg-success/15 text-success",
    destructive: "bg-destructive/15 text-destructive",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function ScoreRing({ score, size = 44 }: { score: number; size?: number }) {
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  const tone = score >= 70 ? "text-success" : score >= 50 ? "text-warning" : "text-destructive";
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} className="stroke-muted" strokeWidth={4} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className={`${tone} stroke-current transition-all`}
          strokeWidth={4}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute font-mono text-xs font-semibold">{score}</span>
    </div>
  );
}

export const DemoNote = () => (
  <p className="mt-10 text-center text-xs text-muted-foreground">
    EventRoute v2.4 Multi-Campus Telemetry & Routing Engine. Real-time metro timings and AI scores computed across NCR campus nodes.
  </p>
);
