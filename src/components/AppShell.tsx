import { Link, useLocation } from "@tanstack/react-router";
import { CalendarDays, Compass, LayoutDashboard, MapPinned, Moon, Network, Sun, Trophy, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { colleges } from "@/lib/data";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/nearby", label: "Nearby", icon: MapPinned },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/rank", label: "EventRank", icon: Trophy },
  { to: "/campus", label: "CampusConnect", icon: Network },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, set, profile } = useStore();
  const loc = useLocation();
  const [open, setOpen] = useState(false);

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link to="/" className="flex items-center gap-2 px-2 pt-1" onClick={() => setOpen(false)}>
        <div className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
          <MapPinned className="size-4" />
        </div>
        <span className="text-[15px] font-semibold tracking-tight">EventRoute</span>
      </Link>
      <nav className="flex flex-col gap-0.5">
        {nav.map((n) => {
          const active = n.to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(n.to);
          return (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/60"
              }`}
            >
              <n.icon className={`size-4 ${active ? "text-primary" : ""}`} />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto space-y-3 rounded-lg border border-sidebar-border p-3">
        <label className="block text-xs text-muted-foreground">Your college</label>
        <select
          value={profile.collegeId}
          onChange={(e) => set((s) => ({ ...s, profile: { ...s.profile, collegeId: e.target.value } }))}
          className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
        >
          {colleges.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <label className="block text-xs text-muted-foreground">Budget per event: ₹{profile.budget}</label>
        <input
          type="range" min={100} max={3000} step={50} value={profile.budget}
          onChange={(e) => set((s) => ({ ...s, profile: { ...s.profile, budget: +e.target.value } }))}
          className="w-full accent-primary"
        />
        <button
          onClick={() => set((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }))}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-input py-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          {theme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-sidebar-border bg-sidebar md:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-sidebar-border bg-sidebar">{sidebar}</aside>
        </div>
      )}
      <div className="min-w-0 flex-1 glow-bg">
        <header className="flex items-center gap-3 border-b px-4 py-3 md:hidden">
          <button onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X className="size-5" /> : <Menu className="size-5" />}</button>
          <span className="font-semibold">EventRoute</span>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
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

export function Chip({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "primary" | "warning" | "success" | "destructive" }) {
  const tones = {
    default: "bg-secondary text-secondary-foreground",
    primary: "bg-accent text-accent-foreground",
    warning: "bg-warning/15 text-warning",
    success: "bg-success/15 text-success",
    destructive: "bg-destructive/15 text-destructive",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}>{children}</span>;
}

export function ScoreRing({ score, size = 44 }: { score: number; size?: number }) {
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  const tone = score >= 70 ? "text-success" : score >= 50 ? "text-warning" : "text-destructive";
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} className="stroke-muted" strokeWidth={4} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} className={`${tone} stroke-current transition-all`} strokeWidth={4} fill="none" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} strokeLinecap="round" />
      </svg>
      <span className="absolute font-mono text-xs font-semibold">{score}</span>
    </div>
  );
}

export const DemoNote = () => (
  <p className="mt-10 text-center text-xs text-muted-foreground">
    Sample data for demonstration. Reviews marked “sample” are illustrative; travel figures are rough estimates, not live routes.
  </p>
);
