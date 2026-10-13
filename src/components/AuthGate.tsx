import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Lock, ShieldAlert, Sparkles, ArrowRight, Eye, ShieldCheck } from "lucide-react";
import { useStore, PRESET_GOOGLE_USERS } from "@/lib/store";
import { GoogleLogo } from "./GoogleAuthModal";

interface AuthGateProps {
  featureName?: string;
  description?: string;
  children: ReactNode;
}

export function AuthGate({
  featureName = "Restricted Feature",
  description = "This feature requires Google authentication to sync your campus calendar, calculate real-time transit telemetry, and connect with teammates.",
  children,
}: AuthGateProps) {
  const { user, setAuthModalOpen, loginWithGoogle } = useStore();
  const [bypassed, setBypassed] = useState(false);

  // If user is authenticated or explicitly clicked temporary preview
  if (user || bypassed) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-[500px] w-full overflow-hidden rounded-2xl">
      {/* 1. ACTUAL PAGE CONTENT RENDERED IN THE BACKGROUND WITH BLUR */}
      <div
        className="pointer-events-none select-none filter blur-md opacity-35 brightness-75 transition-all duration-500 scale-[0.99]"
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Subtle scanline / cyber grid overlay over the blurred content */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-background/40 backdrop-blur-xs bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.25)_51%)] bg-[size:100%_4px]" />

      {/* 2. AUTH BOX FLOATING IN FRONT */}
      <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-primary/40 bg-card/95 p-7 text-center shadow-2xl backdrop-blur-2xl ring-1 ring-primary/30 fade-up">
          {/* Cyber ambient glow */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-48 w-72 -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />

          {/* Top Status Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-mono font-medium text-amber-300">
            <Lock className="size-3.5 animate-pulse text-amber-400" />
            <span>SECURITY LEVEL 1 // GOOGLE AUTH REQUIRED</span>
          </div>

          {/* Central Logo & Badge */}
          <div className="mt-5 flex justify-center">
            <div className="relative grid size-18 place-items-center rounded-2xl border border-primary/40 bg-background/90 shadow-md">
              <GoogleLogo className="size-9" />
              <div className="absolute -bottom-1.5 -right-1.5 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground shadow-xs">
                <ShieldCheck className="size-3.5 stroke-[2.5]" />
              </div>
            </div>
          </div>

          <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            Sign in with Google to Unlock
          </h2>
          <p className="mt-1 font-mono text-xs text-primary font-semibold uppercase">
            // {featureName} //
          </p>

          <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>

          {/* Feature checklist */}
          <div className="mt-5 grid grid-cols-3 gap-2 text-left text-[11px]">
            <div className="rounded-lg border border-border/80 bg-background/70 p-2.5">
              <span className="font-mono text-[10px] text-primary font-bold block">01 // SYNC</span>
              <span className="text-muted-foreground leading-tight block mt-0.5">Google Calendar deadlines</span>
            </div>
            <div className="rounded-lg border border-border/80 bg-background/70 p-2.5">
              <span className="font-mono text-[10px] text-primary font-bold block">02 // RADAR</span>
              <span className="text-muted-foreground leading-tight block mt-0.5">Campus transit telemetry</span>
            </div>
            <div className="rounded-lg border border-border/80 bg-background/70 p-2.5">
              <span className="font-mono text-[10px] text-primary font-bold block">03 // MESH</span>
              <span className="text-muted-foreground leading-tight block mt-0.5">Cross-college teammates</span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-95 active:scale-98 transition-all"
            >
              <GoogleLogo className="size-4" />
              <span>Sign in with Google (Instant Unlock)</span>
              <ArrowRight className="size-4" />
            </button>

            <button
              onClick={() => setBypassed(true)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-background/60 px-3.5 py-3 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Eye className="size-3.5" />
              <span>Peek Guest Mode</span>
            </button>
          </div>

          {/* 1-Click Quick Demo Sign-in for immediate gratification */}
          <div className="mt-4 pt-3 border-t border-border/60">
            <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
              <span>Quick 1-click test:</span>
              <button
                onClick={() => loginWithGoogle(PRESET_GOOGLE_USERS[0])}
                className="underline hover:text-primary font-medium"
              >
                Sign in as Sparsh (DTU)
              </button>
              <span>·</span>
              <button
                onClick={() => loginWithGoogle(PRESET_GOOGLE_USERS[1])}
                className="underline hover:text-primary font-medium"
              >
                Alex (IITD)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
