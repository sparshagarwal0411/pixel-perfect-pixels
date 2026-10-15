import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Bell, Bookmark, CheckCircle2, MapPin, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { collegeById } from "@/lib/data";
import { avgRating, fmtDate, fmtMoney, fmtTime } from "@/lib/logic";
import { useStore, type Status } from "@/lib/store";
import { Chip } from "@/components/AppShell";
import { CanIMakeIt } from "@/components/CanIMakeIt";
import { EventRouteMap } from "@/components/EventRouteMap";

export const Route = createFileRoute("/events/$id")({
  loader: ({ params }) => ({ id: params.id }),
  head: ({ loaderData }) => ({
    meta: [
      { title: "Event — AvsarMarg" },
      { name: "description", content: "Event details, venue directions and transit route map." },
      { property: "og:title", content: "Event & Route Map" },
      { property: "og:description", content: "Event details and campus transit map" },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EventPage,
});

const statuses: Status[] = ["Interested", "Registered", "Attended", "Skipped"];

function EventPage() {
  const store = useStore();
  const e = store.events.find((event) => event.id === Route.useLoaderData().id);
  if (!e) {
    throw notFound();
  }
  const mine = store.userReviews[e.id] ?? [];
  const all = [...e.reviews, ...mine];
  const avg = avgRating(all);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const c = collegeById(e.collegeId);
  const homeCollege = collegeById(store.profile.collegeId);
  const isRegistered = store.statuses[e.id] === "Registered";

  const handleRegisterToggle = (checked: boolean) => {
    store.setStatus(e.id, checked ? "Registered" : null);
    if (checked) {
      toast.success(`Registered for ${e.title}!`, {
        description: "Synced to your registered competitions table on dashboard.",
      });
    } else {
      toast.info(`Unregistered from ${e.title}`);
    }
  };

  const addReview = () => {
    if (!text.trim()) return;
    store.set((s) => ({ ...s, userReviews: { ...s.userReviews, [e.id]: [...(s.userReviews[e.id] ?? []), { author: "You", rating, text: text.trim().slice(0, 400) }] } }));
    setText("");
    toast.success("Review added");
  };

  return (
    <div className="fade-up">
      <Link to="/explore" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to Explore
      </Link>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <div className="mb-2 flex flex-wrap gap-1.5">
              <Chip tone="primary">{e.category}</Chip>
              {isRegistered && <Chip tone="success">Registered ✓</Chip>}
              {store.statuses[e.id] === "Attended" && <Chip tone="success">Attended 🏆</Chip>}
              {e.prize && <Chip tone="warning">{e.prize}</Chip>}
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{e.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              by <span className="font-semibold text-foreground">{e.organizer}</span> · {c.name} ({c.metro})
            </p>
            <p className="mt-4 text-sm leading-relaxed text-foreground/90">{e.description}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">{e.tags.map((t) => <Chip key={t}>{t}</Chip>)}</div>
          </div>

          {/* Registration Checkbox Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/40 bg-primary/10 p-4 transition-colors">
            <label htmlFor="event-register-toggle" className="flex items-center gap-3 cursor-pointer select-none">
              <input
                id="event-register-toggle"
                type="checkbox"
                checked={isRegistered}
                onChange={(ev) => handleRegisterToggle(ev.target.checked)}
                className="size-5 rounded border-primary text-primary accent-primary cursor-pointer focus:ring-primary"
              />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {isRegistered ? "You are registered for this competition ✓" : "Register for this competition"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isRegistered
                    ? "Tracked in your registered competitions table on dashboard."
                    : "Tick this checkbox to register and display this event on your dashboard."}
                </p>
              </div>
            </label>
            {isRegistered && (
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                Registered
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[["Starts", `${fmtDate(e.start)}, ${fmtTime(e.start)}`], ["Ends", `${fmtDate(e.end)}, ${fmtTime(e.end)}`], ["Register by", fmtDate(e.deadline)], ["Fee", fmtMoney(e.fee)]].map(([k, v]) => (
              <div key={k} className="card-surface p-3"><p className="text-xs text-muted-foreground">{k}</p><p className="mt-1 text-sm font-medium">{v}</p></div>
            ))}
          </div>

          {/* Map and Route Path Section */}
          <EventRouteMap event={e} homeCollege={homeCollege} />

          <div className="card-surface p-4">
            <p className="text-xs text-muted-foreground">Eligibility</p>
            <p className="mt-1 text-sm">{e.eligibility}</p>
          </div>

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
            <p className="text-xs text-muted-foreground">Track this event</p>

            {/* Quick Registration Checkbox in sidebar */}
            <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-border p-2 text-xs hover:bg-muted/50">
              <input
                type="checkbox"
                checked={isRegistered}
                onChange={(ev) => handleRegisterToggle(ev.target.checked)}
                className="size-4 rounded border-input text-primary accent-primary cursor-pointer"
              />
              <span className={isRegistered ? "font-semibold text-primary" : "text-foreground"}>
                {isRegistered ? "Registered ✓" : "Mark as Registered"}
              </span>
            </label>

            <div className="grid grid-cols-2 gap-1.5">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    store.setStatus(e.id, store.statuses[e.id] === s ? null : s);
                    toast(`Marked ${s}`);
                  }}
                  className={`rounded-md border px-2 py-1.5 text-xs ${
                    store.statuses[e.id] === s
                      ? "border-primary bg-accent text-accent-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
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
