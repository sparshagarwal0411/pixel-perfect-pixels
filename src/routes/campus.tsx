import { createFileRoute } from "@tanstack/react-router";
import { Plus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { collegeById, societies, societyById, type CollabRequest } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Chip, DemoNote, PageHeader } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";

export const Route = createFileRoute("/campus")({
  head: () => ({
    meta: [
      { title: "CampusConnect — MargDarshak" },
      { name: "description", content: "College societies discover each other and find partners for hackathons, sponsorships, design and tech." },
      { property: "og:title", content: "CampusConnect for college societies" },
      { property: "og:description", content: "Find collaborators across campuses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CampusRouteComponent,
});

function CampusRouteComponent() {
  return (
    <AuthGate
      featureName="CampusConnect Collab Mesh"
      description="Sign in with your Google student account to discover cross-campus teammates, post collaboration requests, and connect with university societies."
    >
      <Campus />
    </AuthGate>
  );
}

const types: CollabRequest["type"][] = ["Hackathon", "Sponsorship", "Design", "Marketing", "Technical"];

function Campus() {
  const { requests, interests, set } = useStore();
  const [filter, setFilter] = useState<CollabRequest["type"] | "All">("All");
  const [form, setForm] = useState({ societyId: societies[0].id, type: "Technical" as CollabRequest["type"], title: "", details: "" });
  const [open, setOpen] = useState(false);

  const submit = () => {
    if (form.title.trim().length < 4) return toast.error("Add a short title");
    set((s) => ({ ...s, requests: [{ id: crypto.randomUUID(), ...form, title: form.title.trim().slice(0, 120), details: form.details.trim().slice(0, 500), createdAt: new Date().toISOString(), mine: true }, ...s.requests] }));
    setForm({ ...form, title: "", details: "" });
    setOpen(false);
    toast.success("Collaboration request posted");
  };

  const list = requests.filter((r) => filter === "All" || r.type === filter);

  return (
    <>
      <PageHeader title="CampusConnect" subtitle="Societies across campuses, teaming up.">
        <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground"><Plus className="size-4" /> Post request</button>
      </PageHeader>

      {open && (
        <div className="mb-6 card-surface grid gap-3 p-4 md:grid-cols-2 fade-up">
          <select value={form.societyId} onChange={(e) => setForm({ ...form, societyId: e.target.value })} className="rounded-md border border-input bg-background px-2 py-2 text-sm">
            {societies.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CollabRequest["type"] })} className="rounded-md border border-input bg-background px-2 py-2 text-sm">
            {types.map((t) => <option key={t}>{t}</option>)}
          </select>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={120} placeholder="What do you need?" className="rounded-md border border-input bg-background px-3 py-2 text-sm md:col-span-2" />
          <textarea value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} maxLength={500} rows={3} placeholder="Details, timeline, what you offer in return" className="rounded-md border border-input bg-background px-3 py-2 text-sm md:col-span-2" />
          <button onClick={submit} className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground md:col-span-2">Publish</button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {(["All", ...types] as const).map((t) => <button key={t} onClick={() => setFilter(t)} className={`rounded-full border px-3 py-1 text-xs ${filter === t ? "border-primary bg-accent text-accent-foreground" : "text-muted-foreground"}`}>{t}</button>)}
          </div>
          <div className="space-y-3">
            {list.map((r) => {
              const s = societyById(r.societyId)!;
              const on = interests[r.id];
              return (
                <div key={r.id} className="card-surface p-4 fade-up">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="mb-1.5 flex gap-1.5"><Chip tone="primary">{r.type}</Chip>{r.mine && <Chip tone="success">Yours</Chip>}</div>
                      <p className="font-medium">{r.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{s.name} · {collegeById(s.collegeId).short}</p>
                    </div>
                    {!r.mine && <button onClick={() => { set((st) => ({ ...st, interests: { ...st.interests, [r.id]: !on } })); if (!on) toast.success(`Interest sent to ${s.name}`); }} className={`shrink-0 rounded-md border px-3 py-1.5 text-xs ${on ? "border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}>{on ? "Interested ✓" : "I'm interested"}</button>}
                  </div>
                  {r.details && <p className="mt-2 text-sm text-muted-foreground">{r.details}</p>}
                </div>
              );
            })}
          </div>
        </section>
        <section>
          <h2 className="mb-3 text-sm font-medium">Societies</h2>
          <div className="space-y-2">
            {societies.map((s) => (
              <div key={s.id} className="card-surface p-3">
                <div className="flex items-center justify-between"><p className="text-sm font-medium">{s.name}</p><span className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="size-3" />{s.members}</span></div>
                <p className="text-xs text-muted-foreground">{collegeById(s.collegeId).short} · {s.about}</p>
                <div className="mt-2 flex flex-wrap gap-1">{s.focus.map((f) => <Chip key={f}>{f}</Chip>)}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <DemoNote />
    </>
  );
}
