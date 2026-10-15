import { type College, type EventItem } from "@/lib/data";
import { travelEstimate } from "@/lib/logic";
import { GoogleLogo } from "./GoogleAuthModal";
import { Clock, Banknote, MapPin, Train, Sparkles, Navigation, ExternalLink } from "lucide-react";

interface RealTransitMapProps {
  homeCollege: College;
  selectedEvent: EventItem;
  destinationCollege: College;
  events: EventItem[];
  mapOrigin: { lat: number; lng: number };
  distanceOriginLabel: "you" | "central Delhi";
  distanceKm: number;
  currentLocation?: { lat: number; lng: number };
  onSelectEvent?: (eventId: string) => void;
}

export function RealTransitMap({
  homeCollege,
  selectedEvent,
  destinationCollege,
  mapOrigin,
  distanceOriginLabel,
  distanceKm,
}: RealTransitMapProps) {
  const travel = travelEstimate(homeCollege.id, destinationCollege.id);
  const origin = mapOrigin;

  // Google Maps Directions link for opening directly in Google Maps
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    `${origin.lat},${origin.lng}`,
  )}&destination=${encodeURIComponent(destinationCollege.name + ", Delhi")}&travelmode=transit`;

  // Google Maps Embed URL
  const googleEmbedUrl = `https://maps.google.com/maps?saddr=${origin.lat},${origin.lng}&daddr=${destinationCollege.lat},${destinationCollege.lng}&hl=en&z=12&output=embed`;

  return (
    <div className="space-y-4">
      {/* Map Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-xs">
        <div className="flex items-center gap-1.5 rounded-xl bg-muted/80 p-1 text-xs font-medium">
          <div className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 bg-background text-foreground shadow-xs font-semibold">
            <GoogleLogo className="size-3.5" />
            <span>Google Maps View</span>
          </div>
        </div>

        {/* Direct Google Maps Live Transit Link */}
        <a
          href={googleMapsDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/60 transition-colors shadow-xs"
        >
          <Navigation className="size-3.5 text-primary" />
          <span>Open in Google Maps App</span>
          <ExternalLink className="size-3 text-muted-foreground" />
        </a>
      </div>

      {/* Main Map Frame */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        <div className="relative h-[440px] w-full">
          <iframe
            title="Google Maps Transit Route"
            src={googleEmbedUrl}
            className="h-full w-full border-0"
            loading="lazy"
            allowFullScreen
          />

        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-3 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-foreground">
            {distanceOriginLabel === "you" ? "Your location" : "Central Delhi"} → {destinationCollege.short}
          </span>
          <span className="text-muted-foreground">({selectedEvent.title})</span>
        </div>
        <span className="font-medium text-primary">{distanceKm.toFixed(1)} km to destination campus</span>
      </div>

      {/* Real Metro Line & Travel Breakdown */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Train className="size-3.5 text-primary" />
            <span>{distanceOriginLabel === "you" ? "Your Location" : "Central Delhi"}</span>
          </div>
          <p className="text-xs font-semibold text-foreground">{distanceOriginLabel === "you" ? "Current browser location" : "Delhi center fallback"}</p>
          <p className="text-[10px] text-muted-foreground">Starting point</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5 text-primary" />
            <span>Destination Station</span>
          </div>
          <p className="text-xs font-semibold text-foreground">{destinationCollege.metro}</p>
          <p className="text-[10px] text-muted-foreground">{destinationCollege.name}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-emerald-500" />
            <span>Commute Strategy</span>
          </div>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {travel.minutes <= 35 ? "Quick Direct Line" : "1 Interchange Required"}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {travel.minutes} min · ~₹{travel.cost} metro fare
          </p>
        </div>
      </div>
    </div>
  );
}