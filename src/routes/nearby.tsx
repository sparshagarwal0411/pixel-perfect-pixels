import { createFileRoute, Link } from "@tanstack/react-router";
import { LocateFixed, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { colleges, collegeById, events, type Category } from "@/lib/data";
import { formatDistance, fmtDate, haversineKm, travelEstimate } from "@/lib/logic";
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
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"loading" | "ready" | "denied">("loading");

  const home = collegeById(profile.collegeId);
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCurrentLocation({ lat: coords.latitude, lng: coords.longitude });
        setLocationStatus("ready");
      },
      () => setLocationStatus("denied"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }, []);

  const origin = currentLocation ?? home;
  const evs = useMemo(
    () =>
      events
        .filter((e) => cat === "All" || e.category === cat)
        .sort((a, b) => {
          const aCollege = collegeById(a.collegeId);
          const bCollege = collegeById(b.collegeId);
          return haversineKm(origin, aCollege) - haversineKm(origin, bCollege);
        }),
    [cat, origin],
  );

  const selected = events.find((e) => e.id === sel) || evs[0] || events[0];
  const destCollege = collegeById(selected.collegeId);

  return (
    <>
      <PageHeader
        title="Transit Radar & Real Map"
        subtitle={
          locationStatus === "ready"
            ? "Upcoming events sorted by distance from your current location."
            : `Upcoming events sorted by distance from ${home.name} (${home.short}).`
        }
      />

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
        <LocateFixed
          className={`size-3.5 ${locationStatus === "ready" ? "text-emerald-500" : "text-primary"}`}
        />
        {locationStatus === "loading"
          ? "Finding your location…"
          : locationStatus === "ready"
            ? "Using your current location"
            : "Location unavailable — showing distances from your home college"}
      </div>

      {/* Category filter pills */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(["All", "Hackathon", "Workshop", "Competition", "Conference", "Fest"] as const).map(
          (c) => (
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
          ),
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Real Google Map & Interactive Leaflet Radar */}
        <div className="lg:col-span-7 space-y-4">
          <RealTransitMap
            homeCollege={home}
            selectedEvent={selected}
            destinationCollege={destCollege}
            allColleges={colleges}
            currentLocation={currentLocation ?? undefined}
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
              <span className="text-[11px] text-muted-foreground">Sorted by distance</span>
            </div>

            <div className="max-h-80 divide-y divide-border/60 overflow-y-auto rounded-xl border border-border/80">
              {evs.map((e) => {
                const t = travelEstimate(profile.collegeId, e.collegeId);
                const distance = haversineKm(origin, collegeById(e.collegeId));
                const isSelected = sel === e.id;
                return (
                  <button
                    key={e.id}
                    onClick={() => setSel(e.id)}
                    className={`flex w-full items-center justify-between gap-2 p-3 text-left text-xs transition-colors ${
                      isSelected ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}
                      >
                        {e.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        <MapPin className="mr-0.5 inline size-3" />
                        {collegeById(e.collegeId).short} · {fmtDate(e.start)} ·{" "}
                        {formatDistance(distance)}
                      </p>
                    </div>
                    <Chip tone={distance <= 5 ? "success" : distance <= 15 ? "default" : "warning"}>
                      {formatDistance(distance)}
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
