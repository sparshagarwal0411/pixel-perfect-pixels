import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Lock, ShieldAlert, Sparkles, Terminal, ArrowRight, Eye } from "lucide-react";
import { useStore } from "@/lib/store";
import { GoogleLogo } from "./GoogleAuthModal";

interface AuthGateProps {
  featureName?: string;
  description?: string;
  children: ReactNode;
}

export function AuthGate({
  featureName = "Restricted Feature",
  description = "This node requires verified Google authentication to access live campus telemetry, personal calendar sync, and teammate mesh.",
  children,
}: AuthGateProps) {
  const { user, setAuthModalOpen } = useStore();
  const [bypassed, setBypassed] = useState(false);

  // If user is authenticated or explicitly clicked temporary preview
  if (user || bypassed) {
    return <>{children}</>;
  }

  return (
    <div className="relative mx-auto my-6 max-w-2xl overflow-hidden rounded-2xl border border-primary/30 bg-card/90 p-8 text-center shadow-2xl backdrop-blur-md fade-up">
      {/* Background cyber grid & glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

      {/* Cyber Security Badge */}
      <div className="relative mx-auto inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1 text-xs font-mono font-medium text-primary">
        <Lock className="size-3.5 animate-pulse" />
        <span>CLEARANCE LEVEL 1 REQUIRED // ACCESS LOCKED</span>
      </div>

      <div className="relative mt-6 flex justify-center">
        <div className="relative grid size-20 place-items-center rounded-2xl border border-primary/40 bg-background/80 shadow-inner">
          <GoogleLogo className="size-10" />
          <div className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full bg-destructive text-destructive-foreground shadow-sm">
            <ShieldAlert className="size-4" />
          </div>
        </div>
      </div>

      <h2 className="relative mt-5 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        Sign In with Google to Unlock {featureName}
      </h2>

      <p className="relative mx-auto mt-2.5 max-w-lg text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>

      {/* Feature perks pill grid */}
      <div className="relative mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-3 text-left">
        <div className="rounded-xl border border-border/80 bg-background/60 p-3">
          <p className="font-mono text-xs font-semibold text-primary">01 // SYNC</p>
          <p className="mt-1 text-xs text-muted-foreground">Automated Google Calendar deadlines & RSVP routing</p>
        </div>
        <div className="rounded-xl border border-border/80 bg-background/60 p-3">
          <p className="font-mono text-xs font-semibold text-primary">02 // TELEMETRY</p>
          <p className="mt-1 text-xs text-muted-foreground">Real-time transit travel times from your home campus</p>
        </div>
        <div className="rounded-xl border border-border/80 bg-background/60 p-3">
          <p className="font-mono text-xs font-semibold text-primary">03 // MESH</p>
          <p className="mt-1 text-xs text-muted-foreground">CampusConnect teammate search & hackathon invitations</p>
        </div>
      </div>

      {/* Actions */}
      <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          onClick={() => setAuthModalOpen(true)}
          className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-95"
        >
          <GoogleLogo className="size-4" />
          <span>Sign In with Google (Instant Unlock)</span>
          <ArrowRight className="size-4" />
        </button>

        <button
          onClick={() => setBypassed(true)}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-border/80 bg-background/50 px-4 py-3 text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
        >
          <Eye className="size-3.5" />
          <span>Preview in Guest Mode</span>
        </button>
      </div>

      <div className="relative mt-6 border-t border-border/60 pt-4 flex items-center justify-between text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary transition-colors">
          ← Return to Landing Page
        </Link>
        <span className="font-mono text-[11px]">SYS_TOKEN: UNVERIFIED_GUEST</span>
      </div>
    </div>
  );
}
