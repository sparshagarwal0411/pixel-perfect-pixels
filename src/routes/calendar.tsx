import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  BookOpen,
  Briefcase,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Compass,
  ExternalLink,
  Flame,
  Heart,
  Laptop,
  MapPin,
  Mic,
  Sparkles,
  Target,
  Trophy,
  Video,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { collegeById, type EventItem } from "@/lib/data";
import { fmtDate, fmtMoney } from "@/lib/logic";
import { useStore, type Status } from "@/lib/store";
import { Chip } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Hack Your Month Calendar — MargDarshak" },
      {
        name: "description",
        content:
          "Hack Your Month calendar edition: Date-wise competitions, flagship challenges, and your personalized registration schedule.",
      },
      { property: "og:title", content: "Hack Your Month — Event & Competition Calendar" },
      {
        property: "og:description",
        content: "Daily competitions, campus circuit hackathons, and placement trackers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CalendarRouteComponent,
});

function CalendarRouteComponent() {
  return <CalendarPage />;
}

interface HackEventInfo {
  day: number;
  theme: "flagship" | "gandhi" | "mental_health" | "students_day" | "dussehra" | "halloween" | "standard";
  brand: string;
  title: string;
  subtitle?: string;
  badge?: string;
  iconName:
  | "linkedin"
  | "gandhi"
  | "heart"
  | "mic"
  | "student"
  | "trophy"
  | "bow"
  | "pumpkin"
  | "pepsi"
  | "hp"
  | "hcl"
  | "accenture"
  | "maruti"
  | "robot"
  | "briefcase"
  | "laptop"
  | "coffee"
  | "zap"
  | "video"
  | "lock";
}

// 31 curated daily opportunities matching the user's Hack Your Month poster
const HACK_YOUR_MONTH_OCTOBER: Record<number, HackEventInfo> = {
  1: {
    day: 1,
    theme: "flagship",
    brand: "LinkedIn × unstop",
    title: "Hackathon Kickoff",
    subtitle: "Circuit launch & mentorship kickoff",
    badge: "Flagship",
    iconName: "linkedin",
  },
  2: {
    day: 2,
    theme: "gandhi",
    brand: "National Holiday",
    title: "Gandhi Jayanti",
    subtitle: "Swachh Tech & Green Campus Challenge",
    badge: "Holiday Challenge",
    iconName: "gandhi",
  },
  3: {
    day: 3,
    theme: "standard",
    brand: "pepsico",
    title: "Pep Supply Chain Stars",
    subtitle: "Operations & strategy sprint",
    iconName: "pepsi",
  },
  4: {
    day: 4,
    theme: "standard",
    brand: "EUROGRIP",
    title: "Creator Challenge",
    subtitle: "Design, motion & product story",
    iconName: "laptop",
  },
  5: {
    day: 5,
    theme: "standard",
    brand: "HAPPIEST HEALTH",
    title: "Digital Twin Challenge",
    subtitle: "Healthcare AI & telemetry",
    iconName: "heart",
  },
  6: {
    day: 6,
    theme: "standard",
    brand: "1:1 mentorship",
    title: "1:1 mentorship",
    subtitle: "Code reviews with FAANG mentors",
    iconName: "briefcase",
  },
  7: {
    day: 7,
    theme: "standard",
    brand: "Mock Testing",
    title: "Take Unstoppable Mock Tests",
    subtitle: "DSA, speed math & aptitude drill",
    iconName: "robot",
  },
  8: {
    day: 8,
    theme: "standard",
    brand: "HP",
    title: "HP Power Lab 3.0",
    subtitle: "Hardware & edge intelligence",
    iconName: "hp",
  },
  9: {
    day: 9,
    theme: "standard",
    brand: "Placement Cell",
    title: "Prep for Placements",
    subtitle: "Mock interviews & resume polishing",
    iconName: "briefcase",
  },
  10: {
    day: 10,
    theme: "mental_health",
    brand: "Global Observance",
    title: "World Mental Health Day",
    subtitle: "Mindful hacking & stress-free coding",
    badge: "Wellness",
    iconName: "heart",
  },
  11: {
    day: 11,
    theme: "flagship",
    brand: "The Unstoppable",
    title: "THE UNSTOPPABLE PODCAST",
    subtitle: "Founders unfiltered on scale & VC",
    badge: "Live 6 PM",
    iconName: "mic",
  },
  12: {
    day: 12,
    theme: "flagship",
    brand: "unstop",
    title: "LAKHPATI INTERNSHIP",
    subtitle: "₹1 lakh Stipend engineering roles",
    badge: "₹1L Stipend",
    iconName: "trophy",
  },
  13: {
    day: 13,
    theme: "standard",
    brand: "HCLTech",
    title: "Leadership Webinar",
    subtitle: "Cloud architecture & cybersecurity",
    iconName: "hcl",
  },
  14: {
    day: 14,
    theme: "flagship",
    brand: "Keynote Talk",
    title: "The Unstoppables: Breaking Barriers",
    subtitle: "Women in tech & engineering leaders",
    badge: "Keynote",
    iconName: "mic",
  },
  15: {
    day: 15,
    theme: "students_day",
    brand: "Global Observance",
    title: "World Students' Day",
    subtitle: "Honoring Dr. APJ Abdul Kalam & student innovators",
    badge: "Students First",
    iconName: "student",
  },
  16: {
    day: 16,
    theme: "flagship",
    brand: "unstop",
    title: "campus champions",
    subtitle: "Inter-college circuit qualifiers",
    badge: "Hackathon",
    iconName: "trophy",
  },
  17: {
    day: 17,
    theme: "standard",
    brand: "SEVA FIRST",
    title: "SEVA FIRST Innovation 2026",
    subtitle: "Rashtriya Youth Tech Challenge",
    iconName: "laptop",
  },
  18: {
    day: 18,
    theme: "standard",
    brand: "accenture",
    title: "Accenture Podcast",
    subtitle: "Generative AI on enterprise stacks",
    iconName: "accenture",
  },
  19: {
    day: 19,
    theme: "standard",
    brand: "MARUTI SUZUKI",
    title: "Maruti Suzuki Careers",
    subtitle: "EV telemetry & auto engineering",
    iconName: "maruti",
  },
  20: {
    day: 20,
    theme: "dussehra",
    brand: "Festive Edition",
    title: "Dussehra",
    subtitle: "Victory of clean code over bugs",
    badge: "Festival Special",
    iconName: "bow",
  },
  21: {
    day: 21,
    theme: "standard",
    brand: "Career Spark",
    title: "Light Up Your Career",
    subtitle: "Festive hiring surge & internships",
    iconName: "zap",
  },
  22: {
    day: 22,
    theme: "flagship",
    brand: "unstop",
    title: "CHRO DIALOGUE",
    subtitle: "What tech recruiters prioritize in 2026",
    badge: "Leader Panel",
    iconName: "briefcase",
  },
  23: {
    day: 23,
    theme: "standard",
    brand: "Dream Job Series",
    title: "Decode Your Dream Job",
    subtitle: "Negotiation & off-campus hiring paths",
    iconName: "lock",
  },
  24: {
    day: 24,
    theme: "standard",
    brand: "Showcase Day",
    title: "Career Wishlist",
    subtitle: "Open project demo & peer feedback",
    iconName: "laptop",
  },
  25: {
    day: 25,
    theme: "standard",
    brand: "Skill Clinic",
    title: "Sunday Skill-Up",
    subtitle: "Rust & backend microservices sprint",
    iconName: "coffee",
  },
  26: {
    day: 26,
    theme: "standard",
    brand: "Video Cast",
    title: "Ankit Unfiltered",
    subtitle: "Lessons from shipping 10+ student apps",
    iconName: "video",
  },
  27: {
    day: 27,
    theme: "standard",
    brand: "Open Source",
    title: "Do It for Future You",
    subtitle: "Hacktoberfest PR contributions",
    iconName: "laptop",
  },
  28: {
    day: 28,
    theme: "standard",
    brand: "Sprint Day",
    title: "Zero Excuse Day",
    subtitle: "24-hour sprint to ship your MVP",
    iconName: "zap",
  },
  29: {
    day: 29,
    theme: "standard",
    brand: "Glow Up",
    title: "Festive Career Glow Up",
    subtitle: "GitHub & LinkedIn profile makeover",
    iconName: "zap",
  },
  30: {
    day: 30,
    theme: "standard",
    brand: "Campus Hack",
    title: "Campus Career Hacks",
    subtitle: "Society networking & corporate sponsorships",
    iconName: "zap",
  },
  31: {
    day: 31,
    theme: "halloween",
    brand: "Halloween Special",
    title: "No Tricks, Just Opportunities",
    subtitle: "Midnight builder sprint & surprise grants",
    badge: "Halloween Finale",
    iconName: "pumpkin",
  },
};

const tone: Record<Status, "primary" | "success" | "default" | "destructive"> = {
  Interested: "default",
  Registered: "primary",
  Attended: "success",
  Skipped: "destructive",
};

function CalendarPage() {
  const { events, statuses, saved, setStatus, reminders, toggleReminder } = useStore();
  const [offset, setOffset] = useState(0);
  const [filterMode, setFilterMode] = useState<"all" | "tracked">("all");
  const [selectedDayInfo, setSelectedDayInfo] = useState<{
    day: number;
    hackEvent?: HackEventInfo;
    circuitEvents: EventItem[];
  } | null>(null);

  // Month baseline calculations
  const base = new Date();
  base.setDate(1);
  base.setMonth(base.getMonth() + offset);

  const monthName = base.toLocaleDateString(undefined, { month: "long" });
  const yearNumber = base.getFullYear();
  const isOctober = base.getMonth() === 9 && base.getFullYear() === 2026;

  // Sunday as day 0 in standard Indian & global calendars (Sun, Mon, Tue, Wed, Thu, Fri, Sat)
  const first = base.getDay();
  const totalDays = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();

  const trackedEvents = events.filter((e) => statuses[e.id] || saved.includes(e.id));
  const cells = Array.from({ length: first + totalDays }, (_, i) => (i < first ? null : i - first + 1));

  // Map events to days of the current visible month
  const eventsByDay = useMemo(() => {
    const map: Record<number, EventItem[]> = {};
    const relevantEvents = filterMode === "tracked" ? trackedEvents : events;

    relevantEvents.forEach((ev) => {
      const d = new Date(ev.start);
      if (d.getMonth() === base.getMonth() && d.getFullYear() === base.getFullYear()) {
        const dayNum = d.getDate();
        if (!map[dayNum]) map[dayNum] = [];
        map[dayNum].push(ev);
      }
    });
    return map;
  }, [events, trackedEvents, filterMode, base]);

  // Deadlines by day
  const deadlinesByDay = useMemo(() => {
    const map: Record<number, EventItem[]> = {};
    trackedEvents.forEach((ev) => {
      const d = new Date(ev.deadline);
      if (d.getMonth() === base.getMonth() && d.getFullYear() === base.getFullYear()) {
        const dayNum = d.getDate();
        if (!map[dayNum]) map[dayNum] = [];
        map[dayNum].push(ev);
      }
    });
    return map;
  }, [trackedEvents, base]);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 fade-up">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl text-foreground">
            Calendar &amp; Hack Your Month
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Interactive date-wise calendar featuring daily challenges, campus circuit hackathons, and personal deadlines.
          </p>
        </div>

        {/* View Mode Toggle - Matching Website Pill System */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${filterMode === "all"
                ? "border-primary bg-primary text-primary-foreground font-semibold shadow-xs"
                : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
          >
            All Events &amp; Daily Track
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("tracked")}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${filterMode === "tracked"
                ? "border-primary bg-primary text-primary-foreground font-semibold shadow-xs"
                : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
          >
            My Tracked ({trackedEvents.length})
          </button>
        </div>
      </div>

      {/* CALENDAR CONTAINER - HARMONIZED WITH WEBSITE THEME */}
      <div className="fade-up overflow-hidden rounded-2xl border border-border bg-card p-3 sm:p-5 shadow-card glow-bg relative">
        {/* POSTER HEADER WITH MARGDARSHAK DESIGN SYSTEM */}
        <div className="relative mb-4 flex flex-col items-center justify-center rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm py-6 px-4 text-center shadow-xs overflow-hidden">
          {/* Subtle grid pattern background matching App theme */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(circle, currentColor 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />

          {/* Top Brand Pill */}
          <div className="mb-2.5 flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary shadow-xs">
              <Compass className="size-3.5 text-primary" />
              <span>MargDarshak Circuit Edition</span>
            </span>
          </div>

          {/* Bold Title matching website theme */}
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground">
            Hack Your{" "}
            <span className="bg-gradient-to-r from-primary via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Month
            </span>
          </h2>

          {/* Harmonized Edition Badge */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1 text-xs sm:text-sm font-semibold text-primary shadow-xs">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              <span>{monthName} Edition {yearNumber}</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs text-muted-foreground font-mono">
              31 Daily Opportunities &amp; Campus Hackathons
            </span>
          </div>

          {/* Month Navigation Controls */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setOffset(offset - 1)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="px-3 font-mono font-semibold text-foreground min-w-[120px] text-center text-xs sm:text-sm">
                {monthName} {yearNumber}
              </span>
              <button
                type="button"
                onClick={() => setOffset(offset + 1)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Next Month"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            {!isOctober && (
              <button
                type="button"
                onClick={() => setOffset(0)}
                className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
              >
                Reset to October Edition
              </button>
            )}
          </div>
        </div>

        {/* 7-COLUMN CALENDAR GRID */}
        <div className="overflow-x-auto rounded-xl bg-card shadow-xs border border-border/80">
          <div className="min-w-[760px]">
            {/* Weekday Row: Sun, Mon, Tue, Wed, Thu, Fri, Sat */}
            <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
                <div
                  key={dayName}
                  className="py-2.5 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  {dayName}
                </div>
              ))}
            </div>

            {/* Calendar Cells Grid */}
            <div className="grid grid-cols-7 divide-x divide-y divide-border/60 border-b border-border">
              {cells.map((dayNum, idx) => {
                if (dayNum === null) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="min-h-[115px] sm:min-h-[135px] bg-muted/15 p-2"
                    />
                  );
                }

                // Check Hack Your Month event data for October
                const hackEvent = isOctober ? HACK_YOUR_MONTH_OCTOBER[dayNum] : undefined;
                const circuitEvs = eventsByDay[dayNum] || [];
                const dls = deadlinesByDay[dayNum] || [];

                const isToday =
                  dayNum === new Date().getDate() &&
                  base.getMonth() === new Date().getMonth() &&
                  base.getFullYear() === new Date().getFullYear();

                return (
                  <CalendarDayTile
                    key={`day-${dayNum}`}
                    dayNum={dayNum}
                    isToday={isToday}
                    hackEvent={hackEvent}
                    circuitEvents={circuitEvs}
                    deadlines={dls}
                    statuses={statuses}
                    onOpenDetails={() =>
                      setSelectedDayInfo({
                        day: dayNum,
                        hackEvent,
                        circuitEvents: circuitEvs,
                      })
                    }
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* QUICK DAY DETAILS MODAL / DRAWER */}
      {selectedDayInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm fade-up">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {monthName} {selectedDayInfo.day}, {yearNumber}
                </span>
                <h3 className="text-lg font-bold text-foreground">
                  {selectedDayInfo.hackEvent?.title || `Schedule for Day ${selectedDayInfo.day}`}
                </h3>
                {selectedDayInfo.hackEvent?.brand && (
                  <p className="text-xs text-muted-foreground">
                    Host / Partner: <span className="font-semibold text-foreground">{selectedDayInfo.hackEvent.brand}</span>
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayInfo(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            {selectedDayInfo.hackEvent && (
              <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  <p className="text-xs font-semibold text-foreground">Hack Your Month Daily Challenge</p>
                </div>
                <p className="text-xs text-foreground/90">{selectedDayInfo.hackEvent.subtitle}</p>
                {selectedDayInfo.hackEvent.badge && (
                  <span className="inline-block rounded-md bg-primary/15 text-primary border border-primary/25 px-2 py-0.5 text-[10px] font-semibold">
                    {selectedDayInfo.hackEvent.badge}
                  </span>
                )}
              </div>
            )}

            {/* University Circuit Events on this date */}
            <div>
              <p className="text-xs font-semibold text-foreground mb-2">Campus Circuit Competitions &amp; Events:</p>
              {selectedDayInfo.circuitEvents.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No inter-college circuit events scheduled on this exact date.</p>
              ) : (
                <div className="space-y-2">
                  {selectedDayInfo.circuitEvents.map((ev) => {
                    const c = collegeById(ev.collegeId);
                    const isReg = statuses[ev.id] === "Registered";
                    return (
                      <div
                        key={ev.id}
                        className="rounded-xl border border-border bg-card p-3 flex items-center justify-between gap-2 hover:border-primary/40 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-xs text-foreground truncate">{ev.title}</span>
                            <Chip tone="primary">{ev.category}</Chip>
                            {isReg && <Chip tone="success">Registered ✓</Chip>}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {c.short} · {ev.organizer} · {fmtMoney(ev.fee)}
                          </p>
                        </div>
                        <Link
                          to="/events/$id"
                          params={{ id: ev.id }}
                          className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 shadow-xs transition-opacity"
                        >
                          View Details →
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDayInfo(null)}
                className="rounded-lg border border-border px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGISTRATION TRACKER TABLE */}
      <div className="mt-10 fade-up">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck className="size-4.5 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Your Registration Tracker</h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {trackedEvents.length} tracked events
          </span>
        </div>

        <div className="card-surface overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[640px] text-sm text-left">
            <thead className="border-b border-border bg-muted/40 font-mono text-xs text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="p-3">Event &amp; Venue</th>
                <th className="p-3">Date</th>
                <th className="p-3">Deadline</th>
                <th className="p-3">Status</th>
                <th className="p-3">Reminder</th>
                <th className="p-3 text-right">Route</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {trackedEvents.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground text-xs">
                    No tracked competitions yet. Tick the register checkbox on any event in Explore or above to follow it here.
                  </td>
                </tr>
              )}
              {trackedEvents.map((e) => {
                const st = statuses[e.id];
                const left = Math.ceil((+new Date(e.deadline) - Date.now()) / 86400000);
                const c = collegeById(e.collegeId);
                return (
                  <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <Link
                        to="/events/$id"
                        params={{ id: e.id }}
                        className="font-semibold text-foreground hover:text-primary transition-colors block truncate max-w-[220px]"
                      >
                        {e.title}
                      </Link>
                      <p className="text-[11px] text-muted-foreground">
                        {c.name} ({c.short})
                      </p>
                    </td>
                    <td className="p-3 text-xs text-foreground font-medium">{fmtDate(e.start)}</td>
                    <td className="p-3">
                      {left > 0 ? (
                        <Chip tone={left <= 3 ? "destructive" : "default"}>{left}d left</Chip>
                      ) : (
                        <Chip>Closed</Chip>
                      )}
                    </td>
                    <td className="p-3">
                      <select
                        value={st ?? ""}
                        onChange={(ev) => setStatus(e.id, (ev.target.value || null) as Status | null)}
                        className="rounded-md border border-input bg-card px-2.5 py-1 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">Saved</option>
                        {(["Interested", "Registered", "Attended", "Skipped"] as Status[]).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      {st && <span className="ml-1.5"><Chip tone={tone[st]}>{st}</Chip></span>}
                    </td>
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={reminders.includes(e.id)}
                        onChange={() => toggleReminder(e.id)}
                        className="size-4 accent-primary cursor-pointer"
                        title="Toggle email/app reminder"
                      />
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        to="/events/$id"
                        params={{ id: e.id }}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Map &amp; Path →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// Subcomponent: Individual Day Tile harmonized with MargDarshak theme
interface CalendarDayTileProps {
  dayNum: number;
  isToday: boolean;
  hackEvent?: HackEventInfo;
  circuitEvents: EventItem[];
  deadlines: EventItem[];
  statuses: Record<string, Status>;
  onOpenDetails: () => void;
}

function CalendarDayTile({
  dayNum,
  isToday,
  hackEvent,
  circuitEvents,
  deadlines,
  statuses,
  onOpenDetails,
}: CalendarDayTileProps) {
  // Determine card style based on hackEvent theme
  const theme = hackEvent?.theme || "standard";

  let bgClass = "bg-card hover:bg-muted/40 text-foreground border-border/70";
  if (theme === "flagship") {
    bgClass = "bg-primary/[0.08] hover:bg-primary/[0.14] text-foreground border-primary/25 hover:border-primary/45 shadow-xs";
  } else if (theme === "gandhi") {
    bgClass = "bg-emerald-500/[0.07] hover:bg-emerald-500/[0.12] border-emerald-500/25 text-foreground";
  } else if (theme === "mental_health") {
    bgClass = "bg-teal-500/[0.07] hover:bg-teal-500/[0.12] border-teal-500/25 text-foreground";
  } else if (theme === "students_day") {
    bgClass = "bg-indigo-500/[0.07] hover:bg-indigo-500/[0.12] border-indigo-500/25 text-foreground";
  } else if (theme === "dussehra") {
    bgClass = "bg-amber-500/[0.07] hover:bg-amber-500/[0.12] border-amber-500/25 text-foreground";
  } else if (theme === "halloween") {
    bgClass = "bg-purple-500/[0.07] hover:bg-purple-500/[0.12] border-purple-500/25 text-foreground";
  }

  return (
    <div
      onClick={onOpenDetails}
      className={`group relative flex flex-col justify-between p-1.5 sm:p-2.5 transition-all cursor-pointer min-h-[115px] sm:min-h-[135px] ${bgClass}`}
    >
      {/* Top row: Date Number + Today Ring + Brand Tag */}
      <div className="flex items-start justify-between gap-1">
        <span
          className={`font-mono text-xs sm:text-sm font-semibold transition-colors ${isToday
              ? "grid size-5 sm:size-6 place-items-center rounded-full bg-primary text-primary-foreground ring-2 ring-primary/30 font-bold shadow-xs"
              : "text-foreground group-hover:text-primary"
            }`}
        >
          {dayNum}
        </span>

        {hackEvent?.brand && (
          <span
            className="text-[9px] font-mono font-medium uppercase truncate max-w-[70px] sm:max-w-[85px] px-1.5 py-0.5 rounded border border-border/60 bg-muted/70 text-muted-foreground group-hover:border-primary/30 group-hover:text-foreground transition-colors"
          >
            {hackEvent.brand}
          </span>
        )}
      </div>

      {/* Center Event Illustration / Visual */}
      <div className="my-1.5 flex flex-col items-center justify-center text-center">
        {/* Special Icon / Graphical Motif */}
        {renderThemeIcon(hackEvent?.iconName, theme)}

        {/* Event Title */}
        {hackEvent && (
          <p
            className="mt-1 line-clamp-2 text-[10px] sm:text-[11px] font-semibold leading-tight text-foreground group-hover:text-primary transition-colors"
          >
            {hackEvent.title}
          </p>
        )}
      </div>

      {/* Bottom Area: User Circuit Events & Deadlines */}
      <div className="space-y-0.5">
        {circuitEvents.map((ce) => (
          <div
            key={ce.id}
            className={`truncate rounded px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium flex items-center justify-between border ${statuses[ce.id] === "Registered"
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
              }`}
            title={`${ce.title} (${collegeById(ce.collegeId).short})`}
          >
            <span className="truncate">{ce.title}</span>
            {statuses[ce.id] === "Registered" && <span className="ml-1 text-[8px] font-bold">✓</span>}
          </div>
        ))}

        {deadlines.map((dl) => (
          <div
            key={dl.id}
            className="truncate rounded bg-warning/15 border border-warning/25 px-1.5 py-0.5 text-[9px] font-medium text-warning"
            title={`Deadline: ${dl.title}`}
          >
            ⏰ {dl.title}
          </div>
        ))}
      </div>
    </div>
  );
}

// Graphical motif helper matching MargDarshak harmonious color scheme
function renderThemeIcon(
  iconName?: HackEventInfo["iconName"],
  theme?: HackEventInfo["theme"],
) {
  if (!iconName) return null;

  switch (iconName) {
    case "linkedin":
      return (
        <div className="flex items-center gap-1 rounded bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-sky-500 dark:text-sky-300">
          <span>in</span>
          <span className="text-[8px] opacity-80">unstop</span>
        </div>
      );
    case "gandhi":
      return (
        <div className="flex flex-col items-center">
          <div className="h-1 w-6 rounded-full bg-gradient-to-r from-amber-500 via-white to-emerald-500 mb-0.5" />
          <Award className="size-3.5 text-emerald-400" />
        </div>
      );
    case "heart":
      return <Heart className="size-3.5 text-rose-400 fill-rose-400/20" />;
    case "student":
      return (
        <div className="grid size-5 place-items-center rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
          <BookOpen className="size-3" />
        </div>
      );
    case "bow":
      return (
        <div className="grid size-5 place-items-center rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
          <Target className="size-3" />
        </div>
      );
    case "pumpkin":
      return (
        <div className="flex items-center gap-1 text-amber-400">
          <Flame className="size-3 fill-amber-400 text-amber-400" />
          <span className="text-xs">🎃</span>
        </div>
      );
    case "mic":
      return <Mic className="size-3.5 text-primary" />;
    case "trophy":
      return <Trophy className="size-3.5 text-amber-400" />;
    case "pepsi":
      return (
        <div className="grid size-4.5 place-items-center rounded-full bg-sky-500/15 border border-sky-500/25 text-sky-400 font-bold text-[8px]">
          P
        </div>
      );
    case "hp":
      return (
        <div className="grid size-4.5 place-items-center rounded-full bg-primary/15 border border-primary/25 text-primary font-bold text-[8px] italic">
          hp
        </div>
      );
    case "hcl":
      return <span className="font-extrabold text-[10px] text-primary">HCL</span>;
    case "accenture":
      return <span className="font-semibold text-[9px] text-purple-400">&gt; accenture</span>;
    case "maruti":
      return <span className="font-bold text-[9px] text-rose-400">MARUTI</span>;
    case "robot":
      return <Zap className="size-3.5 text-primary" />;
    case "briefcase":
      return <Briefcase className="size-3.5 text-primary" />;
    case "laptop":
      return <Laptop className="size-3.5 text-primary" />;
    case "coffee":
      return <Coffee className="size-3.5 text-amber-400" />;
    case "video":
      return <Video className="size-3.5 text-rose-400" />;
    case "lock":
      return <Briefcase className="size-3.5 text-indigo-400" />;
    case "zap":
      return <Zap className="size-3.5 text-primary" />;
    default:
      return null;
  }
}
