import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  MapPin,
  Calendar,
  Trophy,
  Network,
  ArrowRight,
} from "lucide-react";
import { events, colleges, collegeById } from "@/lib/data";
import { fmtDate, fmtMoney } from "@/lib/logic";
import { useStore } from "@/lib/store";
import { GoogleLogo } from "@/components/GoogleAuthModal";
import { MouseGridHero } from "@/components/MouseGridHero";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AvsarMarg — Delhi-NCR College Hackathons, Fests & Competitions" },
      {
        name: "description",
        content:
          "Compare college hackathons across DTU, IIT Delhi, NSUT, and IIITD with transparent Worth-It scores and metro transit times.",
      },
    ],
  }),
  component: LandingPage,
});
export function LandingPage() {
  const { setAuthModalOpen } = useStore();

  const featuredEvents = useMemo(() => events.slice(0, 3), []);


  return (
    <div className="space-y-14 pb-12">
      {/* 1. MOUSE-CONTROLLED HERO */}
      <MouseGridHero />

      {/* 2. THREE CORE PILLARS (Clean, Human Design) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Why students use AvsarMarg
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            No more registering for events that clash with exams or require 3 hours in cabs for a ₹5k prize pool.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4.5 space-y-2 hover:border-primary/40 transition-colors">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MapPin className="size-4.5" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Delhi Metro Transit</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              See nearest metro stations, line transfers, travel time, and rough fare estimates directly from your home campus.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4.5 space-y-2 hover:border-primary/40 transition-colors">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="size-4.5" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Schedule Clash Guard</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Automatically warns you if two events overlap on the same weekend or if deadlines coincide with major college dates.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4.5 space-y-2 hover:border-primary/40 transition-colors">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Network className="size-4.5" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Cross-Campus Collab</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Need a designer from DTU or an AI hacker from IIT Delhi? Find verified teammates across campuses.
            </p>
          </div>
        </div>
      </section>

      {/* 4. UPCOMING EVENTS TEASER */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
              Featured upcoming hackathons & fests
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Hand-picked events currently accepting student teams across Delhi-NCR.
            </p>
          </div>
          <Link
            to="/explore"
            className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
          >
            <span>See all 18 events</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredEvents.map((e) => {
            const clg = collegeById(e.collegeId);
            return (
              <div
                key={e.id}
                className="rounded-2xl border border-border bg-card p-4.5 flex flex-col justify-between hover:border-primary/40 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {e.category}
                    </span>
                  </div>

                  <h3 className="mt-2 text-sm font-semibold text-foreground line-clamp-1">{e.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {clg.name} ({clg.short})
                  </p>

                  <div className="mt-3.5 space-y-1.5 border-t border-border/60 pt-2.5 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span className="font-medium text-foreground">{fmtDate(e.start)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Prize Pool:</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {e.prize ? fmtMoney(e.prize) : "Certificates & Swag"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Registration:</span>
                      <span className="font-medium text-foreground">
                        {e.fee === 0 ? "Free" : fmtMoney(e.fee)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2.5 border-t border-border/60 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground text-[11px]">Metro: {clg.metro}</span>
                  <Link
                    to="/events/$id"
                    params={{ id: e.id }}
                    className="font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    <span>Details</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. CAMPUSES COVERED */}
      <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Connected Delhi-NCR Campuses</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Direct travel coordinates and metro route timings configured for major universities.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {colleges.map((c) => (
            <div key={c.id} className="rounded-xl border border-border/70 bg-background/60 p-3">
              <span className="text-xs font-semibold text-foreground block">{c.short}</span>
              <span className="text-[11px] text-muted-foreground block truncate">{c.name.split(" ")[0]}</span>
              <span className="text-[10px] text-primary block mt-1 truncate">Metro: {c.metro}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 6. GOOGLE AUTH CALL TO ACTION */}
      <section className="rounded-2xl border border-border bg-gradient-to-b from-card to-background p-6 md:p-8 text-center space-y-3">
        <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-background border border-border shadow-xs">
          <GoogleLogo className="size-5" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Ready to explore?</h2>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Sign in with Google to save events, track registration deadlines on your calendar, and calculate travel from your campus.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-95 transition-all"
          >
            <GoogleLogo className="size-3.5" />
            <span>Sign in with Google</span>
          </button>
          <Link
            to="/explore"
            className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <span>Explore Directory</span>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>© 2026 AvsarMarg · Delhi-NCR Inter-College Circuit</span>
        <div className="flex gap-4">
          <Link to="/explore" className="hover:text-foreground">Explore</Link>
          <Link to="/nearby" className="hover:text-foreground">Nearby</Link>
          <Link to="/calendar" className="hover:text-foreground">Calendar</Link>
          <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
        </div>
      </footer>
    </div>
  );
}
