import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
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
import { useStore, PRESET_GOOGLE_USERS } from "@/lib/store";
import { GoogleLogo } from "@/components/GoogleAuthModal";
import { ScoreRing, Chip } from "@/components/AppShell";

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
  const { user, profile, set, theme, setAuthModalOpen } = useStore();
  const [selectedCampus, setSelectedCampus] = useState(profile.collegeId || "dtu");

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

  const activeCollege = useMemo(() => collegeById(selectedCampus), [selectedCampus]);
  const featuredEvents = useMemo(() => events.slice(0, 3), []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* =========================================================================
          1. HIGH-TECH STICKY NAVBAR
      ========================================================================= */}
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Logo & System Badge */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25 transition-transform group-hover:scale-105">
              <Compass className="size-5" />
              <span className="absolute -top-1 -right-1 flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-foreground text-base">EventRoute</span>
                <span className="rounded border border-primary/40 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
                  v2.4
                </span>
              </div>
              <p className="font-mono text-[10px] text-muted-foreground leading-none hidden sm:block">
                SYS_ONLINE // NCR_MESH
              </p>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#simulator" className="hover:text-foreground transition-colors">
              Worth-It™ Engine
            </a>
            <a href="#campuses" className="hover:text-foreground transition-colors">
              Campus Nodes
            </a>
            <a href="#events" className="hover:text-foreground transition-colors">
              Live Feed
            </a>
            <Link to="/explore" className="hover:text-foreground transition-colors">
              Directory
            </Link>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => set((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }))}
              className="rounded-lg border border-border/80 p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>

            {user ? (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/20 hover:opacity-90 transition-all"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="size-5 rounded-full object-cover ring-1 ring-background"
                  />
                  <span>Open Console</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-2 rounded-xl border border-primary/40 bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-sm hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <GoogleLogo className="size-3.5" />
                  <span className="hidden sm:inline">Sign in with Google</span>
                  <span className="sm:hidden">Sign In</span>
                </button>

                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:opacity-90 transition-all"
                >
                  <span>Launch App</span>
                  <ChevronRight className="size-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. FUTURISTIC TECH HERO SECTION
      ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        {/* Glow ambient backgrounds */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-primary/5 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Telemetry pill */}
          <div className="flex justify-center fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-mono font-medium text-primary shadow-xs">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>DELHI-NCR TELEMETRY MESH // 12 UNIVERSITY NODES ONLINE</span>
            </div>
          </div>

          {/* Main Hero Header */}
          <div className="mt-8 text-center max-w-4xl mx-auto fade-up">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl text-foreground leading-[1.08]">
              Inter-College Event <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-primary via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Intelligence Protocol
              </span>
            </h1>
            <p className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Never miss a hackathon, robotics summit, or university fest. Algorithmic Worth-It™ scoring, real-time
              metro transit telemetry, autonomous schedule conflict resolution, and instant Google authentication.
            </p>

            {/* Hero CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/25 hover:opacity-95 active:scale-98 transition-all"
              >
                <GoogleLogo className="size-4.5" />
                <span>Sign in with Google</span>
                <ArrowRight className="size-4" />
              </button>

              <Link
                to="/explore"
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-border/80 bg-card/70 px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-muted hover:border-border transition-all"
              >
                <Search className="size-4 text-primary" />
                <span>Explore Events Matrix</span>
              </Link>

              <Link
                to="/dashboard"
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-border/80 bg-card/70 px-5 py-3.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all"
              >
                <span>Console Preview</span>
              </Link>
            </div>

            {/* Quick trust metrics */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-400" /> Instant Google 1-Tap Auth
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-400" /> 18 Active NCR Hackathons
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-400" /> ₹15,00,000+ Prize Pools
              </span>
            </div>
          </div>

          {/* =========================================================================
              3. INTERACTIVE HUD / TELEMETRY TERMINAL IN HERO
          ========================================================================= */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-border/80 bg-card/90 shadow-2xl backdrop-blur-md overflow-hidden fade-up">
            {/* Terminal Window Bar */}
            <div className="flex items-center justify-between border-b border-border/80 bg-muted/40 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-red-500/80" />
                <div className="size-3 rounded-full bg-yellow-500/80" />
                <div className="size-3 rounded-full bg-green-500/80" />
                <span className="ml-2 font-mono text-xs text-muted-foreground">
                  eventroute-daemon --telemetry: NCR_GRID_ACTIVE
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-primary">
                <Activity className="size-3.5 animate-pulse" />
                <span>LATENCY: 1.2ms</span>
              </div>
            </div>

            <div className="grid md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border/80">
              {/* Left: Terminal Log Stream */}
              <div className="md:col-span-6 p-5 font-mono text-xs space-y-2 bg-black/40">
                <p className="text-muted-foreground">
                  <span className="text-emerald-400">[09:41:00]</span> Initializing Delhi-NCR Multi-Campus Mesh...
                </p>
                <p className="text-muted-foreground">
                  <span className="text-emerald-400">[09:41:01]</span> Linked nodes:{" "}
                  <span className="text-cyan-400">IITD, DTU, NSUT, IIITD, BITS</span> (5 clusters)
                </p>
                <p className="text-muted-foreground">
                  <span className="text-emerald-400">[09:41:02]</span> Routing Matrix: Yellow Line, Magenta Line & Violet
                  Line buffers synchronized.
                </p>
                <p className="text-muted-foreground">
                  <span className="text-emerald-400">[09:41:03]</span> Scanned{" "}
                  <span className="text-primary font-semibold">18 active events</span> (7 hackathons, 5 fests, 6
                  symposiums).
                </p>
                <p className="text-primary/90 font-semibold">
                  <span className="text-emerald-400">[09:41:04]</span> &gt; SELECTED CAMPUS NODE:{" "}
                  <span className="uppercase text-warning">{activeCollege.short}</span>
                </p>
                <div className="mt-4 rounded-lg border border-primary/30 bg-primary/10 p-3 text-foreground">
                  <p className="text-[11px] text-primary font-bold flex items-center gap-1.5">
                    <Sparkles className="size-3.5" /> REAL-TIME TRANSIT ESTIMATE
                  </p>
                  <p className="text-xs mt-1 text-muted-foreground">
                    Origin: <span className="text-foreground font-semibold">{activeCollege.name}</span>
                    <br />
                    Nearest Metro: <span className="text-foreground">{activeCollege.metro}</span>
                  </p>
                </div>
              </div>

              {/* Right: Interactive College Radar Switcher */}
              <div className="md:col-span-6 p-5 flex flex-col justify-between bg-card">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Switch Origin Campus
                    </p>
                    <span className="rounded bg-primary/20 px-2 py-0.5 text-[10px] font-mono text-primary font-semibold">
                      Live Recalculate
                    </span>
                  </div>

                  {/* Campus Buttons */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {colleges.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCampus(c.id)}
                        className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
                          selectedCampus === c.id
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border/80 bg-background/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {c.short}
                      </button>
                    ))}
                  </div>

                  {/* Quick stats for selected college */}
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-border/80 bg-background/50 p-3">
                      <p className="text-[10px] uppercase font-mono text-muted-foreground">Nearest Metro</p>
                      <p className="text-sm font-semibold text-foreground truncate mt-0.5">{activeCollege.metro}</p>
                      <p className="text-[11px] text-primary font-mono mt-0.5">Direct Line Access</p>
                    </div>

                    <div className="rounded-xl border border-border/80 bg-background/50 p-3">
                      <p className="text-[10px] uppercase font-mono text-muted-foreground">Avg Transit</p>
                      <p className="text-sm font-semibold text-foreground mt-0.5">38 - 52 min</p>
                      <p className="text-[11px] text-muted-foreground font-mono mt-0.5">₹30 - ₹50 metro fare</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Ready to route from this node?</span>
                  <Link
                    to="/nearby"
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Launch Transit Radar →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. SYSTEMATIC 6-PILLAR FEATURE MATRIX
      ========================================================================= */}
      <section id="features" className="py-20 border-t border-border/80 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="font-mono text-xs font-semibold text-primary uppercase tracking-widest">
              Core Architecture
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              Built for Ambitious College Competitors
            </h2>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base">
              A systematic suite of tools engineered to remove logistical friction, eliminate schedule conflicts, and
              maximize competition win rates.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Pillar 1 */}
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:border-primary/50 transition-all group">
              <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <Trophy className="size-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-foreground">Neural Worth-It™ Score</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Algorithmic 0-100 index calculating prize pool size, registration fee, travel commute time, historical
                reviews, and skill alignment before you invest hours.
              </p>
              <div className="mt-4 flex items-center gap-2 font-mono text-xs text-primary">
                <span>0-100 MULTI-FACTOR WEIGHTING</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:border-primary/50 transition-all group">
              <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <MapPin className="size-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-foreground">Transit Telemetry Engine</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Automated Delhi-NCR metro route calculations, transfer line markers, nearest gates, and estimated cab
                vs. train costs from your specific university campus.
              </p>
              <div className="mt-4 flex items-center gap-2 font-mono text-xs text-primary">
                <span>CAMPUS-TO-VENUE ROUTING</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:border-primary/50 transition-all group">
              <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <Calendar className="size-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-foreground">Conflict Radar</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Real-time clash detection preventing overlapping hackathon submissions, exam date conflicts, and travel
                buffer violations across all your active registrations.
              </p>
              <div className="mt-4 flex items-center gap-2 font-mono text-xs text-primary">
                <span>AUTOMATED OVERLAP SHIELD</span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:border-primary/50 transition-all group">
              <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <Network className="size-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-foreground">CampusConnect Mesh</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Connect with complementary skill hackers across Delhi-NCR. Find frontend devs from DTU, ML specialists
                from IITD, and pitch wizards from NSUT.
              </p>
              <div className="mt-4 flex items-center gap-2 font-mono text-xs text-primary">
                <span>CROSS-COLLEGE SQUAD BUILDER</span>
              </div>
            </div>

            {/* Pillar 5 */}
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:border-primary/50 transition-all group">
              <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <GoogleLogo className="size-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-foreground">Unified Google Sync</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                1-tap Google Authentication connects your student calendar, syncs RSVP reminders, and preserves your
                team status seamlessly across devices.
              </p>
              <div className="mt-4 flex items-center gap-2 font-mono text-xs text-primary">
                <span>1-TAP STUDENT OAUTH</span>
              </div>
            </div>

            {/* Pillar 6 */}
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:border-primary/50 transition-all group">
              <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <Sliders className="size-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-foreground">Budget & ROI Guardrails</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Define maximum expense ceilings per competition. Get instant flags when travel and ticket fees exceed
                your parameters, maintaining sustainable participation.
              </p>
              <div className="mt-4 flex items-center gap-2 font-mono text-xs text-primary">
                <span>EXPENSE CAP OPTIMIZER</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. INTERACTIVE WORTH-IT™ ALGORITHM SIMULATOR
      ========================================================================= */}
      <section id="simulator" className="py-20 border-t border-border/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border/80 bg-card p-8 md:p-12 shadow-xl">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              {/* Left explanation */}
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs text-primary font-semibold">
                  <Sparkles className="size-3.5" />
                  <span>ALGORITHM BENCHMARK SIMULATOR</span>
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  Test The Worth-It™ Formula in Real-Time
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Every opportunity is evaluated through a multi-variable tensor model balancing reward magnitude,
                  transit friction, monetary barrier, and user domain relevance.
                </p>

                {/* Interactive Sliders */}
                <div className="space-y-4 pt-2">
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
                      className="mt-1.5 w-full accent-primary"
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
                      className="mt-1.5 w-full accent-primary"
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
                      className="mt-1.5 w-full accent-primary"
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
                      className="mt-1.5 w-full accent-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Right Output Dial Card */}
              <div className="lg:col-span-6 flex flex-col items-center justify-center rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center">
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Calculated Index</p>
                <div className="my-6">
                  <ScoreRing score={sandboxScore} size={120} />
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

                <div className="mt-6 w-full border-t border-border/80 pt-4 flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground">ENGINE STATUS:</span>
                  <span className="text-emerald-400">CALIBRATED (v2.4)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. LIVE UPCOMING CIRCUIT TEASER
      ========================================================================= */}
      <section id="events" className="py-20 border-t border-border/80 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="font-mono text-xs font-semibold text-primary uppercase tracking-widest">Live Circuit</span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Featured Regional Opportunities
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                High-priority hackathons currently accepting registrations across Delhi-NCR campuses.
              </p>
            </div>
            <Link
              to="/explore"
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <span>View All 18 Events</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                        <h3 className="mt-2 text-base font-bold text-foreground line-clamp-1">{e.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {clg.name} ({clg.short})
                        </p>
                      </div>
                      <ScoreRing score={w.score} size={42} />
                    </div>

                    <div className="mt-4 space-y-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
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

                  <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between">
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
        </div>
      </section>

      {/* =========================================================================
          7. DELHI-NCR CAMPUS MESH NETWORK
      ========================================================================= */}
      <section id="campuses" className="py-20 border-t border-border/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="font-mono text-xs font-semibold text-primary uppercase tracking-widest">
              Distributed Network
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Connected Campus Nodes
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Integrated transit coordinate mesh across Delhi Technological University, IIT Delhi, NSUT, and premier
              NCR institutions.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {colleges.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-border/80 bg-card p-4 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary">{c.short}</span>
                  <span className="size-2 rounded-full bg-emerald-400" />
                </div>
                <p className="mt-2 text-xs font-semibold text-foreground line-clamp-1">{c.name}</p>
                <p className="mt-1 text-[11px] text-muted-foreground truncate">Metro: {c.metro}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. GOOGLE AUTH CALL TO ACTION BANNER
      ========================================================================= */}
      <section className="py-16 border-t border-border/80 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl border border-primary/40 bg-card shadow-lg">
            <GoogleLogo className="size-7" />
          </div>

          <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Connect with Google & Unlock the Full Telemetry Engine
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            1-tap authentication grants immediate access to personalized schedule conflict detection, live college
            travel times, and the cross-campus teammate finder.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/25 hover:opacity-95 active:scale-98 transition-all"
            >
              <GoogleLogo className="size-4.5" />
              <span>Connect Google Account</span>
              <ArrowRight className="size-4" />
            </button>

            <Link
              to="/dashboard"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <span>Explore Dashboard (Guest)</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. SYSTEMATIC FOOTER
      ========================================================================= */}
      <footer className="border-t border-border/80 bg-card py-12 text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground font-bold">
                <Compass className="size-4" />
              </div>
              <div>
                <span className="font-semibold text-foreground">EventRoute</span>
                <span className="ml-2 font-mono text-[10px] text-primary">v2.4 [NCR_SYS]</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 font-mono text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SYSTEM OPERATIONAL
              </span>
              <span>TLS 1.3 ENCRYPTION</span>
              <span>DELHI-NCR MESH</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border/60 flex flex-wrap items-center justify-between gap-4">
            <p>© 2026 EventRoute. Multi-Campus Event Intelligence & Routing System.</p>
            <div className="flex gap-4">
              <Link to="/explore" className="hover:text-foreground">Explore</Link>
              <Link to="/nearby" className="hover:text-foreground">Nearby Radar</Link>
              <Link to="/rank" className="hover:text-foreground">EventRank</Link>
              <Link to="/campus" className="hover:text-foreground">CampusConnect</Link>
              <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
