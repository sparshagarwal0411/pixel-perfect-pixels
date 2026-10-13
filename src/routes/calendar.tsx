import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { fmtDate } from "@/lib/logic";
import { useStore, type Status } from "@/lib/store";
import { Chip, PageHeader } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar & tracker — AvsarMarg" },
      { name: "description", content: "Your event calendar, registration statuses, deadlines and reminders." },
      { property: "og:title", content: "Event calendar & registration tracker" },
      { property: "og:description", content: "Track every registration and deadline." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CalendarRouteComponent,
});

function CalendarRouteComponent() {
  return (
    <AuthGate
      featureName="Personal Calendar & Schedule Tracker"
      description="Sign in with your Google student account to access your personal event tracker, deadline reminders, and synchronized academic schedule."
    >
      <CalendarPage />
    </AuthGate>
  );
}

const tone: Record<Status, "primary" | "success" | "default" | "destructive"> = { Interested: "default", Registered: "primary", Attended: "success", Skipped: "destructive" };

function CalendarPage() {
  const { events, statuses, saved, setStatus, reminders, toggleReminder } = useStore();
  const [offset, setOffset] = useState(0);
  const base = new Date(); base.setDate(1); base.setMonth(base.getMonth() + offset);
  const first = (base.getDay() + 6) % 7;
  const days = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const tracked = events.filter((e) => statuses[e.id] || saved.includes(e.id));
  const cells = Array.from({ length: first + days }, (_, i) => (i < first ? null : i - first + 1));

  return (
    <>
      <PageHeader title="Calendar & tracker" subtitle="Saved and tracked events, with deadlines marked." />
      <div className="card-surface p-4 fade-up">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-medium">{base.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>
          <div className="flex gap-1">
            <button onClick={() => setOffset(offset - 1)} className="rounded-md border p-1"><ChevronLeft className="size-4" /></button>
            <button onClick={() => setOffset(offset + 1)} className="rounded-md border p-1"><ChevronRight className="size-4" /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg bg-border text-xs">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="bg-card p-2 text-muted-foreground">{d}</div>)}
          {cells.map((day, i) => {
            const date = day ? new Date(base.getFullYear(), base.getMonth(), day) : null;
            const ds = date?.toDateString();
            const evs = tracked.filter((e) => new Date(e.start).toDateString() === ds);
            const dls = tracked.filter((e) => new Date(e.deadline).toDateString() === ds);
            const today = ds === new Date().toDateString();
            return (
              <div key={i} className="min-h-20 bg-card p-1.5">
                {day && <p className={`mb-1 font-mono ${today ? "inline-grid size-5 place-items-center rounded-full bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{day}</p>}
                {evs.map((e) => <Link key={e.id} to="/events/$id" params={{ id: e.id }} className={`mb-0.5 block truncate rounded px-1 py-0.5 ${statuses[e.id] === "Registered" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{e.title}</Link>)}
                {dls.map((e) => <p key={e.id} className="truncate px-1 text-warning">⏰ {e.title}</p>)}
              </div>
            );
          })}
        </div>
      </div>

      <h2 className="mb-3 mt-8 text-sm font-medium">Registration tracker</h2>
      <div className="card-surface overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="text-left text-xs text-muted-foreground"><tr><th className="p-3">Event</th><th>Date</th><th>Deadline</th><th>Status</th><th>Reminder</th></tr></thead>
          <tbody>
            {tracked.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Nothing tracked yet.</td></tr>}
            {tracked.map((e) => {
              const st = statuses[e.id];
              const left = Math.ceil((+new Date(e.deadline) - Date.now()) / 86400000);
              return (
                <tr key={e.id} className="border-t">
                  <td className="p-3"><Link to="/events/$id" params={{ id: e.id }} className="font-medium hover:text-primary">{e.title}</Link></td>
                  <td>{fmtDate(e.start)}</td>
                  <td>{left > 0 ? <Chip tone={left <= 3 ? "destructive" : "default"}>{left}d left</Chip> : <Chip>Closed</Chip>}</td>
                  <td>
                    <select value={st ?? ""} onChange={(ev) => setStatus(e.id, (ev.target.value || null) as Status | null)} className="rounded-md border border-input bg-background px-2 py-1 text-xs">
                      <option value="">Saved</option>
                      {(["Interested", "Registered", "Attended", "Skipped"] as Status[]).map((s) => <option key={s}>{s}</option>)}
                    </select>
                    {st && <span className="ml-2"><Chip tone={tone[st]}>{st}</Chip></span>}
                  </td>
                  <td><input type="checkbox" checked={reminders.includes(e.id)} onChange={() => toggleReminder(e.id)} className="accent-primary" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
