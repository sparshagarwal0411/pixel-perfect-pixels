import { useState, type ReactNode } from "react";
import { Lock, Eye, Check } from "lucide-react";
import { useStore } from "@/lib/store";
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
  const { user, setAuthModalOpen } = useStore();
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

          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{description}</p>

          {/* Main Action */}
          <div className="mt-6 flex flex-col gap-2">
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
