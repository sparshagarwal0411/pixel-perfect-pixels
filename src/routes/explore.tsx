import { createFileRoute } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { colleges, collegeById, type Category } from "@/lib/data";
import { avgRating, fmtDate, fmtMoney, travelEstimate } from "@/lib/logic";
import { useStore } from "@/lib/store";
import { DemoNote, PageHeader } from "@/components/AppShell";
import { EventCard } from "@/components/EventCard";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore events — MargDarshak" },
      { name: "description", content: "Search hackathons, workshops, fests and conferences across colleges and compare them side by side." },
      { property: "og:title", content: "Explore inter-college events" },
      { property: "og:description", content: "Search, filter and compare events across campuses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Explore,
});

const cats: (Category | "All")[] = ["All", "Hackathon", "Workshop", "Competition", "Conference", "Fest"];

function Explore() {
  const { events, profile, userReviews } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "All">("All");
  const [college, setCollege] = useState("all");
  const [freeOnly, setFreeOnly] = useState(false);
  const [sort, setSort] = useState<"date" | "fee">("date");
  const [compare, setCompare] = useState<string[]>([]);

  const list = useMemo(() => {
    const out = events.filter((e) =>
      (cat === "All" || e.category === cat) &&
      (college === "all" || e.collegeId === college) &&
      (!freeOnly || e.fee === 0) &&
      (q === "" || [e.title, e.organizer, ...e.tags].join(" ").toLowerCase().includes(q.toLowerCase())),
    );
    return out.sort((a, b) =>
      sort === "date" ? +new Date(a.start) - +new Date(b.start)
      : sort === "fee" ? a.fee - b.fee
      : 0,
    );
  }, [q, cat, college, freeOnly, sort, profile, userReviews]);

  const toggle = (id: string) => setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? c : [...c, id]));
  const cmp = compare.map((id) => events.find((e) => e.id === id)!);

  return (
    <>
      <PageHeader title="Explore events" subtitle={`${list.length} opportunities across ${colleges.length} campuses`} />
      <div className="mb-6 flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, organizer or tag (AI, Design…)" className="w-full rounded-lg border border-input bg-card py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-3 py-1 text-xs ${cat === c ? "border-primary bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}>{c}</button>
          ))}
          <select value={college} onChange={(e) => setCollege(e.target.value)} className="rounded-md border border-input bg-card px-2 py-1 text-xs">
            <option value="all">All colleges</option>
            {colleges.map((c) => <option key={c.id} value={c.id}>{c.short}</option>)}
          </select>
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground"><input type="checkbox" checked={freeOnly} onChange={(e) => setFreeOnly(e.target.checked)} className="accent-primary" /> Free only</label>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="ml-auto rounded-md border border-input bg-card px-2 py-1 text-xs">
            <option value="date">Sort: Date</option>
            <option value="fee">Sort: Fee</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((e) => <EventCard key={e.id} e={e} compareSelected={compare.includes(e.id)} onCompare={() => toggle(e.id)} />)}
      </div>
      {list.length === 0 && <p className="py-16 text-center text-sm text-muted-foreground">No events match those filters.</p>}

      {cmp.length > 0 && (
        <div className="sticky bottom-4 mt-8 card-surface overflow-x-auto p-4 fade-up">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium">Compare ({cmp.length}/3)</p>
            <button onClick={() => setCompare([])} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
          </div>
          <table className="w-full min-w-[520px] text-sm">
            <tbody>
              {[
                ["Event", (e: typeof cmp[0]) => <b>{e.title}</b>],
                ["Where", (e: typeof cmp[0]) => collegeById(e.collegeId).short],
                ["Date", (e: typeof cmp[0]) => fmtDate(e.start)],
                ["Fee", (e: typeof cmp[0]) => fmtMoney(e.fee)],
                ["Travel (est.)", (e: typeof cmp[0]) => { const t = travelEstimate(profile.collegeId, e.collegeId); return `${t.minutes} min · ₹${t.cost}`; }],
                ["Rating", (e: typeof cmp[0]) => avgRating([...e.reviews, ...(userReviews[e.id] ?? [])])?.toFixed(1) ?? "—"],
              ].map(([label, fn]) => (
                <tr key={label as string} className="border-t">
                  <td className="py-2 pr-4 text-xs text-muted-foreground">{label as string}</td>
                  {cmp.map((e) => <td key={e.id} className="py-2 pr-4">{(fn as (e: typeof cmp[0]) => React.ReactNode)(e)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <DemoNote />
    </>
  );
}
