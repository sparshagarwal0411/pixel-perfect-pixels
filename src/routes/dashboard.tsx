import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Bell, Bookmark, CalendarClock, Flame, Sparkles, MapPin, Compass, Network } from "lucide-react";
import { events, collegeById, eventById } from "@/lib/data";
import { fmtDate, fmtTime, overlaps, priority } from "@/lib/logic";
import { useStore } from "@/lib/store";
import { Chip, DemoNote, PageHeader, ScoreRing } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { GoogleLogo } from "@/components/GoogleAuthModal";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — EventRoute" },
      { name: "description", content: "Your upcoming events, deadlines, priorities and schedule conflicts in one place." },
      { property: "og:title", content: "EventRoute Dashboard" },
      { property: "og:description", content: "Inter-college opportunities, prioritized for you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <AuthGate
      featureName="Personalized Dashboard"
      description="Sign in with Google to synchronize your university calendar, detect schedule conflicts, and calculate transit telemetry from your college."
    >
      <DashboardContent />
    </AuthGate>
  );
}

function DashboardContent() {
  const { profile, saved, statuses, reminders, user } = useStore();
  const upcoming = events.filter((e) => new Date(e.end) > new Date());
  const committed = upcoming.filter((e) => statuses[e.id] === "Registered" || statuses[e.id] === "Interested");
  const ranked = upcoming
    .map((e) => ({ e, p: priority(e, profile, saved.includes(e.id)) }))
    .filter((x) => x.p.daysLeft > 0 && statuses[x.e.id] !== "Registered")
    .sort((a, b) => b.p.score - a.p.score)
    .slice(0, 4);
  const conflicts: [string, string][] = [];
  committed.forEach((a, i) => committed.slice(i + 1).forEach((b) => overlaps(a, b) && conflicts.push([a.id, b.id])));
  const deadlines = upcoming
    .filter((e) => saved.includes(e.id) || statuses[e.id])
    .filter((e) => new Date(e.deadline) > new Date())
    .sort((a, b) => +new Date(a.deadline) - +new Date(b.deadline));

  const stats = [
    { label: "Registered", value: Object.values(statuses).filter((s) => s === "Registered").length, icon: CalendarClock },
    { label: "Saved", value: saved.length, icon: Bookmark },
    { label: "Reminders", value: reminders.length, icon: Bell },
    { label: "Conflicts", value: conflicts.length, icon: AlertTriangle },
  ];

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 fade-up">
        <div className="flex items-center gap-3.5">
          {user && (
            <div className="relative shrink-0">
              <img
                src={user.avatar}
                alt={user.name}
                className="size-12 rounded-full object-cover ring-2 ring-primary/40 shadow-sm"
              />
              <div className="absolute -bottom-1 -right-1 grid size-4.5 place-items-center rounded-full bg-background shadow-xs">
                <GoogleLogo className="size-3" />
              </div>
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Welcome back, {user ? user.name.split(" ")[0] : profile.name}
              </h1>
              {user && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-400">
                  Google Verified ✓
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Node: <span className="font-semibold text-foreground">{collegeById(profile.collegeId).name}</span> · Budget ceiling: <span className="font-semibold text-foreground">₹{profile.budget}</span> / event
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/explore"
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
          >
            <Compass className="size-3.5" />
            Find Events
          </Link>
          <Link
            to="/nearby"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
          >
            <MapPin className="size-3.5 text-primary" />
            Transit Radar
          </Link>
          <Link
            to="/campus"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
          >
            <Network className="size-3.5 text-primary" />
            Find Teammates
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card-surface p-4 fade-up">
            <s.icon className={`size-4 ${s.label === "Conflicts" && s.value ? "text-destructive" : "text-muted-foreground"}`} />
            <p className="mt-3 font-mono text-2xl font-semibold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {conflicts.length > 0 && (
        <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4 fade-up">
          <p className="flex items-center gap-2 text-sm font-medium text-destructive">
            <AlertTriangle className="size-4" /> Schedule conflict detected
          </p>
          {conflicts.map(([a, b]) => (
            <p key={a + b} className="mt-1 text-sm">
              <b>{eventById(a)!.title}</b> overlaps with <b>{eventById(b)!.title}</b> on {fmtDate(eventById(a)!.start)}.
            </p>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Flame className="size-4 text-warning" /> High Priority For You
          </h2>
          <div className="space-y-2">
            {ranked.map(({ e, p }) => (
              <Link
                key={e.id}
                to="/events/$id"
                params={{ id: e.id }}
                className="card-surface flex items-center gap-4 p-3 hover:border-primary/40 transition-colors"
              >
                <ScoreRing score={Math.max(0, Math.min(100, p.score))} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{e.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {collegeById(e.collegeId).short} · {fmtDate(e.start)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Chip tone={p.daysLeft < 3 ? "destructive" : "default"}>
                    {Math.ceil(p.daysLeft)}d to register
                  </Chip>
                  {!p.affordable && <Chip tone="warning">Over budget</Chip>}
                </div>
              </Link>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Priority algorithm blends deadline urgency, Worth-It™ Score, interest profile ({profile.interests.join(", ")}) and your budget limit.
          </p>
        </section>

        <section className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="mb-3 text-sm font-medium">Upcoming deadlines</h2>
            <div className="card-surface divide-y">
              {deadlines.length === 0 && (
                <p className="p-4 text-sm text-muted-foreground">Save events to track their deadlines.</p>
              )}
              {deadlines.map((e) => (
                <Link
                  key={e.id}
                  to="/events/$id"
                  params={{ id: e.id }}
                  className="flex items-center justify-between p-3 text-sm hover:bg-muted/40 transition-colors"
                >
                  <span className="truncate">{e.title}</span>
                  <span className="font-mono text-xs text-muted-foreground">{fmtDate(e.deadline)}</span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 flex items-center justify-between text-sm font-medium">
              This week <Link to="/calendar" className="text-xs text-primary">Full Calendar →</Link>
            </h2>
            <div className="card-surface p-3">
              <WeekStrip />
            </div>
          </div>
        </section>
      </div>

      <DemoNote />
    </>
  );
}

function WeekStrip() {
  const { statuses, saved } = useStore();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((d) => {
        const evs = events.filter(
          (e) => new Date(e.start).toDateString() === d.toDateString() && (statuses[e.id] || saved.includes(e.id))
        );
        return (
          <div key={d.toISOString()} className="rounded-md p-1.5 text-center">
            <p className="text-[10px] uppercase text-muted-foreground">
              {d.toLocaleDateString(undefined, { weekday: "short" })}
            </p>
            <p className="font-mono text-sm">{d.getDate()}</p>
            <div className="mt-1 flex justify-center gap-0.5">
              {evs.map((e) => (
                <span
                  key={e.id}
                  title={`${e.title} ${fmtTime(e.start)}`}
                  className={`size-1.5 rounded-full ${statuses[e.id] === "Registered" ? "bg-primary" : "bg-muted-foreground"}`}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
