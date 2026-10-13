import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { seedRequests, type CollabRequest, type Review } from "./data";
import type { Profile } from "./logic";

export type Status = "Interested" | "Registered" | "Attended" | "Skipped";

interface State {
  profile: Profile;
  saved: string[];
  statuses: Record<string, Status>;
  reminders: string[];
  userReviews: Record<string, Review[]>;
  requests: CollabRequest[];
  interests: Record<string, boolean>; // collab request ids I responded to
  theme: "dark" | "light";
}

const initial: State = {
  profile: { name: "Student", collegeId: "dtu", interests: ["AI", "Web", "Design"], budget: 800, goals: "Win a hackathon this semester" },
  saved: ["e1", "e5"],
  statuses: { e1: "Registered" },
  reminders: ["e1"],
  userReviews: {},
  requests: seedRequests,
  interests: {},
  theme: "dark",
};

interface Ctx extends State {
  set: (fn: (s: State) => State) => void;
  toggleSave: (id: string) => void;
  setStatus: (id: string, s: Status | null) => void;
  toggleReminder: (id: string) => void;
}

const StoreCtx = createContext<Ctx | null>(null);
const KEY = "eventroute:v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...initial, ...JSON.parse(raw) });
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(state));
    document.documentElement.classList.toggle("dark", state.theme === "dark");
  }, [state, loaded]);

  const set = (fn: (s: State) => State) => setState(fn);
  const ctx: Ctx = {
    ...state,
    set,
    toggleSave: (id) =>
      set((s) => ({ ...s, saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [...s.saved, id] })),
    setStatus: (id, st) =>
      set((s) => {
        const statuses = { ...s.statuses };
        if (st) statuses[id] = st;
        else delete statuses[id];
        return { ...s, statuses };
      }),
    toggleReminder: (id) =>
      set((s) => ({ ...s, reminders: s.reminders.includes(id) ? s.reminders.filter((x) => x !== id) : [...s.reminders, id] })),
  };
  return <StoreCtx.Provider value={ctx}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}
