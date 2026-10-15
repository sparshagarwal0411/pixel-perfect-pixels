import { Link, useLocation } from "@tanstack/react-router";
import {
  CalendarDays,
  Compass,
  LayoutDashboard,
  MapPinned,
  Moon,
  Network,
  Sun,
  Menu,
  X,
  Lock,
  LogOut,
  Home,
  CheckCircle2,
  Settings,
  History,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { GoogleLogo } from "./GoogleAuthModal";

export const navItems = [
  { to: "/", label: "Overview", icon: Home, isProtected: false },
  { to: "/dashboard", label: "My Dashboard", icon: LayoutDashboard, isProtected: true },
  { to: "/explore", label: "Explore Events", icon: Compass, isProtected: false },
  { to: "/nearby", label: "Transit Radar", icon: MapPinned, isProtected: true },
  { to: "/calendar", label: "Calendar", icon: CalendarDays, isProtected: true },
  { to: "/campus", label: "Campus Collab", icon: Network, isProtected: true },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, set, user, logout, setAuthModalOpen } = useStore();
  const loc = useLocation();
  const [open, setOpen] = useState(false);

  const sidebar = (
    <div className="flex h-full flex-col gap-4 p-4 overflow-y-auto">
      {/* Brand Header */}
      <div className="flex flex-col gap-2 pt-1 border-b border-sidebar-border pb-3">
        <Link
          to="/"
          className="flex items-center gap-2.5 px-1 group"
          onClick={() => setOpen(false)}
        >
          <div className="relative grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
            <Compass className="size-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold tracking-tight text-foreground block leading-tight">
                MargDarshak
              </span>
              <span className="rounded bg-muted px-1 py-0.2 font-mono text-[9px] text-muted-foreground">
                NCR
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground block leading-none mt-0.5">
              Delhi-NCR College Circuit
            </span>
          </div>
        </Link>

        {/* Global Google Auth status pill */}
        <div className="mt-1">
          {user ? (
            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-foreground hover:bg-muted/40"
            >
              <span className="flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span>Profile</span>
              </span>
              <Settings className="size-3.5 text-muted-foreground" />
            </Link>
          ) : (
            <div
              onClick={() => setAuthModalOpen(true)}
              className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-card/60 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              <span className="flex items-center gap-1.5 text-xs">
                <Lock className="size-3.5 text-muted-foreground" />
                <span>Sign in</span>
              </span>
              <span className="text-[10px] text-primary font-medium hover:underline">Sign in</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex flex-col gap-0.5">
        <p className="px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-1">
          Menu
        </p>
        {navItems.map((n) => {
          const active = n.to === "/" ? loc.pathname === "/" : loc.pathname === n.to || loc.pathname.startsWith(n.to + "/");
          const isGated = n.isProtected && !user;

          return (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${active
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-foreground"
                }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <n.icon className={`size-3.5 ${active ? "text-primary-foreground" : "text-muted-foreground"}`} />
                <span className="truncate">{n.label}</span>
              </div>
              {isGated && (
                <Lock className="size-3 text-muted-foreground/60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section & Google Auth in Sidebar Footer */}
      <div className="mt-auto flex flex-col gap-3">
        {user ? (
          <div className="rounded-xl border border-sidebar-border bg-card/60 p-2.5">
            <div className="flex items-center gap-2">
              <img
                src={user.avatar}
                alt={user.name}
                className="size-8 rounded-full object-cover ring-1 ring-border"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">{user.name}</p>
                <p className="truncate text-[10px] text-muted-foreground">{user.email}</p>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <LogOut className="size-3.5" />
              </button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <Link
                to="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1 rounded-md border border-border py-1.5 text-[11px] text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              >
                <Settings className="size-3" /> Profile
              </Link>
              <Link
                to="/history"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1 rounded-md border border-border py-1.5 text-[11px] text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              >
                <History className="size-3" /> History
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card/60 p-3 text-center">
            <div className="mx-auto flex size-7 items-center justify-center rounded-full bg-background border border-border shadow-xs">
              <GoogleLogo className="size-3.5" />
            </div>
            <p className="mt-1.5 text-xs font-medium text-foreground">Sign in with Google</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Sync calendar & unlock all routes.
            </p>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-1.5 text-xs font-medium text-primary-foreground hover:opacity-95 transition-all"
            >
              <GoogleLogo className="size-3" />
              <span>Connect Google</span>
            </button>
          </div>
        )}

        {/* Global Theme Control */}
        <div className="rounded-xl border border-sidebar-border bg-card/40 p-2.5">
          <button
            onClick={() => set((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }))}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-input py-1 text-xs text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
          >
            {theme === "dark" ? <Sun className="size-3" /> : <Moon className="size-3" />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Persistent Uniform Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-sidebar-border bg-sidebar md:block z-30">
        {sidebar}
      </aside>

      {/* Mobile Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-sidebar-border bg-sidebar shadow-2xl">
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="min-w-0 flex-1 flex flex-col glow-bg">
        {/* Uniform Top Header Bar across all views */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/80 px-4 py-2.5 md:px-8 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              className="rounded-md border p-1 text-foreground md:hidden"
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">MargDarshak ·</span>
              <span className="font-semibold text-foreground text-xs sm:text-sm tracking-tight">
                {navItems.find((n) => (n.to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(n.to)))?.label || "MargDarshak"}
              </span>
            </div>
          </div>

          {/* Right Top Status & Auth Controls */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span>12 Delhi-NCR Campuses</span>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1 text-xs">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="size-5 rounded-full object-cover ring-1 ring-border"
                  />
                  <span className="font-medium text-foreground hidden sm:inline">{user.name.split(" ")[0]}</span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted shadow-xs transition-colors"
              >
                <GoogleLogo className="size-3" />
                <span>Sign in</span>
              </button>
            )}
          </div>
        </header>

        {/* View Content */}
        <main className="flex-1 w-full mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">{children}</main>
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
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 fade-up">
      <div>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{subtitle}</p>}
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
  <p className="mt-8 text-center text-xs text-muted-foreground">
    MargDarshak Delhi-NCR · Travel times estimated via Delhi Metro network lines.
  </p>
);
