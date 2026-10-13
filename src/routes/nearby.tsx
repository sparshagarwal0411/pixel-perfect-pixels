import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { colleges, collegeById, events, type Category } from "@/lib/data";
import { fmtDate, travelEstimate } from "@/lib/logic";
import { useStore } from "@/lib/store";
import { Chip, DemoNote, PageHeader } from "@/components/AppShell";
import { CanIMakeIt } from "@/components/CanIMakeIt";

export const Route = createFileRoute("/nearby")({
  head: () => ({
    meta: [
      { title: "Nearby opportunities — EventRoute" },
      { name: "description", content: "See colleges and event venues around you with travel estimates and a Can I Make It check." },
      { property: "og:title", content: "Nearby opportunities map" },
      { property: "og:description", content: "Colleges, venues and travel estimates from your campus." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Nearby,
});

const W = 640, H = 460;
const lats = colleges.map((c) => c.lat), lngs = colleges.map((c) => c.lng);
const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
const proj = (lat: number, lng: number) => ({
  x: 50 + ((lng - minLng) / (maxLng - minLng)) * (W - 100),
  y: 40 + ((maxLat - lat) / (maxLat - minLat)) * (H - 80),
});

function Nearby() {
  const { profile, set } = useStore();
  const [sel, setSel] = useState<string>(events[0].id);
  const [cat, setCat] = useState<Category | "All">("All");
  const home = collegeById(profile.collegeId);
  const hp = proj(home.lat, home.lng);
  const evs = events.filter((e) => cat === "All" || e.category === cat).sort((a, b) => travelEstimate(profile.collegeId, a.collegeId).minutes - travelEstimate(profile.collegeId, b.collegeId).minutes);
  const selected = events.find((e) => e.id === sel)!;
  const sc = collegeById(selected.collegeId);
  const sp = proj(sc.lat, sc.lng);

  return (
    <>
      <PageHeader title="Nearby opportunities" subtitle={`Distances from ${home.name}. Click a campus to set it as home.`} />
      <div className="mb-4 flex flex-wrap gap-2">
        {(["All", "Hackathon", "Workshop", "Competition", "Conference", "Fest"] as const).map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-3 py-1 text-xs ${cat === c ? "border-primary bg-accent text-accent-foreground" : "text-muted-foreground"}`}>{c}</button>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-4">
          <div className="card-surface overflow-hidden">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
              <defs>
                <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" className="fill-none stroke-border" /></pattern>
              </defs>
              <rect width={W} height={H} fill="url(#grid)" />
              <line x1={hp.x} y1={hp.y} x2={sp.x} y2={sp.y} className="stroke-primary" strokeWidth={2} strokeDasharray="6 5" />
              {colleges.map((c) => {
                const p = proj(c.lat, c.lng);
                const isHome = c.id === profile.collegeId;
                const count = evs.filter((e) => e.collegeId === c.id).length;
                return (
                  <g key={c.id} className="cursor-pointer" onClick={() => set((s) => ({ ...s, profile: { ...s.profile, collegeId: c.id } }))}>
                    {count > 0 && <circle cx={p.x} cy={p.y} r={10 + count * 5} className="fill-primary/15" />}
                    <circle cx={p.x} cy={p.y} r={isHome ? 8 : 6} className={isHome ? "fill-warning stroke-background" : c.id === sc.id ? "fill-primary stroke-background" : "fill-muted-foreground stroke-background"} strokeWidth={2} />
                    <text x={p.x + 12} y={p.y + 4} className="fill-foreground text-[12px] font-medium">{c.short}{isHome ? " (you)" : ""}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          <p className="text-xs text-muted-foreground">Schematic map of sample campuses (positions to scale). Dashed line shows direction, not an actual road route.</p>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="card-surface max-h-72 divide-y overflow-y-auto">
            {evs.map((e) => {
              const t = travelEstimate(profile.collegeId, e.collegeId);
              return (
                <button key={e.id} onClick={() => setSel(e.id)} className={`flex w-full items-center justify-between gap-2 p-3 text-left text-sm ${sel === e.id ? "bg-accent" : "hover:bg-muted/40"}`}>
                  <div className="min-w-0"><p className="truncate font-medium">{e.title}</p><p className="text-xs text-muted-foreground">{collegeById(e.collegeId).short} · {fmtDate(e.start)}</p></div>
                  <Chip>{t.minutes}m · ₹{t.cost}</Chip>
                </button>
              );
            })}
          </div>
          <Link to="/events/$id" params={{ id: selected.id }} className="block text-sm font-medium text-primary">{selected.title} →</Link>
          <CanIMakeIt key={selected.id} e={selected} />
        </div>
      </div>
      <DemoNote />
    </>
  );
}
