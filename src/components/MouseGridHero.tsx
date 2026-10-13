import { useState, useRef, useEffect, useCallback, type MouseEvent } from "react";
import { Link } from "@tanstack/react-router";
import {
  Compass,
  ArrowRight,
  Search,
  CheckCircle2,
  Activity,
  Sparkles,
  Zap,
  ShieldCheck,
  Crosshair,
  Sliders,
} from "lucide-react";
import { GoogleLogo } from "./GoogleAuthModal";
import { colleges, collegeById, events } from "@/lib/data";
import { useStore } from "@/lib/store";

interface MousePosition {
  x: number;
  y: number;
  percentX: number;
  percentY: number;
  active: boolean;
}

export function MouseGridHero() {
  const { profile, setAuthModalOpen } = useStore();
  const heroRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mouse, setMouse] = useState<MousePosition>({
    x: 300,
    y: 200,
    percentX: 50,
    percentY: 50,
    active: false,
  });
  const [selectedCampus, setSelectedCampus] = useState(profile.collegeId || "dtu");
  const activeCollege = collegeById(selectedCampus);

  // Mouse move handler
  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const percentX = Math.round((x / rect.width) * 100);
    const percentY = Math.round((y / rect.height) * 100);
    setMouse({ x, y, percentX, percentY, active: true });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouse((prev) => ({ ...prev, active: false }));
  }, []);

  // Canvas interactive cyber grid with particles & mouse proximity connections
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    // Grid parameters
    const gridSize = 40;
    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      const targetX = mouse.active ? mouse.x : width / 2 + Math.sin(tick * 0.02) * 120;
      const targetY = mouse.active ? mouse.y : height / 2 + Math.cos(tick * 0.02) * 80;

      // Draw grid lines with mouse-distance illumination
      const cols = Math.ceil(width / gridSize);
      const rows = Math.ceil(height / gridSize);

      // Horizontal lines
      for (let r = 0; r <= rows; r++) {
        const y = r * gridSize;
        const distY = Math.abs(y - targetY);
        const alpha = Math.max(0.04, 0.25 - distY / 400);

        ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
        ctx.lineWidth = distY < 60 ? 1.2 : 0.6;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Vertical lines
      for (let c = 0; c <= cols; c++) {
        const x = c * gridSize;
        const distX = Math.abs(x - targetX);
        const alpha = Math.max(0.04, 0.25 - distX / 400);

        ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
        ctx.lineWidth = distX < 60 ? 1.2 : 0.6;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Intersection glowing nodes
      for (let c = 0; c <= cols; c += 2) {
        for (let r = 0; r <= rows; r += 2) {
          const x = c * gridSize;
          const y = r * gridSize;
          const d = Math.hypot(x - targetX, y - targetY);

          if (d < 220) {
            const glow = Math.max(0, 1 - d / 220);
            ctx.fillStyle = `rgba(52, 211, 153, ${glow * 0.9})`;
            ctx.beginPath();
            ctx.arc(x, y, 2 + glow * 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Connect lines to cursor if very close
            if (d < 120 && mouse.active) {
              ctx.strokeStyle = `rgba(6, 182, 212, ${(1 - d / 120) * 0.4})`;
              ctx.lineWidth = 0.8;
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(targetX, targetY);
              ctx.stroke();
            }
          }
        }
      }

      // Crosshair reticle at target
      if (mouse.active) {
        ctx.strokeStyle = "rgba(6, 182, 212, 0.6)";
        ctx.lineWidth = 1;

        // Small circle
        ctx.beginPath();
        ctx.arc(targetX, targetY, 14, 0, Math.PI * 2);
        ctx.stroke();

        // Cross lines
        ctx.beginPath();
        ctx.moveTo(targetX - 22, targetY);
        ctx.lineTo(targetX + 22, targetY);
        ctx.moveTo(targetX, targetY - 22);
        ctx.lineTo(targetX, targetY + 22);
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [mouse]);

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden rounded-3xl border border-primary/25 bg-card/60 p-6 md:p-10 shadow-2xl transition-all"
    >
      {/* 1. INTERACTIVE CANVAS MATRIX IN BACKGROUND */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-60"
      />

      {/* 2. DYNAMIC CURSOR SPOTLIGHT GLOW */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(550px circle at ${mouse.x}px ${mouse.y}px, rgba(6, 182, 212, 0.12), transparent 70%)`,
        }}
      />

      {/* 3. LIVE HUD TELEMETRY BAR (FOLLOWS / UPDATES WITH MOUSE) */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-primary font-bold">GRID_MATRIX_ACTIVE</span>
          <span className="text-muted-foreground hidden sm:inline">
            // DELHI-NCR RADAR PROTOCOL
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground bg-background/70 px-3 py-1 rounded-full border border-border/80 shadow-xs">
          <Crosshair className="size-3 text-cyan-400" />
          <span>
            MATRIX:{" "}
            <span className="text-foreground font-semibold">
              X:{Math.round(mouse.x)} Y:{Math.round(mouse.y)}
            </span>
          </span>
          <span className="text-primary font-semibold">[{mouse.percentX}%, {mouse.percentY}%]</span>
          <span className="text-emerald-400 hidden sm:inline">TARGET_LOCKED</span>
        </div>
      </div>

      {/* 4. MAIN HERO CONTENT */}
      <div className="relative z-10 mt-8 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1 text-xs font-mono font-medium text-primary shadow-xs">
          <Activity className="size-3.5 animate-pulse text-emerald-400" />
          <span>INTER-COLLEGE EVENT INTELLIGENCE & TRANSIT PROTOCOL</span>
        </div>

        <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground leading-[1.12]">
          Discover & Route To Premier <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-cyan-400 via-primary to-emerald-400 bg-clip-text text-transparent">
            College Hackathons & Fests
          </span>
        </h1>

        <p className="mt-4 text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          The algorithmic command center for university competitions across Delhi-NCR. Real-time metro transit
          telemetry, Worth-It™ scoring index, schedule conflict radar, and 1-tap Google Sync.
        </p>

        {/* Hero Actions */}
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-95 active:scale-98 transition-all"
          >
            <GoogleLogo className="size-4.5" />
            <span>Sign in with Google</span>
            <ArrowRight className="size-4" />
          </button>

          <Link
            to="/explore"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-border/80 bg-background/80 px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-muted hover:border-border transition-all"
          >
            <Search className="size-4 text-primary" />
            <span>Explore 18 Events</span>
          </Link>

          <Link
            to="/dashboard"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-border/80 bg-background/80 px-5 py-3.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all"
          >
            <span>My Dashboard →</span>
          </Link>
        </div>

        {/* Proof badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-xs text-muted-foreground font-mono">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-400" /> 1-Tap Google Student OAuth
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-400" /> Delhi-NCR Metro Buffers
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-400" /> ₹15,00,000+ Verified Prizes
          </span>
        </div>
      </div>

      {/* 5. INTERACTIVE LIVE TELEMETRY TERMINAL & CAMPUS RADAR HUD */}
      <div className="relative z-10 mt-10 max-w-4xl mx-auto rounded-2xl border border-border/80 bg-card/95 shadow-xl backdrop-blur-md overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-border/80 bg-muted/50 px-4 py-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="size-2.5 rounded-full bg-red-500/80" />
            <div className="size-2.5 rounded-full bg-yellow-500/80" />
            <div className="size-2.5 rounded-full bg-green-500/80" />
            <span className="text-muted-foreground ml-1.5">
              eventroute-daemon: active // NCR_CLUSTER
            </span>
          </div>
          <span className="text-primary font-semibold flex items-center gap-1">
            <Zap className="size-3 text-primary animate-pulse" />
            LIVE TELEMETRY
          </span>
        </div>

        <div className="grid md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border/80">
          {/* Left: Terminal Output Stream */}
          <div className="md:col-span-6 p-4 font-mono text-xs space-y-2 bg-black/40">
            <p className="text-muted-foreground">
              <span className="text-emerald-400">[09:41:01]</span> Linked regional nodes:{" "}
              <span className="text-cyan-400">IITD, DTU, NSUT, IIITD, BITS</span>
            </p>
            <p className="text-muted-foreground">
              <span className="text-emerald-400">[09:41:02]</span> Metro matrix synchronized: Yellow, Magenta, Violet
              transit lines.
            </p>
            <p className="text-muted-foreground">
              <span className="text-emerald-400">[09:41:03]</span> Scanned{" "}
              <span className="text-primary font-semibold">18 active hackathons & fests</span>.
            </p>
            <div className="mt-3 rounded-lg border border-primary/30 bg-primary/10 p-2.5 text-foreground">
              <p className="text-[11px] text-primary font-bold flex items-center gap-1.5">
                <Sparkles className="size-3" /> ACTIVE ORIGIN NODE: {activeCollege.short}
              </p>
              <p className="text-xs mt-1 text-muted-foreground">
                Nearest Metro: <span className="text-foreground font-semibold">{activeCollege.metro}</span>
                <br />
                Estimated transit: <span className="text-emerald-400 font-semibold">35-50 min</span> across major hubs
              </p>
            </div>
          </div>

          {/* Right: Interactive College Radar Switcher */}
          <div className="md:col-span-6 p-4 flex flex-col justify-between bg-card">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Switch Origin Campus Node
                </p>
                <span className="font-mono text-[10px] text-primary font-bold">
                  Recalculates Live
                </span>
              </div>

              {/* Campus Node Buttons */}
              <div className="grid grid-cols-3 gap-1.5">
                {colleges.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCampus(c.id)}
                    className={`rounded-lg border px-2 py-1 text-xs font-medium transition-all ${
                      selectedCampus === c.id
                        ? "border-primary bg-primary text-primary-foreground shadow-xs"
                        : "border-border/80 bg-background/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {c.short}
                  </button>
                ))}
              </div>

              {/* Stats for selected college */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-border/80 bg-background/50 p-2.5">
                  <span className="text-[10px] uppercase font-mono text-muted-foreground block">Metro Station</span>
                  <span className="font-semibold text-foreground truncate block mt-0.5">{activeCollege.metro}</span>
                </div>
                <div className="rounded-lg border border-border/80 bg-background/50 p-2.5">
                  <span className="text-[10px] uppercase font-mono text-muted-foreground block">Commute Fare</span>
                  <span className="font-semibold text-foreground block mt-0.5">₹30 - ₹50 metro</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Want live routing?</span>
              <Link
                to="/nearby"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Launch Transit Radar →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
