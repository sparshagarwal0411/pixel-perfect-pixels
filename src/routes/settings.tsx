import { createFileRoute } from "@tanstack/react-router";
import { AuthGate } from "@/components/AuthGate";
import { PageHeader } from "@/components/AppShell";
import { colleges } from "@/lib/data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Profile settings — AvsarMarg" },
      { name: "description", content: "Update your AvsarMarg profile and event preferences." },
    ],
  }),
  component: SettingsRoute,
});

function SettingsRoute() {
  return (
    <AuthGate
      featureName="Profile settings"
      description="Sign in with Google to update your profile and event preferences."
    >
      <SettingsPage />
    </AuthGate>
  );
}

function SettingsPage() {
  const { profile, set, user } = useStore();

  return (
    <>
      <PageHeader title="Profile settings" subtitle="Keep your profile and event preferences up to date." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <section className="card-surface space-y-5 p-5">
          <div>
            <label className="text-xs text-muted-foreground">Name</label>
            <input
              value={profile.name}
              onChange={(event) => set((state) => ({ ...state, profile: { ...state.profile, name: event.target.value } }))}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Home college</label>
            <select
              value={profile.collegeId}
              onChange={(event) => set((state) => ({ ...state, profile: { ...state.profile, collegeId: event.target.value } }))}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {colleges.map((college) => <option key={college.id} value={college.id}>{college.name}</option>)}
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">Budget per event</label>
              <span className="text-sm font-medium">₹{profile.budget}</span>
            </div>
            <input
              type="range"
              min={100}
              max={3000}
              step={50}
              value={profile.budget}
              onChange={(event) => set((state) => ({ ...state, profile: { ...state.profile, budget: +event.target.value } }))}
              className="mt-2 w-full accent-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Goals</label>
            <textarea
              value={profile.goals}
              onChange={(event) => set((state) => ({ ...state, profile: { ...state.profile, goals: event.target.value } }))}
              rows={3}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </section>
        <aside className="card-surface p-5">
          <p className="text-xs text-muted-foreground">Signed in account</p>
          <p className="mt-2 font-medium">{user?.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">{user?.email}</p>
          <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
            Your preferences personalize rankings, travel estimates, and event recommendations.
          </p>
        </aside>
      </div>
    </>
  );
}
