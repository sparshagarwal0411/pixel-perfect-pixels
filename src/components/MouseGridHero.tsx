import { useState, useRef, useEffect, useCallback, type MouseEvent } from "react";
import { Link } from "@tanstack/react-router";
import {
  Compass,
  ArrowRight,
  Search,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { GoogleLogo } from "./GoogleAuthModal";
import { colleges, collegeById, events } from "@/lib/data";
import { useStore } from "@/lib/store";
import { travelEstimate, fmtDate, fmtMoney } from "@/lib/logic";

export function MouseGridHero() {
  const { profile, setAuthModalOpen } = useStore();
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 400, y: 220, isHovered: false });
  const [currentPos, setCurrentPos] = useState({ x: 400, y: 220 });
  const [selectedCampus, setSelectedCampus] = useState(profile.collegeId || "dtu");

  const activeCollege = collegeById(selectedCampus);

  // Smooth mouse interpolation with requestAnimationFrame for silky smooth motion
  useEffect(() => {
    let animId: number;
    const update = () => {
      setCurrentPos((prev) => ({
        x: prev.x + (mousePos.x - prev.x) * 0.1,
        y: prev.y + (mousePos.y - prev.y) * 0.1,
      }));
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [mousePos]);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      isHovered: true,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos((prev) => ({ ...prev, isHovered: false }));
  }, []);

  // Compute a highlight event for this campus
  const topEvent = events.find((e) => e.collegeId !== selectedCampus) || events[0];
  const eventCollege = collegeById(topEvent.collegeId);
  const travel = travelEstimate(selectedCampus, topEvent.collegeId);

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 md:p-10 shadow-xl transition-all"
    >
      {/* 1. SUBTLE ELEGANT INTERACTIVE DOT-GRID BACKGROUND */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-40 transition-opacity duration-300"
        style={{
          backgroundImage: `radial-gradient(circle, var(--color-border) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          maskImage: `radial-gradient(circle 420px at ${currentPos.x}px ${currentPos.y}px, black 30%, transparent 80%)`,
          WebkitMaskImage: `radial-gradient(circle 420px at ${currentPos.x}px ${currentPos.y}px, black 30%, transparent 80%)`,
        }}
      />

      {/* 2. DYNAMIC CURSOR SPOTLIGHT GLOW (SILKY SMOOTH DAMPED) */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(480px circle at ${currentPos.x}px ${currentPos.y}px, color-mix(in oklab, var(--primary) 12%, transparent), transparent 75%)`,
        }}
      />

      {/* 3. HERO CONTENT GRID */}
      <div className="relative z-10 grid gap-10 lg:grid-cols-12 lg:items-center">
        {/* Left Column: Human, Crisp Copy */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" />
            <span>Delhi-NCR College Circuit · Hackathons & Fests</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl text-foreground leading-[1.12]">
            Never miss a hackathon, <br className="hidden sm:block" />
            <span className="text-primary">without the travel chaos.</span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
            Compare upcoming hackathons across DTU, IIT Delhi, NSUT, and IIITD. We calculate real metro travel times,
<<<<<<< HEAD
            clear event details, travel times, and schedule conflict warnings before you register.
=======
            transit routes, and flag schedule conflicts before you register.
>>>>>>> feature/harsh
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95 active:scale-[0.99] transition-all"
            >
              <GoogleLogo className="size-4" />
              <span>Sign in with Google</span>
              <ArrowRight className="size-3.5" />
            </button>

            <Link
              to="/explore"
              className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-xs sm:text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Search className="size-4 text-muted-foreground" />
              <span>Browse 18 Events</span>
            </Link>

            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-3 py-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Go to Dashboard →</span>
            </Link>
          </div>

          {/* Trust bullets */}
          <div className="flex flex-wrap items-center gap-5 text-xs text-muted-foreground pt-2">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-primary" /> Free 1-tap Google Sync
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-primary" /> Real Delhi Metro timings
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-primary" /> Zero spam
            </span>
          </div>
        </div>

        {/* Right Column: Real Interactive Preview Card */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-border bg-card/90 p-5 shadow-lg backdrop-blur-md space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span className="font-medium text-foreground">Select your college:</span>
                <span className="text-[11px]">Updates travel live</span>
              </div>

              {/* Fast Campus Pill Selector */}
              <div className="grid grid-cols-3 gap-1.5">
                {colleges.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCampus(c.id)}
                    className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-all ${
                      selectedCampus === c.id
                        ? "border-primary bg-primary text-primary-foreground shadow-xs"
                        : "border-border/80 bg-background text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    {c.short}
                  </button>
                ))}
              </div>
            </div>

            {/* Travel breakdown from selected college */}
            <div className="rounded-xl border border-border/80 bg-background/60 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Featured Event
                </span>
                <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {topEvent.category}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground truncate">{topEvent.title}</h3>
                <p className="text-xs text-muted-foreground">
                  at {eventCollege.name} ({eventCollege.short})
                </p>
              </div>

              {/* Trip specs */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border/60">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="size-3.5 text-primary" />
                  <span>{travel.minutes} min metro</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="size-3.5 text-primary" />
                  <span>₹{travel.cost} est. fare</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="size-3.5 text-primary" />
                  <span>{fmtDate(topEvent.start)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground font-semibold text-foreground">
                  <TrendingUp className="size-3.5 text-emerald-500" />
                  <span>{topEvent.prize ? fmtMoney(topEvent.prize) : "Free swag"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-muted-foreground">From {activeCollege.short}: {activeCollege.metro}</span>
              <Link
                to="/events/$id"
                params={{ id: topEvent.id }}
                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
              >
                <span>View Route</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
