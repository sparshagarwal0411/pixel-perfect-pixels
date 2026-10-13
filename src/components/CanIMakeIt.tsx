import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { events, type EventItem } from "@/lib/data";
import { canIMakeIt, fmtTime } from "@/lib/logic";
import { useStore } from "@/lib/store";

export function CanIMakeIt({ e }: { e: EventItem }) {
  const { profile, statuses } = useStore();
  const startHour = new Date(e.start).getHours();
  const [leave, setLeave] = useState(Math.max(6, startHour - 1));
  const committed = events.filter((x) => statuses[x.id] === "Registered");
  const res = canIMakeIt(e, profile, committed, leave);
  const Row = ({ ok, label, detail }: { ok: boolean; label: string; detail: string }) => (
    <div className="flex items-start gap-2.5 py-2">
      {ok ? <CheckCircle2 className="mt-0.5 size-4 text-success" /> : <XCircle className="mt-0.5 size-4 text-destructive" />}
      <div><p className="text-sm font-medium">{label}</p><p className="text-xs text-muted-foreground">{detail}</p></div>
    </div>
  );
  return (
    <div className="card-surface p-4">
      <div className="flex items-center justify-between">
        <p className="font-medium">Can I make it?</p>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${res.ok ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>{res.ok ? "Yes, go for it" : "Not quite"}</span>
      </div>
      <label className="mt-3 block text-xs text-muted-foreground">I can leave campus at <b className="font-mono text-foreground">{leave}:00</b></label>
      <input type="range" min={5} max={22} value={leave} onChange={(ev) => setLeave(+ev.target.value)} className="w-full accent-primary" />
      <div className="mt-2 divide-y">
        <Row ok={res.onTime} label="Timing" detail={`Arrive ≈ ${fmtTime(res.arrival.toISOString())} for a ${fmtTime(e.start)} start (~${res.travel.minutes} min, ${res.travel.km} km est.)`} />
        <Row ok={res.withinBudget} label="Budget" detail={`Fee + round trip ≈ ₹${res.total} vs your ₹${profile.budget}`} />
        <Row ok={res.conflicts.length === 0} label="Schedule" detail={res.conflicts.length ? `Clashes with ${res.conflicts.map((c) => c.title).join(", ")}` : "No clash with your registered events"} />
        <Row ok={res.deadlineOpen} label="Registration" detail={res.deadlineOpen ? "Registration still open" : "Deadline has passed"} />
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">Travel is a straight-line estimate, not a live route.</p>
    </div>
  );
}
