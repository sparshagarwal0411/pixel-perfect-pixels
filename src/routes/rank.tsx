import { createFileRoute, Link } from "@tanstack/react-router";
import { collegeById } from "@/lib/data";
import { worthIt } from "@/lib/logic";
import { useStore } from "@/lib/store";
import { DemoNote, PageHeader, ScoreRing } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";

export const Route = createFileRoute("/rank")({
  head: () => ({
    meta: [
      { title: "EventRank — MargDarshak" },
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
  const { events, profile, userReviews, set } = useStore();
  const ranked = events.map((e) => ({ e, w: worthIt(e, profile, userReviews[e.id]) })).sort((a, b) => b.w.score - a.w.score);
  const allTags = Array.from(new Set(events.flatMap((e) => e.tags)));
  return (
    <>
      <PageHeader title="EventRank" subtitle="Every score is explainable. Change your interests to see rankings update." />
      <div className="mb-6 card-surface p-4">
        <p className="mb-2 text-xs text-muted-foreground">Your interests (drive the Relevance factor)</p>
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((t) => {
            const on = profile.interests.includes(t);
            return <button key={t} onClick={() => set((s) => ({ ...s, profile: { ...s.profile, interests: on ? s.profile.interests.filter((x) => x !== t) : [...s.profile.interests, t] } }))} className={`rounded-full border px-2.5 py-0.5 text-xs ${on ? "border-primary bg-accent text-accent-foreground" : "text-muted-foreground"}`}>{t}</button>;
          })}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">Weights: Quality 25% · Relevance 25% · Cost 20% · Travel 15% · Community 15% (dropped and re-weighted when an event has no reviews).</p>
      </div>
      <div className="space-y-2">
        {ranked.map(({ e, w }, i) => (
          <Link key={e.id} to="/events/$id" params={{ id: e.id }} className="card-surface flex items-center gap-4 p-3 hover:border-primary/40 fade-up">
            <span className="w-6 text-center font-mono text-sm text-muted-foreground">{i + 1}</span>
            <ScoreRing score={w.score} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{e.title}</p>
              <p className="text-xs text-muted-foreground">{collegeById(e.collegeId).short} · {w.reviewCount} review{w.reviewCount === 1 ? "" : "s"}</p>
            </div>
            <div className="hidden gap-3 md:flex">
              {w.parts.map((p) => (
                <div key={p.key} className="w-16">
                  <p className="text-[10px] text-muted-foreground">{p.key}</p>
                  <div className="mt-1 h-1 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${p.value}%` }} /></div>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>
      <DemoNote />
    </>
  );
}
