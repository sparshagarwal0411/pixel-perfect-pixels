import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { seedRequests, type CollabRequest, type Review } from "./data";
import type { Profile } from "./logic";

export type Status = "Interested" | "Registered" | "Attended" | "Skipped";

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  collegeId: string;
  collegeName: string;
  department: string;
  verified: boolean;
  role: string;
}

export const PRESET_GOOGLE_USERS: GoogleUser[] = [
  {
    id: "usr_sparsh",
    name: "Sparsh Agarwal",
    email: "sparsh.agarwal@dtu.ac.in",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    collegeId: "dtu",
    collegeName: "Delhi Technological University",
    department: "Computer Engineering '26",
    verified: true,
    role: "Fullstack & Hackathon Lead",
  },
  {
    id: "usr_alex",
    name: "Alex Chen",
    email: "alex.chen@iitd.ac.in",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    collegeId: "iitd",
    collegeName: "IIT Delhi",
    department: "Computer Science & AI",
    verified: true,
    role: "ML Researcher & Hacker",
  },
  {
    id: "usr_priya",
    name: "Priya Sharma",
    email: "priya.sharma@nsut.ac.in",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    collegeId: "nsut",
    collegeName: "Netaji Subhas Univ of Tech",
    department: "Information Technology",
    verified: true,
    role: "UI/UX Designer & Frontend",
  },
];

interface State {
  user: GoogleUser | null;
  profile: Profile;
  saved: string[];
  statuses: Record<string, Status>;
  reminders: string[];
  userReviews: Record<string, Review[]>;
  requests: CollabRequest[];
  interests: Record<string, boolean>; // collab request ids I responded to
  theme: "dark" | "light";
  authModalOpen: boolean;
}

const initial: State = {
  user: null, // default to unauthenticated so first landing page showcases full features + Google Auth!
  profile: { name: "Student", collegeId: "dtu", interests: ["AI", "Web", "Design"], budget: 800, goals: "Win a hackathon this semester" },
  saved: ["e1", "e5"],
  statuses: { e1: "Registered" },
  reminders: ["e1"],
  userReviews: {},
  requests: seedRequests,
  interests: {},
  theme: "dark",
  authModalOpen: false,
};

interface Ctx extends State {
  set: (fn: (s: State) => State) => void;
  toggleSave: (id: string) => void;
  setStatus: (id: string, s: Status | null) => void;
  toggleReminder: (id: string) => void;
  loginWithGoogle: (customUser?: Partial<GoogleUser>) => void;
  logout: () => void;
  setAuthModalOpen: (open: boolean) => void;
}

const StoreCtx = createContext<Ctx | null>(null);
const KEY = "eventroute:v2";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setState((prev) => ({
          ...prev,
          ...parsed,
          authModalOpen: false, // never persist open modal state
        }));
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      // exclude modal state from storage
      const toSave = { ...state, authModalOpen: false };
      localStorage.setItem(KEY, JSON.stringify(toSave));
    }
    document.documentElement.classList.toggle("dark", state.theme === "dark");
  }, [state, loaded]);

  const set = (fn: (s: State) => State) => setState(fn);

  const loginWithGoogle = (customUser?: Partial<GoogleUser>) => {
    const selected = customUser?.name
      ? {
          id: customUser.id || `usr_${Date.now()}`,
          name: customUser.name,
          email: customUser.email || `${customUser.name.toLowerCase().replace(/\s+/g, ".")}@student.edu`,
          avatar: customUser.avatar || PRESET_GOOGLE_USERS[0].avatar,
          collegeId: customUser.collegeId || "dtu",
          collegeName: customUser.collegeName || "Delhi Technological University",
          department: customUser.department || "Engineering",
          verified: true,
          role: customUser.role || "Student Hacker",
        }
      : PRESET_GOOGLE_USERS[0];

    setState((s) => ({
      ...s,
      user: selected,
      authModalOpen: false,
      profile: {
        ...s.profile,
        name: selected.name,
        collegeId: selected.collegeId,
      },
    }));

    toast.success(`Google Account Connected: ${selected.name}`, {
      description: `Access granted across all campus telemetry nodes (${selected.email})`,
    });
  };

  const logout = () => {
    setState((s) => ({
      ...s,
      user: null,
      authModalOpen: false,
      profile: {
        ...s.profile,
        name: "Student",
      },
    }));
    toast.info("Signed out of Google Account", {
      description: "Returning to public guest mode.",
    });
  };

  const setAuthModalOpen = (open: boolean) => {
    setState((s) => ({ ...s, authModalOpen: open }));
  };

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
    loginWithGoogle,
    logout,
    setAuthModalOpen,
  };

  return <StoreCtx.Provider value={ctx}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}
