import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bookmark,
  CalendarCheck,
  CalendarClock,
  Compass,
  MapPin,
  Network,
  Route as RouteIcon,
  Search,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { collegeById, type EventItem } from "@/lib/data";
import { fmtDate, fmtMoney, fmtTime, formatDistance, haversineKm, overlaps, travelEstimate } from "@/lib/logic";
import { useStore } from "@/lib/store";
import { Chip, DemoNote, PageHeader } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { GoogleLogo } from "@/components/GoogleAuthModal";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — AvsarMarg" },
      { name: "description", content: "Your registered competitions, past events attended, deadlines, and transit telemetry in one place." },
      { property: "og:title", content: "AvsarMarg Dashboard" },
      { property: "og:description", content: "Your registered competitions and campus track record." },
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
  const { events, profile, saved, statuses, setStatus, user } = useStore();
  const [registeredSearch, setRegisteredSearch] = useState("");

  const homeCollege = collegeById(profile.collegeId);
  const upcoming = events.filter((e) => new Date(e.end) > new Date());
  const committed = upcoming.filter((e) => statuses[e.id] === "Registered" || statuses[e.id] === "Interested");

  // All Registered competitions
  const registeredEvents = events
    .filter((e) => statuses[e.id] === "Registered")
    .sort((a, b) => +new Date(a.start) - +new Date(b.start));

  // Filtered registered events for table search
  const filteredRegistered = registeredEvents.filter((e) => {
    if (!registeredSearch.trim()) return true;
    const q = registeredSearch.toLowerCase();
    const college = collegeById(e.collegeId);
    return (
      e.title.toLowerCase().includes(q) ||
      e.organizer.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      college.name.toLowerCase().includes(q) ||
      college.short.toLowerCase().includes(q)
    );
  });

  // Past Competitions: events user marked as Attended OR ended in the past with Registered/Attended status
  const pastEvents = events
    .filter((e) => {
      const isAttended = statuses[e.id] === "Attended";
      const isPast = new Date(e.end) < new Date();
      const isPastRegistered = isPast && (statuses[e.id] === "Registered" || isAttended);
      return isAttended || isPastRegistered;
    })
    .sort((a, b) => +new Date(b.start) - +new Date(a.start));

  const conflicts: [string, string][] = [];
  committed.forEach((a, i) => committed.slice(i + 1).forEach((b) => overlaps(a, b) && conflicts.push([a.id, b.id])));
  const deadlines = upcoming
    .filter((e) => saved.includes(e.id) || statuses[e.id])
    .filter((e) => new Date(e.deadline) > new Date())
    .sort((a, b) => +new Date(a.deadline) - +new Date(b.deadline));

  const stats = [
    { label: "Registered", value: registeredEvents.length, icon: CalendarClock },
    { label: "Past Competitions", value: pastEvents.length, icon: Trophy },
    { label: "Saved", value: saved.length, icon: Bookmark },
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
              Node: <span className="font-semibold text-foreground">{homeCollege.name} ({homeCollege.short})</span> · Nearest Metro: <span className="font-semibold text-foreground">{homeCollege.metro}</span>
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
            <s.icon className={`size-4 ${s.label === "Conflicts" && s.value ? "text-destructive" : s.label === "Past Competitions" ? "text-amber-500" : "text-muted-foreground"}`} />
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
              <b>{events.find((e) => e.id === a)!.title}</b> overlaps with <b>{events.find((e) => e.id === b)!.title}</b> on {fmtDate(events.find((e) => e.id === a)!.start)}.
            </p>
          ))}
        </div>
      )}

      {/* REGISTERED COMPETITIONS & EVENTS TABLE */}
      <section className="mt-8 fade-up">
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarCheck className="size-5 text-primary" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-foreground">
                  Registered Competitions & Events
                </h2>
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {registeredEvents.length}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                All competitions you have registered for with live transit paths and campus venue details.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {registeredEvents.length > 2 && (
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={registeredSearch}
                  onChange={(e) => setRegisteredSearch(e.target.value)}
                  placeholder="Filter registered..."
                  className="rounded-lg border border-input bg-card py-1.5 pl-8 pr-2.5 text-xs outline-none focus:ring-1 focus:ring-ring w-44"
                />
              </div>
            )}
            <Link
              to="/explore"
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-primary hover:bg-muted/50 transition-colors"
            >
              + Register for More
            </Link>
          </div>
        </div>

        <div className="card-surface overflow-hidden rounded-xl border border-border">
          {registeredEvents.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <CalendarClock className="mx-auto size-10 text-muted-foreground/40" />
              <div className="max-w-md mx-auto">
                <p className="text-sm font-semibold text-foreground">No Registered Competitions Yet</p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Browse the Explore events page, tick the &quot;Register&quot; checkbox on any hackathon, workshop, or competition, and it will be recorded here with route directions.
                </p>
              </div>
              <Link
                to="/explore"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity"
              >
                <Compass className="size-3.5" />
                Explore &amp; Register Now
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="py-3 px-3.5 w-10 text-center">Status</th>
                    <th className="py-3 px-3.5 min-w-[200px]">Competition</th>
                    <th className="py-3 px-3.5 min-w-[150px]">Venue &amp; Metro</th>
                    <th className="py-3 px-3.5 min-w-[130px]">Event Date</th>
                    <th className="py-3 px-3.5 min-w-[110px]">Deadline</th>
                    <th className="py-3 px-3.5 min-w-[80px]">Fee</th>
                    <th className="py-3 px-3.5 min-w-[130px]">Transit Path</th>
                    <th className="py-3 px-3.5 text-right min-w-[120px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {filteredRegistered.map((e) => {
                    const c = collegeById(e.collegeId);
                    const travel = travelEstimate(profile.collegeId, e.collegeId);
                    const dist = haversineKm(homeCollege, c);
                    const daysLeft = Math.ceil((new Date(e.deadline).getTime() - Date.now()) / 86400000);

                    return (
                      <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                        {/* Registered Checkbox */}
                        <td className="py-3 px-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={true}
                            onChange={() => {
                              setStatus(e.id, null);
                              toast.info(`Unregistered from ${e.title}`);
                            }}
                            title="Uncheck to unregister"
                            className="size-4 rounded border-input text-primary accent-primary cursor-pointer focus:ring-primary"
                          />
                        </td>

                        {/* Title & Category */}
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Link
                              to="/events/$id"
                              params={{ id: e.id }}
                              className="font-semibold text-foreground hover:text-primary transition-colors"
                            >
                              {e.title}
                            </Link>
                            <Chip tone="primary">{e.category}</Chip>
                            {e.prize && <Chip tone="warning">{e.prize}</Chip>}
                          </div>
                          <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                            Organized by {e.organizer}
                          </p>
                        </td>

                        {/* Host Campus & Metro */}
                        <td className="py-3 px-3.5">
                          <p className="font-medium text-foreground">{c.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate" title={c.metro}>
                            {c.metro}
                          </p>
                        </td>

                        {/* Event Date */}
                        <td className="py-3 px-3.5">
                          <p className="font-medium text-foreground">{fmtDate(e.start)}</p>
                          <p className="text-[11px] text-muted-foreground">{fmtTime(e.start)} - {fmtTime(e.end)}</p>
                        </td>

                        {/* Deadline */}
                        <td className="py-3 px-3.5">
                          <p className="font-medium text-foreground">{fmtDate(e.deadline)}</p>
                          <span
                            className={`inline-block text-[10px] font-medium ${
                              daysLeft <= 2
                                ? "text-destructive font-semibold"
                                : daysLeft <= 5
                                  ? "text-amber-500"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {daysLeft > 0 ? `${daysLeft}d left` : "Closed"}
                          </span>
                        </td>

                        {/* Fee */}
                        <td className="py-3 px-3.5">
                          <span className={`font-mono font-medium ${e.fee === 0 ? "text-emerald-500" : "text-foreground"}`}>
                            {fmtMoney(e.fee)}
                          </span>
                        </td>

                        {/* Transit Path */}
                        <td className="py-3 px-3.5">
                          <p className="font-medium text-foreground flex items-center gap-1">
                            <RouteIcon className="size-3 text-primary" />
                            ~{travel.minutes} min metro
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {formatDistance(dist)} · ₹{travel.cost} fare
                          </p>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3.5 text-right">
                          <Link
                            to="/events/$id"
                            params={{ id: e.id }}
                            className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                          >
                            <span>Map &amp; Path</span>
                            <span>→</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* TWO-COLUMN GRID: PAST COMPETITIONS & DEADLINES/WEEK */}
      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        {/* PAST COMPETITIONS SECTION (Replacing High Priority For You) */}
        <section className="lg:col-span-3">
          <div className="mb-3.5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Trophy className="size-4.5 text-amber-500" /> Past Competitions
            </h2>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-500">
                {pastEvents.length} Attended
              </span>
              <Link to="/history" className="text-xs text-primary hover:underline">
                View History →
              </Link>
            </div>
          </div>

          <div className="space-y-2.5">
            {pastEvents.length === 0 ? (
              <div className="card-surface p-8 text-center space-y-2">
                <Trophy className="mx-auto size-8 text-muted-foreground/40 mb-1" />
                <p className="text-sm font-semibold text-foreground">No Past Competitions Yet</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  When you attend competitions or mark events as &quot;Attended&quot;, they will appear here with your achievements and ratings.
                </p>
              </div>
            ) : (
              pastEvents.map((e) => {
                const c = collegeById(e.collegeId);
                return (
                  <Link
                    key={e.id}
                    to="/events/$id"
                    params={{ id: e.id }}
                    className="card-surface flex items-center gap-3.5 p-3.5 hover:border-primary/40 transition-all hover:-translate-y-0.5"
                  >
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <Trophy className="size-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="truncate text-sm font-semibold text-foreground hover:text-primary">
                          {e.title}
                        </span>
                        <Chip tone="primary">{e.category}</Chip>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {c.name} ({c.short}) · {fmtDate(e.start)} · by {e.organizer}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {e.prize ? (
                        <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-400 border border-amber-500/30">
                          {e.prize}
                        </span>
                      ) : (
                        <Chip tone="success">Attended ✓</Chip>
                      )}
                      <span className="text-[10px] text-muted-foreground">View details →</span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          <p className="mt-2.5 text-xs text-muted-foreground">
            Competitions and events you have attended across Delhi-NCR campuses.
          </p>
        </section>

        {/* UPCOMING DEADLINES & CALENDAR STRIP */}
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
  const { events, statuses, saved } = useStore();
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
