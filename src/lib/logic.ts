import { collegeById, type EventItem, type Review } from "./data";

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

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

export function worthIt(e: EventItem, profile: Profile, userReviews: Review[] = []) {
  const reviews = [...e.reviews, ...userReviews];
  const t = travelEstimate(profile.collegeId, e.collegeId);
  const quality = (e.quality / 5) * 100;
  const cost = Math.max(0, 100 - ((e.fee + t.cost) / Math.max(profile.budget, 1)) * 100);
  const travel = Math.max(0, 100 - t.minutes);
  const matches = e.tags.filter((tag) => profile.interests.includes(tag)).length;
  const relevance = Math.min(100, matches * 45 + (matches ? 10 : 0));
  const avg = avgRating(reviews);
  const community = avg === null ? null : (avg / 5) * 100;
  const parts = [
    { key: "Quality", value: quality, weight: 0.25 },
    { key: "Cost", value: cost, weight: 0.2 },
    { key: "Travel", value: travel, weight: 0.15 },
    { key: "Relevance", value: relevance, weight: 0.25 },
    ...(community === null ? [] : [{ key: "Community", value: community, weight: 0.15 }]),
  ];
  const totalW = parts.reduce((s, p) => s + p.weight, 0);
  const score = Math.round(parts.reduce((s, p) => s + p.value * p.weight, 0) / totalW);
  return { score, parts, reviewCount: reviews.length, travel: t };
}

export function priority(e: EventItem, profile: Profile, saved: boolean) {
  const daysLeft = (new Date(e.deadline).getTime() - Date.now()) / 86400000;
  const urgency = daysLeft < 0 ? 0 : Math.max(0, 100 - daysLeft * 12);
  const w = worthIt(e, profile).score;
  const affordable = e.fee + travelEstimate(profile.collegeId, e.collegeId).cost <= profile.budget;
  const score = Math.round(urgency * 0.4 + w * 0.5 + (saved ? 10 : 0) - (affordable ? 0 : 20));
  return { score, daysLeft, affordable };
}

export function canIMakeIt(e: EventItem, profile: Profile, committed: EventItem[], leaveHour: number) {
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
