import { useState } from "react";
import { X, Check, ShieldCheck, ArrowRight, UserPlus, Sparkles } from "lucide-react";
import { useStore, PRESET_GOOGLE_USERS, type GoogleUser } from "@/lib/store";
import { colleges } from "@/lib/data";

export function GoogleLogo({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export function GoogleAuthModal() {
  const { authModalOpen, setAuthModalOpen, loginWithGoogle } = useStore();
  const [activeTab, setActiveTab] = useState<"preset" | "custom">("preset");
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [customCollege, setCustomCollege] = useState("dtu");
  const [selectedUser, setSelectedUser] = useState<GoogleUser>(PRESET_GOOGLE_USERS[0]);
  const [signingIn, setSigningIn] = useState(false);

  if (!authModalOpen) return null;

  const handleSignIn = (userToSign?: Partial<GoogleUser>) => {
    setSigningIn(true);
    setTimeout(() => {
      loginWithGoogle(userToSign || selectedUser);
      setSigningIn(false);
    }, 400);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const clg = colleges.find((c) => c.id === customCollege);
    handleSignIn({
      name: customName.trim(),
      email: customEmail.trim() || `${customName.toLowerCase().replace(/\s+/g, ".")}@${customCollege}.ac.in`,
      collegeId: customCollege,
      collegeName: clg?.name || "College",
      role: "Student Hacker",
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-md transition-opacity"
        onClick={() => setAuthModalOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-2xl shadow-primary/10 fade-up">
        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Close dialog"
        >
          <X className="size-4" />
        </button>

        {/* Google Branding Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-border/80 bg-background shadow-sm">
            <GoogleLogo className="size-7" />
          </div>
          <h2 className="mt-3.5 text-xl font-bold tracking-tight text-foreground">Sign in with Google</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Connect your verified student credentials to unlock the full EventRoute intelligence mesh.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="mt-5 grid grid-cols-2 rounded-lg border border-border/60 bg-muted/40 p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("preset")}
            className={`rounded-md py-1.5 transition-all ${
              activeTab === "preset"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Quick Select
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`rounded-md py-1.5 transition-all ${
              activeTab === "custom"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Custom Profile
          </button>
        </div>

        {/* Content based on tab */}
        {activeTab === "preset" ? (
          <div className="mt-4 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              Select verified account
            </p>
            {PRESET_GOOGLE_USERS.map((u) => {
              const isSelected = selectedUser.id === u.id;
              return (
                <div
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`group flex cursor-pointer items-center gap-3 rounded-xl border p-2.5 transition-all ${
                    isSelected
                      ? "border-primary/60 bg-primary/10 shadow-sm"
                      : "border-border/60 bg-background/50 hover:border-border hover:bg-muted/30"
                  }`}
                >
                  <div className="relative">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="size-10 rounded-full object-cover ring-1 ring-border"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 grid size-3.5 place-items-center rounded-full bg-background shadow-xs">
                      <GoogleLogo className="size-2.5" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-semibold text-foreground">{u.name}</p>
                      <span className="rounded bg-primary/20 px-1 py-0.2 text-[10px] font-medium text-primary">
                        {u.collegeId.toUpperCase()}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                    <p className="text-[10px] text-muted-foreground/80">{u.department}</p>
                  </div>

                  <div className="shrink-0">
                    {isSelected ? (
                      <div className="grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="size-5 rounded-full border border-border" />
                    )}
                  </div>
                </div>
              );
            })}

            <button
              onClick={() => handleSignIn(selectedUser)}
              disabled={signingIn}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-50"
            >
              {signingIn ? (
                <span className="inline-block size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <>
                  <GoogleLogo className="size-4" />
                  Continue as {selectedUser.name.split(" ")[0]}
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-foreground">Your Name</label>
              <input
                type="text"
                required
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Sparsh Agarwal"
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground">College / University</label>
              <select
                value={customCollege}
                onChange={(e) => setCustomCollege(e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              >
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.short})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground">College Email (Optional)</label>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="name@college.edu.in"
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <button
              type="submit"
              disabled={signingIn || !customName.trim()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-50"
            >
              <UserPlus className="size-4" />
              Sign In with Custom Google Identity
            </button>
          </form>
        )}

        {/* Security footer disclaimer */}
        <div className="mt-5 border-t border-border/60 pt-3">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            <span>256-bit Student OAuth Simulation · Instant Access Unlocked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
