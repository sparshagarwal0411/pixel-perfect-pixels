import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { colleges, collegeById, events, type Category } from "@/lib/data";
import { fmtDate, travelEstimate } from "@/lib/logic";
import { useStore } from "@/lib/store";
import { Chip, DemoNote, PageHeader } from "@/components/AppShell";
import { CanIMakeIt } from "@/components/CanIMakeIt";
import { AuthGate } from "@/components/AuthGate";
import { RealTransitMap } from "@/components/RealTransitMap";

export const Route = createFileRoute("/nearby")({
  head: () => ({
    meta: [
      { title: "Transit Radar & Map — AvsarMarg" },
      {
        name: "description",
        content:
          "Real-time Google Maps route directions, Delhi Metro transit times, and campus proximity for inter-college events.",
      },
      { property: "og:title", content: "Nearby opportunities & Google Maps transit radar" },
      {
        property: "og:description",
        content: "Explore campus venues and live transit routes across Delhi-NCR.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NearbyRouteComponent,
});

function NearbyRouteComponent() {
  return (
    <AuthGate
      featureName="Transit Radar & Real Map"
      description="Connect your student Google account to calculate live metro transit routes, station transfer gates, and 'Can I Make It' commute checks."
    >
      <Nearby />
    </AuthGate>
  );
}

function Nearby() {
  const { profile, set } = useStore();
  const [sel, setSel] = useState<string>(events[0].id);
  const [cat, setCat] = useState<Category | "All">("All");

  const home = collegeById(profile.collegeId);
  const evs = events
    .filter((e) => cat === "All" || e.category === cat)
    .sort(
      (a, b) =>
        travelEstimate(profile.collegeId, a.collegeId).minutes -
        travelEstimate(profile.collegeId, b.collegeId).minutes
    );

  const selected = events.find((e) => e.id === sel) || evs[0] || events[0];
  const destCollege = collegeById(selected.collegeId);

  return (
    <>
      <PageHeader
        title="Transit Radar & Real Map"
        subtitle={`Live metro travel routes from ${home.name} (${home.short}) to upcoming event venues across Delhi-NCR.`}
      />

      {/* Category filter pills */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(["All", "Hackathon", "Workshop", "Competition", "Conference", "Fest"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              cat === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Real Google Map & Interactive Leaflet Radar */}
        <div className="lg:col-span-7 space-y-4">
          <RealTransitMap
            homeCollege={home}
            selectedEvent={selected}
            destinationCollege={destCollege}
            allColleges={colleges}
            onSelectCollege={(cId) =>
              set((s) => ({ ...s, profile: { ...s.profile, collegeId: cId } }))
            }
          />
        </div>

        {/* Right: Event List & Can I Make It check */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Select Venue / Event</span>
              <span className="text-[11px] text-muted-foreground">Sorted by travel time</span>
            </div>

            <div className="max-h-80 divide-y divide-border/60 overflow-y-auto rounded-xl border border-border/80">
              {evs.map((e) => {
                const t = travelEstimate(profile.collegeId, e.collegeId);
                const isSelected = sel === e.id;
                return (
                  <button
                    key={e.id}
                    onClick={() => setSel(e.id)}
                    className={`flex w-full items-center justify-between gap-2 p-3 text-left text-xs transition-colors ${
                      isSelected
                        ? "bg-primary/10 border-l-2 border-primary"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className={`truncate font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {e.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {collegeById(e.collegeId).short} · {fmtDate(e.start)}
                      </p>
                    </div>
                    <Chip tone={t.minutes <= 35 ? "success" : t.minutes <= 60 ? "default" : "warning"}>
                      {t.minutes}m · ₹{t.cost}
                    </Chip>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Link
                to="/events/$id"
                params={{ id: selected.id }}
                className="text-xs font-semibold text-primary hover:underline"
              >
                View Full Details for {selected.title} →
              </Link>
            </div>
          </div>

          {/* Can I Make It widget */}
          <CanIMakeIt key={selected.id} e={selected} />
        </div>
      </div>

      <DemoNote />
    </>
  );
}
