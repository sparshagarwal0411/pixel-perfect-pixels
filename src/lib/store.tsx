import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  events as demoEvents,
  seedRequests,
  type CollabRequest,
  type EventItem,
  type Review,
} from "./data";
import type { Profile } from "./logic";
import { supabase, isSupabaseConfigured } from "./supabase";
import { loadEvents } from "./remote-events";

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
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
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
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
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
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    collegeId: "nsut",
    collegeName: "Netaji Subhas Univ of Tech",
    department: "Information Technology",
    verified: true,
    role: "UI/UX Designer & Frontend",
  },
];

interface State {
  user: GoogleUser | null;
  events: EventItem[];
  profile: Profile;
  saved: string[];
  statuses: Record<string, Status>;
  reminders: string[];
  userReviews: Record<string, Review[]>;
  requests: CollabRequest[];
  interests: Record<string, boolean>; // collab request ids I responded to
  theme: "dark" | "light";
  authModalOpen: boolean;
  isRealSupabase: boolean;
}

const initial: State = {
  user: null, // default to unauthenticated
  events: demoEvents,
  profile: {
    name: "Student",
    collegeId: "dtu",
    interests: ["AI", "Web", "Design"],
    budget: 800,
    goals: "Win a hackathon this semester",
  },
  saved: ["e1", "e5"],
  statuses: { e1: "Registered" },
  reminders: ["e1"],
  userReviews: {},
  requests: seedRequests,
  interests: {},
  theme: "dark",
  authModalOpen: false,
  isRealSupabase: isSupabaseConfigured,
};

interface Ctx extends State {
  set: (fn: (s: State) => State) => void;
  toggleSave: (id: string) => void;
  setStatus: (id: string, s: Status | null) => void;
  toggleReminder: (id: string) => void;
  loginWithGoogle: (customUser?: Partial<GoogleUser>) => Promise<void>;
  logout: () => Promise<void>;
  setAuthModalOpen: (open: boolean) => void;
}

const StoreCtx = createContext<Ctx | null>(null);
const KEY = "AvsarMarg:v2";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [loaded, setLoaded] = useState(false);

  // 1. Load persisted state or active Supabase session
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setState((prev) => ({
          ...prev,
          ...parsed,
          authModalOpen: false,
          isRealSupabase: isSupabaseConfigured,
        }));
      }
    } catch {}

    // Check live Supabase session if configured
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const u = session.user;
          const meta = u.user_metadata || {};
          const liveUser: GoogleUser = {
            id: u.id,
            name: meta.full_name || meta.name || u.email?.split("@")[0] || "Student",
            email: u.email || "",
            avatar: meta.avatar_url || meta.picture || PRESET_GOOGLE_USERS[0].avatar,
            collegeId: "dtu",
            collegeName: "Delhi Technological University",
            department: "Engineering",
            verified: true,
            role: "Google Student",
          };
          setState((s) => ({
            ...s,
            user: liveUser,
            profile: { ...s.profile, name: liveUser.name },
          }));
          void syncRemoteUserData(liveUser);
        }
        setLoaded(true);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const u = session.user;
          const meta = u.user_metadata || {};
          const liveUser: GoogleUser = {
            id: u.id,
            name: meta.full_name || meta.name || u.email?.split("@")[0] || "Student",
            email: u.email || "",
            avatar: meta.avatar_url || meta.picture || PRESET_GOOGLE_USERS[0].avatar,
            collegeId: "dtu",
            collegeName: "Delhi Technological University",
            department: "Engineering",
            verified: true,
            role: "Google Student",
          };
          setState((s) => ({
            ...s,
            user: liveUser,
            profile: { ...s.profile, name: liveUser.name },
          }));
          void syncRemoteUserData(liveUser);
        } else if (_event === "SIGNED_OUT") {
          setState((s) => ({
            ...s,
            user: null,
            profile: { ...s.profile, name: "Student" },
          }));
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    void loadEvents().then((events) => {
      setState((s) => ({ ...s, events }));
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      const toSave = { ...state, authModalOpen: false };
      localStorage.setItem(KEY, JSON.stringify(toSave));
    }
    document.documentElement.classList.toggle("dark", state.theme === "dark");
  }, [state, loaded]);

  const set = (fn: (s: State) => State) => setState(fn);

  const syncRemoteUserData = async (user: GoogleUser) => {
    if (!supabase || !isSupabaseConfigured || !user.id || user.id.startsWith("usr_")) return;

    const [profileResult, trackingResult] = await Promise.all([
      supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        full_name: user.name,
        avatar_url: user.avatar,
        college_id: user.collegeId,
        department: user.department,
        updated_at: new Date().toISOString(),
      }),
      supabase.from("event_tracking").select("event_id,status").eq("user_id", user.id),
    ]);

    if (profileResult.error) {
      console.error("Could not sync profile:", profileResult.error.message);
    }
    if (trackingResult.error) {
      console.error("Could not load event tracking:", trackingResult.error.message);
      return;
    }

    const remoteStatuses = Object.fromEntries(
      (trackingResult.data ?? []).map((row) => [row.event_id, row.status as Status]),
    );
    setState((s) => ({ ...s, statuses: remoteStatuses }));
  };

  const syncEventStatus = async (eventId: string, status: Status | null) => {
    const currentUser = state.user;
    if (!supabase || !isSupabaseConfigured || !currentUser || currentUser.id.startsWith("usr_"))
      return;

    const query = status
      ? supabase.from("event_tracking").upsert(
          {
            user_id: currentUser.id,
            event_id: eventId,
            status,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,event_id" },
        )
      : supabase
          .from("event_tracking")
          .delete()
          .eq("user_id", currentUser.id)
          .eq("event_id", eventId);
    const { error } = await query;
    if (error) {
      console.error("Could not save event status:", error.message);
      toast.error("Couldn't save event status", {
        description: "Your local status is still shown.",
      });
    }
  };

  const loginWithGoogle = async (customUser?: Partial<GoogleUser>) => {
    // If real Supabase is configured and not choosing a manual demo user:
    if (supabase && isSupabaseConfigured && !customUser?.id) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) {
          toast.error("Supabase Google Auth failed", { description: error.message });
          return;
        }
        return;
      } catch (err: any) {
        toast.error("Auth error", { description: err.message });
      }
    }

    // Fallback or demo user login
    const selected = customUser?.name
      ? {
          id: customUser.id || `usr_${Date.now()}`,
          name: customUser.name,
          email:
            customUser.email || `${customUser.name.toLowerCase().replace(/\s+/g, ".")}@student.edu`,
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

    toast.success(`Google Account: ${selected.name}`, {
      description: isSupabaseConfigured
        ? "Connected through Supabase Authentication"
        : `Signed in as ${selected.email} (Local session)`,
    });
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setState((s) => ({
      ...s,
      user: null,
      authModalOpen: false,
      profile: {
        ...s.profile,
        name: "Student",
      },
    }));
    toast.info("Signed out of Google account", {
      description: "Returned to public mode.",
    });
  };

  const setAuthModalOpen = (open: boolean) => {
    setState((s) => ({ ...s, authModalOpen: open }));
  };

  const ctx: Ctx = {
    ...state,
    set,
    toggleSave: (id) =>
      set((s) => ({
        ...s,
        saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [...s.saved, id],
      })),
    setStatus: (id, st) =>
      set((s) => {
        const statuses = { ...s.statuses };
        if (st) statuses[id] = st;
        else delete statuses[id];
        void syncEventStatus(id, st);
        return { ...s, statuses };
      }),
    toggleReminder: (id) =>
      set((s) => ({
        ...s,
        reminders: s.reminders.includes(id)
          ? s.reminders.filter((x) => x !== id)
          : [...s.reminders, id],
      })),
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
