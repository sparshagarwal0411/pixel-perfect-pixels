import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthGate } from "@/components/AuthGate";
import { Chip, PageHeader } from "@/components/AppShell";
import { fmtDate } from "@/lib/logic";
import { useStore, type Status } from "@/lib/store";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Competition history — AvsarMarg" },
      { name: "description", content: "Review competitions and events you enrolled in on AvsarMarg." },
    ],
  }),
  component: HistoryRoute,
});

function HistoryRoute() {
  return (
    <AuthGate
      featureName="Competition history"
      description="Sign in with Google to view the competitions you enrolled in."
    >
      <HistoryPage />
    </AuthGate>
  );
}

function HistoryPage() {
  const { events, statuses } = useStore();
  const enrolled = events
    .filter((event) => statuses[event.id] === "Registered" || statuses[event.id] === "Attended")
    .sort((a, b) => +new Date(b.start) - +new Date(a.start));

  return (
    <>
      <PageHeader title="Competition history" subtitle="Events you marked as registered or attended." />
      <div className="card-surface divide-y">
        {enrolled.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Your enrolled competitions will appear here after you mark an event as Registered.
          </p>
        )}
        {enrolled.map((event) => {
          const status = statuses[event.id] as Status;
          return (
            <Link key={event.id} to="/events/$id" params={{ id: event.id }} className="flex items-center justify-between gap-4 p-4 hover:bg-muted/30">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{event.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{event.organizer} · {fmtDate(event.start)}</p>
              </div>
              <Chip tone={status === "Attended" ? "success" : "primary"}>{status}</Chip>
            </Link>
          );
        })}
      </div>
    </>
  );
}
