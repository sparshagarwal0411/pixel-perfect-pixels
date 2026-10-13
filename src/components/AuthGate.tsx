import { useState, type ReactNode } from "react";
import { Lock, ArrowRight, Eye, Check } from "lucide-react";
import { useStore, PRESET_GOOGLE_USERS } from "@/lib/store";
import { GoogleLogo } from "./GoogleAuthModal";

interface AuthGateProps {
  featureName?: string;
  description?: string;
  children: ReactNode;
}

export function AuthGate({
  featureName = "this page",
  description = "Connect your student Google account to personalize travel routes from your college, track deadlines, and find teammates.",
  children,
}: AuthGateProps) {
  const { user, setAuthModalOpen, loginWithGoogle } = useStore();
  const [bypassed, setBypassed] = useState(false);

  // If user is authenticated or explicitly clicked temporary preview
  if (user || bypassed) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-[520px] w-full overflow-hidden rounded-2xl">
      {/* 1. ACTUAL PAGE CONTENT RENDERED IN THE BACKGROUND WITH ELEGANT BLUR */}
      <div
        className="pointer-events-none select-none filter blur-md opacity-25 brightness-90 transition-all duration-500 scale-[0.995]"
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Frosted overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-background/50 backdrop-blur-xs" />

      {/* 2. AUTH BOX FLOATING IN FRONT */}
      <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card/95 p-7 text-center shadow-2xl backdrop-blur-xl fade-up">
          {/* Logo Badge */}
          <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-border bg-background shadow-xs">
            <GoogleLogo className="size-6" />
          </div>

          <h2 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
            Sign in to access {featureName}
          </h2>

          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>

          {/* Quick Account Chooser */}
          <div className="mt-5 space-y-2 text-left">
            <p className="text-[11px] font-medium text-muted-foreground">Quick sign-in with sample account:</p>
            {PRESET_GOOGLE_USERS.slice(0, 2).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => loginWithGoogle(u)}
                className="w-full flex items-center gap-2.5 rounded-xl border border-border/80 bg-background/70 p-2 text-xs hover:border-primary/50 hover:bg-muted/40 transition-all"
              >
                <img src={u.avatar} alt={u.name} className="size-7 rounded-full object-cover ring-1 ring-border" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{u.name}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{u.email} · {u.collegeId.toUpperCase()}</p>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground" />
              </button>
            ))}
          </div>

          {/* Main Action */}
          <div className="mt-5 flex flex-col gap-2">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-95 active:scale-[0.99] transition-all"
            >
              <GoogleLogo className="size-3.5" />
              <span>Continue with Google</span>
            </button>

            <button
              onClick={() => setBypassed(true)}
              className="flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <Eye className="size-3" />
              <span>Browse in guest mode for now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
