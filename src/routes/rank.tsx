import { createFileRoute, Link } from "@tanstack/react-router";
import { collegeById, type EventItem } from "@/lib/data";
import { travelEstimate } from "@/lib/logic";
import { useStore } from "@/lib/store";
import { DemoNote, PageHeader, ScoreRing } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";

export const Route = createFileRoute("/rank")({
  head: () => ({
    meta: [
      { title: "EventRank — MargDarshak" },
      { name: "description", content: "Personalized event rankings built from interests, proximity, and community feedback." },
      { property: "og:title", content: "EventRank: Personalized Event Match" },
      { property: "og:description", content: "See recommended events tailored to your interests and transit distance." },
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
      description="Sign in with your Google student account to calibrate event recommendations against your custom academic interests and travel limits."
    >
      <Rank />
    </AuthGate>
  );
}

function computeMatch(e: EventItem, interests: string[], collegeId: string, userReviewsCount: number) {
  const matches = e.tags.filter((tag) => interests.includes(tag)).length;
  const relevance = Math.min(100, matches * 40 + (matches ? 20 : 0));
  const t = travelEstimate(collegeId, e.collegeId);
  const proximity = Math.max(0, 100 - t.minutes);
  const quality = (e.quality / 5) * 100;
  const score = Math.round(relevance * 0.5 + proximity * 0.25 + quality * 0.25);
  const parts = [
    { key: "Interest", value: relevance },
    { key: "Proximity", value: proximity },
    { key: "Quality", value: quality },
  ];
  return { score, parts, reviewCount: e.reviews.length + userReviewsCount, travel: t };
}

function Rank() {
  const { events, profile, userReviews, set } = useStore();
  const ranked = events
    .map((e) => ({
      e,
      m: computeMatch(e, profile.interests, profile.collegeId, userReviews[e.id]?.length ?? 0),
    }))
    .sort((a, b) => b.m.score - a.m.score);

  const allTags = Array.from(new Set(events.flatMap((e) => e.tags)));

  return (
    <>
      <PageHeader title="EventRank" subtitle="Ranked according to your academic interests and campus proximity." />
      <div className="mb-6 card-surface p-4">
        <p className="mb-2 text-xs text-muted-foreground">Select your interests to customize recommendations</p>
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((t) => {
            const on = profile.interests.includes(t);
            return (
              <button
                key={t}
                onClick={() =>
                  set((s) => ({
                    ...s,
                    profile: {
                      ...s.profile,
                      interests: on ? s.profile.interests.filter((x) => x !== t) : [...s.profile.interests, t],
                    },
                  }))
                }
                className={`rounded-full border px-2.5 py-0.5 text-xs ${
                  on ? "border-primary bg-accent text-accent-foreground" : "text-muted-foreground"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Match Factors: Interest Alignment 50% · Campus Proximity 25% · Event Quality 25%.
        </p>
      </div>
      <div className="space-y-2">
        {ranked.map(({ e, m }, i) => (
          <Link
            key={e.id}
            to="/events/$id"
            params={{ id: e.id }}
            className="card-surface flex items-center gap-4 p-3 hover:border-primary/40 fade-up"
          >
            <span className="w-6 text-center font-mono text-sm text-muted-foreground">{i + 1}</span>
            <ScoreRing score={m.score} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{e.title}</p>
              <p className="text-xs text-muted-foreground">
                {collegeById(e.collegeId).short} · {m.travel.minutes} min transit · {m.reviewCount} review
                {m.reviewCount === 1 ? "" : "s"}
              </p>
            </div>
            <div className="hidden gap-3 md:flex">
              {m.parts.map((p) => (
                <div key={p.key} className="w-16">
                  <p className="text-[10px] text-muted-foreground">{p.key}</p>
                  <div className="mt-1 h-1 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${p.value}%` }} />
                  </div>
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
