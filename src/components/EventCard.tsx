import { Link } from "@tanstack/react-router";
import { Bookmark, CheckCircle2, MapPin, Star } from "lucide-react";
import { toast } from "sonner";
import { collegeById, type EventItem } from "@/lib/data";
import { avgRating, fmtDate, fmtMoney } from "@/lib/logic";
import { useStore } from "@/lib/store";
import { Chip } from "./AppShell";

export function EventCard({ e, compareSelected, onCompare }: { e: EventItem; compareSelected?: boolean; onCompare?: () => void }) {
  const { saved = [], toggleSave, userReviews = {}, statuses = {}, setStatus } = useStore();
  const eventReviews = Array.isArray(e.reviews) ? e.reviews : [];
  const myReviews = Array.isArray(userReviews?.[e.id]) ? userReviews[e.id] : [];
  const allReviews = [...eventReviews, ...myReviews];
  const avg = avgRating(allReviews);
  const isSaved = Boolean(saved?.includes(e.id));
  const isRegistered = statuses?.[e.id] === "Registered";
  const isAttended = statuses?.[e.id] === "Attended";

  const handleRegisterToggle = (checked: boolean) => {
    if (checked) {
      setStatus(e.id, "Registered");
      toast.success(`Registered for ${e.title}`, {
        description: "Added to your registered competitions table on dashboard.",
      });
    } else {
      setStatus(e.id, null);
      toast.info(`Unregistered from ${e.title}`);
    }
  };

  return (
    <div
      className={`group card-surface flex flex-col p-4 transition-all hover:-translate-y-0.5 fade-up ${
        isRegistered ? "border-primary/50 shadow-sm ring-1 ring-primary/20" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap gap-1.5">
            <Chip tone="primary">{e.category}</Chip>
            {isRegistered && <Chip tone="success">Registered ✓</Chip>}
            {isAttended && <Chip tone="success">Attended 🏆</Chip>}
            {!isRegistered && !isAttended && statuses[e.id] && (
              <Chip tone="default">{statuses[e.id]}</Chip>
            )}
            {e.prize && <Chip tone="warning">{e.prize}</Chip>}
          </div>
          <Link to="/events/$id" params={{ id: e.id }} className="block truncate font-medium hover:text-primary">{e.title}</Link>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" /> {collegeById(e.collegeId).short} · {e.organizer}
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <div><p className="text-muted-foreground">Date</p><p className="font-medium">{fmtDate(e.start)}</p></div>
        <div><p className="text-muted-foreground">Fee</p><p className="font-medium">{fmtMoney(e.fee)}</p></div>
        <div><p className="text-muted-foreground">Rating</p><p className="flex items-center gap-1 font-medium">{avg ? <><Star className="size-3 fill-warning text-warning" />{avg.toFixed(1)} <span className="text-muted-foreground">({allReviews.length})</span></> : <span className="text-muted-foreground">No reviews</span>}</p></div>
      </div>
      <p className="mt-3 line-clamp-1 text-xs text-muted-foreground">{e.eligibility}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
        {/* Register Checkbox */}
        <label
          onClick={(ev) => ev.stopPropagation()}
          className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            isRegistered
              ? "bg-primary/15 text-primary border border-primary/30"
              : "border border-border/70 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
          }`}
          title={isRegistered ? "You are registered" : "Tick to register"}
        >
          <input
            type="checkbox"
            checked={isRegistered}
            onChange={(ev) => handleRegisterToggle(ev.target.checked)}
            className="size-3.5 rounded border-input text-primary accent-primary cursor-pointer focus:ring-primary"
          />
          <span>{isRegistered ? "Registered" : "Register"}</span>
        </label>

        <button onClick={() => toggleSave(e.id)} className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs ${isSaved ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
          <Bookmark className={`size-3.5 ${isSaved ? "fill-current" : ""}`} /> {isSaved ? "Saved" : "Save"}
        </button>
        {onCompare && (
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
            <input type="checkbox" checked={!!compareSelected} onChange={onCompare} className="accent-primary" /> Compare
          </label>
        )}
        <Link to="/events/$id" params={{ id: e.id }} className="ml-auto text-xs font-semibold text-primary hover:underline">Details & Map →</Link>
      </div>
    </div>
  );
}
