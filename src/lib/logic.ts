import { collegeById, type EventItem } from "./data";

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export const formatDistance = (km: number) =>
  km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;

/** Rough estimate only — straight-line distance × 1.35 road factor, ~22 km/h city average. Not a live route. */
export function travelEstimate(fromId: string, toId: string) {
  if (fromId === toId) return { km: 0, minutes: 5, cost: 0 };
  const km = haversineKm(collegeById(fromId), collegeById(toId)) * 1.35;
  const minutes = Math.round((km / 22) * 60 + 10);
  const cost = Math.round(20 + km * 2.5); // metro/auto mix, two ways ×2 below
  return { km: Math.round(km * 10) / 10, minutes, cost: cost * 2 };
}

export const avgRating = (reviews: Review[]) =>
  reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;

export interface Profile {
  name: string;
  collegeId: string;
  interests: string[];
  budget: number;
  goals: string;
}

export function overlaps(a: EventItem, b: EventItem) {
  return new Date(a.start) < new Date(b.end) && new Date(b.start) < new Date(a.end);
}

export function priority(e: EventItem, profile: Profile, saved: boolean) {
  const daysLeft = (new Date(e.deadline).getTime() - Date.now()) / 86400000;
  const urgency = daysLeft < 0 ? 0 : Math.max(0, 100 - daysLeft * 12);
  const affordable = e.fee + travelEstimate(profile.collegeId, e.collegeId).cost <= profile.budget;
  const score = Math.round(urgency * 0.6 + (saved ? 15 : 0) - (affordable ? 0 : 20));
  return { score, daysLeft, affordable };
}

export function canIMakeIt(
  e: EventItem,
  profile: Profile,
  committed: EventItem[],
  leaveHour: number,
) {
  const t = travelEstimate(profile.collegeId, e.collegeId);
  const start = new Date(e.start);
  const arrival = new Date(start);
  arrival.setHours(leaveHour, 0, 0, 0);
  arrival.setMinutes(arrival.getMinutes() + t.minutes);
  const onTime = arrival <= start;
  const total = e.fee + t.cost;
  const withinBudget = total <= profile.budget;
  const conflicts = committed.filter((c) => c.id !== e.id && overlaps(c, e));
  const deadlineOpen = new Date(e.deadline) > new Date();
  const ok = onTime && withinBudget && conflicts.length === 0 && deadlineOpen;
  return { ok, onTime, arrival, withinBudget, total, conflicts, deadlineOpen, travel: t };
}

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
export const fmtMoney = (n: number) => (n === 0 ? "Free" : `₹${n}`);
