import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Compass,
  MapPin,
  Calendar,
  Trophy,
  Network,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  Sliders,
  Terminal,
  Activity,
  CheckCircle2,
  Clock,
  Layers,
  Flame,
  Search,
  ExternalLink,
  ChevronRight,
  Lock,
  Sun,
  Moon,
  Users,
} from "lucide-react";
import { events, colleges, collegeById } from "@/lib/data";
import { fmtDate, fmtMoney, worthIt } from "@/lib/logic";
import { useStore } from "@/lib/store";
import { GoogleLogo } from "@/components/GoogleAuthModal";
import { ScoreRing, Chip } from "@/components/AppShell";
import { MouseGridHero } from "@/components/MouseGridHero";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EventRoute — Inter-College Event Intelligence & Transit Protocol" },
      {
        name: "description",
        content:
          "Algorithmic Worth-It scoring, Delhi-NCR transit telemetry, schedule conflict radar, and unified Google authentication for university hackathons and fests.",
      },
      { property: "og:title", content: "EventRoute — Inter-College Intelligence Protocol" },
      {
        property: "og:description",
        content: "Discover, calculate transit telemetry, and route to premier college events.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

export function LandingPage() {
  const { user, profile, setAuthModalOpen } = useStore();

  // Algorithm Sandbox state
  const [sandboxPrize, setSandboxPrize] = useState(150000);
  const [sandboxDistance, setSandboxDistance] = useState(15);
  const [sandboxFee, setSandboxFee] = useState(200);
  const [sandboxMatch, setSandboxMatch] = useState(85);

  // Calculate dynamic simulator score
  const sandboxScore = useMemo(() => {
    const prizeScore = Math.min(35, (sandboxPrize / 300000) * 35);
    const distScore = Math.max(0, 25 - (sandboxDistance / 40) * 25);
    const feeScore = Math.max(0, 20 - (sandboxFee / 1000) * 20);
    const matchScore = (sandboxMatch / 100) * 20;
    return Math.round(prizeScore + distScore + feeScore + matchScore);
  }, [sandboxPrize, sandboxDistance, sandboxFee, sandboxMatch]);

  const featuredEvents = useMemo(() => events.slice(0, 3), []);

  return (
    <div className="space-y-16 pb-12">
      {/* =========================================================================
          1. MOUSE-CONTROLLED GRID MATRIX HERO SECTION
      ========================================================================= */}
      <MouseGridHero />

      {/* =========================================================================
          2. SYSTEMATIC 6-PILLAR FEATURE MATRIX
      ========================================================================= */}
      <section id="features" className="space-y-6 pt-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs font-semibold text-primary uppercase tracking-widest">
              Core Architecture
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
              Built for Ambitious College Competitors
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A systematic suite of tools removing logistical friction and maximizing competition win rates.
            </p>
          </div>
          <Link
            to="/explore"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <span>Explore All Features</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Pillar 1 */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm hover:border-primary/50 transition-all group">
            <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <Trophy className="size-5" />
            </div>
            <h3 className="mt-3.5 text-base font-bold text-foreground">Neural Worth-It™ Score</h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Algorithmic 0-100 index evaluating prize pool magnitude, entry costs, travel commute friction, and skill
              alignment before you commit time.
            </p>
            <div className="mt-3.5 flex items-center gap-2 font-mono text-[11px] text-primary">
              <span>0-100 MULTI-FACTOR WEIGHTING</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm hover:border-primary/50 transition-all group">
            <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <MapPin className="size-5" />
            </div>
            <h3 className="mt-3.5 text-base font-bold text-foreground">Transit Telemetry Engine</h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Automated Delhi-NCR metro route calculations, transfer line markers, nearest gates, and estimated cab
              vs. train commute costs.
            </p>
            <div className="mt-3.5 flex items-center gap-2 font-mono text-[11px] text-primary">
              <span>CAMPUS-TO-VENUE ROUTING</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm hover:border-primary/50 transition-all group">
            <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <Calendar className="size-5" />
            </div>
            <h3 className="mt-3.5 text-base font-bold text-foreground">Conflict Radar</h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Real-time clash detection preventing overlapping hackathon submissions, exam date conflicts, and travel
              buffer violations.
            </p>
            <div className="mt-3.5 flex items-center gap-2 font-mono text-[11px] text-primary">
              <span>AUTOMATED OVERLAP SHIELD</span>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm hover:border-primary/50 transition-all group">
            <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <Network className="size-5" />
            </div>
            <h3 className="mt-3.5 text-base font-bold text-foreground">CampusConnect Mesh</h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Connect with complementary skill hackers across Delhi-NCR. Find frontend devs from DTU, ML specialists
              from IITD, and pitch wizards from NSUT.
            </p>
            <div className="mt-3.5 flex items-center gap-2 font-mono text-[11px] text-primary">
              <span>CROSS-COLLEGE SQUAD BUILDER</span>
            </div>
          </div>

          {/* Pillar 5 */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm hover:border-primary/50 transition-all group">
            <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <GoogleLogo className="size-5" />
            </div>
            <h3 className="mt-3.5 text-base font-bold text-foreground">Unified Google Sync</h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              1-tap Google Authentication connects your student calendar, syncs RSVP reminders, and preserves your team
              status seamlessly.
            </p>
            <div className="mt-3.5 flex items-center gap-2 font-mono text-[11px] text-primary">
              <span>1-TAP STUDENT OAUTH</span>
            </div>
          </div>

          {/* Pillar 6 */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm hover:border-primary/50 transition-all group">
            <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <Sliders className="size-5" />
            </div>
            <h3 className="mt-3.5 text-base font-bold text-foreground">Budget & ROI Guardrails</h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Define maximum expense ceilings per competition. Get instant flags when travel and ticket fees exceed
              your parameters.
            </p>
            <div className="mt-3.5 flex items-center gap-2 font-mono text-[11px] text-primary">
              <span>EXPENSE CAP OPTIMIZER</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. INTERACTIVE WORTH-IT™ FORMULA SIMULATOR
      ========================================================================= */}
      <section id="simulator" className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-xl">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left Sliders */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs text-primary font-semibold">
              <Sparkles className="size-3.5" />
              <span>ALGORITHM BENCHMARK SIMULATOR</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Test The Worth-It™ Formula in Real-Time
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Every opportunity is evaluated through a multi-variable tensor model balancing reward magnitude, transit
              friction, monetary barrier, and user domain relevance.
            </p>

            <div className="space-y-3.5 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold">
                  <span>Prize Pool: ₹{sandboxPrize.toLocaleString()}</span>
                  <span className="font-mono text-primary font-bold">Max ₹3,00,000+</span>
                </div>
                <input
                  type="range"
                  min={10000}
                  max={500000}
                  step={10000}
                  value={sandboxPrize}
                  onChange={(e) => setSandboxPrize(+e.target.value)}
                  className="mt-1 w-full accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold">
                  <span>Commute Distance: {sandboxDistance} km</span>
                  <span className="font-mono text-muted-foreground">From home campus</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={45}
                  step={1}
                  value={sandboxDistance}
                  onChange={(e) => setSandboxDistance(+e.target.value)}
                  className="mt-1 w-full accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold">
                  <span>Registration Fee: {sandboxFee === 0 ? "FREE (₹0)" : `₹${sandboxFee}`}</span>
                  <span className="font-mono text-muted-foreground">Entry cost</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1000}
                  step={50}
                  value={sandboxFee}
                  onChange={(e) => setSandboxFee(+e.target.value)}
                  className="mt-1 w-full accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold">
                  <span>Skill & Track Match: {sandboxMatch}%</span>
                  <span className="font-mono text-muted-foreground">AI / Web / Mobile</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={100}
                  step={5}
                  value={sandboxMatch}
                  onChange={(e) => setSandboxMatch(+e.target.value)}
                  className="mt-1 w-full accent-primary"
                />
              </div>
            </div>
          </div>

          {/* Right Output Dial */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Calculated Index</p>
            <div className="my-5">
              <ScoreRing score={sandboxScore} size={110} />
            </div>
            <div className="space-y-1">
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-bold font-mono ${
                  sandboxScore >= 75
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : sandboxScore >= 55
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {sandboxScore >= 75
                  ? "TIER S // HIGHLY RECOMMENDED"
                  : sandboxScore >= 55
                  ? "TIER A // STRONG CONTENDER"
                  : "TIER B // CONSIDER LOCAL ALTERNATIVE"}
              </span>
              <p className="text-xs text-muted-foreground mt-2 max-w-xs mx-auto">
                {sandboxScore >= 75
                  ? "Substantial prize incentives with optimal commute margins justify registration."
                  : "Balanced opportunity. Check calendar for potential schedule conflicts before committing."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. LIVE UPCOMING CIRCUIT TEASER
      ========================================================================= */}
      <section id="events" className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs font-semibold text-primary uppercase tracking-widest">Live Circuit</span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Featured Regional Competitions
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              High-priority hackathons currently accepting registrations across Delhi-NCR campuses.
            </p>
          </div>
          <Link
            to="/explore"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <span>View All 18 Events</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredEvents.map((e) => {
            const clg = collegeById(e.collegeId);
            const w = worthIt(e, profile);
            return (
              <div
                key={e.id}
                className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="rounded bg-primary/15 px-2 py-0.5 text-[10px] font-mono font-semibold text-primary">
                        {e.category}
                      </span>
                      <h3 className="mt-2 text-sm sm:text-base font-bold text-foreground line-clamp-1">{e.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {clg.name} ({clg.short})
                      </p>
                    </div>
                    <ScoreRing score={w.score} size={40} />
                  </div>

                  <div className="mt-3.5 space-y-1.5 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Dates:</span>
                      <span className="font-medium text-foreground">{fmtDate(e.start)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Prize Pool:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {e.prize ? fmtMoney(e.prize) : "Certificates & Swag"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Registration Fee:</span>
                      <span className="font-medium text-foreground">
                        {e.fee === 0 ? "FREE" : fmtMoney(e.fee)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-muted-foreground">
                    Metro: {clg.metro}
                  </span>
                  <Link
                    to="/events/$id"
                    params={{ id: e.id }}
                    className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    Inspect Route →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          5. CONNECTED CAMPUS NODES RADAR
      ========================================================================= */}
      <section id="campuses" className="space-y-5">
        <div className="text-center max-w-xl mx-auto">
          <span className="font-mono text-xs font-semibold text-primary uppercase tracking-widest">
            Distributed Network
          </span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Connected Campus Nodes
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Integrated transit coordinate mesh across Delhi-NCR's premier universities.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {colleges.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-border/80 bg-card p-3.5 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-primary">{c.short}</span>
                <span className="size-2 rounded-full bg-emerald-400" />
              </div>
              <p className="mt-1.5 text-xs font-semibold text-foreground line-clamp-1">{c.name}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground truncate">Metro: {c.metro}</p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          6. GOOGLE AUTH CALL TO ACTION BANNER
      ========================================================================= */}
      <section className="rounded-3xl border border-primary/30 bg-gradient-to-b from-primary/10 via-card to-card p-8 text-center shadow-lg">
        <div className="mx-auto inline-flex size-12 items-center justify-center rounded-2xl border border-primary/40 bg-card shadow-md">
          <GoogleLogo className="size-6" />
        </div>

        <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl text-foreground">
          Connect with Google & Unlock the Full Telemetry Engine
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
          1-tap authentication grants immediate access to personalized schedule conflict detection, live college travel
          times, and the cross-campus teammate finder.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-95 active:scale-98 transition-all"
          >
            <GoogleLogo className="size-4" />
            <span>Connect Google Account</span>
            <ArrowRight className="size-4" />
          </button>

          <Link
            to="/dashboard"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <span>Explore Dashboard</span>
          </Link>
        </div>
      </section>

      {/* =========================================================================
          7. FOOTER
      ========================================================================= */}
      <footer className="border-t border-border/80 pt-6 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>SYSTEM OPERATIONAL // DELHI-NCR MATRIX [v2.4]</span>
        </div>
        <p>© 2026 EventRoute. Multi-Campus Event Intelligence Protocol.</p>
      </footer>
    </div>
  );
}
