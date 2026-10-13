import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Bell, Bookmark, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { collegeById, eventById } from "@/lib/data";
import { avgRating, fmtDate, fmtMoney, fmtTime, worthIt } from "@/lib/logic";
import { useStore, type Status } from "@/lib/store";
import { Chip, ScoreRing } from "@/components/AppShell";
import { CanIMakeIt } from "@/components/CanIMakeIt";

export const Route = createFileRoute("/events/$id")({
  loader: ({ params }) => {
    const e = eventById(params.id);
    if (!e) throw notFound();
    return { e };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.e.title} — EventRoute` : "Event — EventRoute" },
      { name: "description", content: loaderData?.e.description ?? "Event details" },
      { property: "og:title", content: loaderData?.e.title ?? "Event" },
      { property: "og:description", content: loaderData?.e.description ?? "Event details" },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EventPage,
});

const statuses: Status[] = ["Interested", "Registered", "Attended", "Skipped"];

function EventPage() {
  const { e } = Route.useLoaderData();
  const store = useStore();
  const mine = store.userReviews[e.id] ?? [];
  const all = [...e.reviews, ...mine];
  const w = worthIt(e, store.profile, mine);
  const avg = avgRating(all);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const c = collegeById(e.collegeId);

  const addReview = () => {
    if (!text.trim()) return;
    store.set((s) => ({ ...s, userReviews: { ...s.userReviews, [e.id]: [...(s.userReviews[e.id] ?? []), { author: "You", rating, text: text.trim().slice(0, 400) }] } }));
    setText("");
    toast.success("Review added");
  };

  return (
    <div className="fade-up">
      <Link to="/explore" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Explore</Link>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <div className="mb-2 flex gap-1.5"><Chip tone="primary">{e.category}</Chip>{e.prize && <Chip tone="warning">{e.prize}</Chip>}</div>
            <h1 className="text-3xl font-semibold tracking-tight">{e.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">by {e.organizer} · {c.name}</p>
            <p className="mt-4 text-sm leading-relaxed">{e.description}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">{e.tags.map((t) => <Chip key={t}>{t}</Chip>)}</div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[["Starts", `${fmtDate(e.start)}, ${fmtTime(e.start)}`], ["Ends", `${fmtDate(e.end)}, ${fmtTime(e.end)}`], ["Register by", fmtDate(e.deadline)], ["Fee", fmtMoney(e.fee)]].map(([k, v]) => (
              <div key={k} className="card-surface p-3"><p className="text-xs text-muted-foreground">{k}</p><p className="mt-1 text-sm font-medium">{v}</p></div>
            ))}
          </div>
          <div className="card-surface p-4"><p className="text-xs text-muted-foreground">Eligibility</p><p className="mt-1 text-sm">{e.eligibility}</p></div>

          <div className="card-surface p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">Reviews</p>
              <p className="flex items-center gap-1 text-sm">{avg ? <><Star className="size-4 fill-warning text-warning" /> {avg.toFixed(1)} · {all.length}</> : <span className="text-muted-foreground">No reviews yet</span>}</p>
            </div>
            <div className="mt-3 space-y-3">
              {all.map((r, i) => (
                <div key={i} className="border-t pt-3 text-sm">
                  <p className="flex items-center gap-2 font-medium">{r.author} <span className="text-warning">{"★".repeat(r.rating)}</span></p>
                  <p className="text-muted-foreground">{r.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t pt-4">
              <p className="mb-2 text-xs text-muted-foreground">Attended? Share honest feedback.</p>
              <div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setRating(n)} className={n <= rating ? "text-warning" : "text-muted-foreground"}>★</button>)}</div>
              <textarea value={text} onChange={(ev) => setText(ev.target.value)} maxLength={400} rows={2} className="mt-2 w-full rounded-md border border-input bg-background p-2 text-sm" placeholder="What was it actually like?" />
              <button onClick={addReview} className="mt-2 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">Post review</button>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card-surface p-4">
            <div className="flex items-center gap-3"><ScoreRing score={w.score} size={56} /><div><p className="font-medium">Worth-It Score</p><p className="text-xs text-muted-foreground">For you, from {collegeById(store.profile.collegeId).short}</p></div></div>
            <div className="mt-4 space-y-2">
              {w.parts.map((p) => (
                <div key={p.key}>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">{p.key} · {Math.round(p.weight * 100)}%</span><span className="font-mono">{Math.round(p.value)}</span></div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${p.value}%` }} /></div>
                </div>
              ))}
            </div>
            {w.parts.length === 4 && <p className="mt-3 text-[11px] text-muted-foreground">No community reviews yet — excluded rather than guessed.</p>}
          </div>

          <div className="card-surface space-y-3 p-4">
            <p className="text-xs text-muted-foreground">Track this event</p>
            <div className="grid grid-cols-2 gap-1.5">
              {statuses.map((s) => (
                <button key={s} onClick={() => { store.setStatus(e.id, store.statuses[e.id] === s ? null : s); toast(`Marked ${s}`); }} className={`rounded-md border px-2 py-1.5 text-xs ${store.statuses[e.id] === s ? "border-primary bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}>{s}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => store.toggleSave(e.id)} className="flex flex-1 items-center justify-center gap-1.5 rounded-md border py-1.5 text-xs"><Bookmark className={`size-3.5 ${store.saved.includes(e.id) ? "fill-primary text-primary" : ""}`} /> {store.saved.includes(e.id) ? "Saved" : "Save"}</button>
              <button onClick={() => store.toggleReminder(e.id)} className="flex flex-1 items-center justify-center gap-1.5 rounded-md border py-1.5 text-xs"><Bell className={`size-3.5 ${store.reminders.includes(e.id) ? "fill-primary text-primary" : ""}`} /> {store.reminders.includes(e.id) ? "Reminder on" : "Remind me"}</button>
            </div>
          </div>
          <CanIMakeIt e={e} />
        </aside>
      </div>
    </div>
  );
}
