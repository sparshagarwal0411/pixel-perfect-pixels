import { createFileRoute, Link } from "@tanstack/react-router";
import { collegeById } from "@/lib/data";
import { fmtDate } from "@/lib/logic";
import { useStore } from "@/lib/store";
import { DemoNote, PageHeader } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";

export const Route = createFileRoute("/rank")({
  head: () => ({
    meta: [
      { title: "EventRank — AvsarMarg" },
      { name: "description", content: "Transparent Worth-It Scores built from quality, cost, travel, relevance and community feedback." },
      { property: "og:title", content: "EventRank: transparent Worth-It Scores" },
      { property: "og:description", content: "See exactly why an event is worth your time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RankRouteComponent,
});

function RankRouteComponent() {
  return (
    <AuthGate
      featureName="EventRank AI Engine"
      description="Sign in with your Google student account to calibrate AI ranking weights against your custom academic interests and travel limits."
    >
      <Rank />
    </AuthGate>
  );
}

function Rank() {
  const { events, profile, set } = useStore();
  const ranked = [...events].sort((a, b) => +new Date(a.start) - +new Date(b.start));
  const allTags = Array.from(new Set(events.flatMap((e) => e.tags)));
  return (
    <>
      <PageHeader title="Upcoming events" subtitle="Browse synced competitions and opportunities by date." />
      <div className="mb-6 card-surface p-4">
        <p className="mb-2 text-xs text-muted-foreground">Your interests (drive the Relevance factor)</p>
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((t) => {
            const on = profile.interests.includes(t);
            return <button key={t} onClick={() => set((s) => ({ ...s, profile: { ...s.profile, interests: on ? s.profile.interests.filter((x) => x !== t) : [...s.profile.interests, t] } }))} className={`rounded-full border px-2.5 py-0.5 text-xs ${on ? "border-primary bg-accent text-accent-foreground" : "text-muted-foreground"}`}>{t}</button>;
          })}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">Use your interests to keep event recommendations relevant.</p>
      </div>
      <div className="space-y-2">
        {ranked.map((e, i) => (
          <Link key={e.id} to="/events/$id" params={{ id: e.id }} className="card-surface flex items-center gap-4 p-3 hover:border-primary/40 fade-up">
            <span className="w-6 text-center font-mono text-sm text-muted-foreground">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{e.title}</p>
              <p className="text-xs text-muted-foreground">{collegeById(e.collegeId).short} · {fmtDate(e.start)}</p>
            </div>
          </Link>
        ))}
      </div>
      <DemoNote />
    </>
  );
}
