import { events as demoEvents, type EventItem } from "./data";
import { supabase } from "./supabase";

type RemoteEvent = {
  id: string;
  source_url: string;
  title: string;
  category: EventItem["category"];
  college_id: string;
  organizer: string;
  start_at: string;
  end_at: string;
  deadline_at: string;
  fee: number;
  eligibility: string;
  tags: string[];
  description: string;
  quality: number;
  reviews: EventItem["reviews"];
  prize: string | null;
};

export async function loadEvents(): Promise<EventItem[]> {
  if (!supabase) return demoEvents;

  const { data, error } = await supabase
    .from("events")
    .select(
      "id,source_url,title,category,college_id,organizer,start_at,end_at,deadline_at,fee,eligibility,tags,description,quality,reviews,prize",
    )
    .gte("end_at", new Date().toISOString())
    .order("start_at", { ascending: true });

  if (error) {
    console.warn("Could not load synced events; using demo events.", error.message);
    return demoEvents;
  }
  if (!data?.length) return demoEvents;

  return (data as RemoteEvent[]).map((event) => ({
    id: event.id,
    sourceUrl: event.source_url,
    title: event.title,
    category: event.category,
    collegeId: event.college_id,
    organizer: event.organizer,
    start: event.start_at,
    end: event.end_at,
    deadline: event.deadline_at,
    fee: event.fee,
    eligibility: event.eligibility,
    tags: event.tags,
    description: event.description,
    quality: event.quality,
    reviews: event.reviews,
    prize: event.prize ?? undefined,
  }));
}
