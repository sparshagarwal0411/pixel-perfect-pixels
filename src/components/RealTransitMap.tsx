import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  ExternalLink,
  Navigation,
  Compass,
  Layers,
  Train,
  Clock,
  Banknote,
  Sparkles,
  Maximize2,
} from "lucide-react";
import { type College, type EventItem, collegeById } from "@/lib/data";
import { travelEstimate, fmtDate } from "@/lib/logic";
import { GoogleLogo } from "./GoogleAuthModal";

interface RealTransitMapProps {
  homeCollege: College;
  selectedEvent: EventItem;
  destinationCollege: College;
  allColleges: College[];
  currentLocation?: { lat: number; lng: number };
  onSelectCollege: (collegeId: string) => void;
  onSelectEvent?: (eventId: string) => void;
}

export function RealTransitMap({
  homeCollege,
  selectedEvent,
  destinationCollege,
  allColleges,
  currentLocation,
  onSelectCollege,
}: RealTransitMapProps) {
  const [mapMode, setMapMode] = useState<"google" | "interactive">("google");
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  const travel = travelEstimate(homeCollege.id, destinationCollege.id);

  // Google Maps Directions link for opening directly in Google Maps
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    homeCollege.name + ", Delhi",
  )}&destination=${encodeURIComponent(destinationCollege.name + ", Delhi")}&travelmode=transit`;

  // Google Maps Embed URL (free, reliable, directly shows live route/destination on Google Maps)
  const origin = currentLocation ?? homeCollege;
  const googleEmbedUrl = `https://maps.google.com/maps?saddr=${origin.lat},${origin.lng}&daddr=${destinationCollege.lat},${destinationCollege.lng}&hl=en&z=12&output=embed`;

  // Initialize and update Leaflet Map when in "interactive" mode
  useEffect(() => {
    if (mapMode !== "interactive" || !mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      // Calculate center between origin and destination
      const centerLat = (origin.lat + destinationCollege.lat) / 2;
      const centerLng = (origin.lng + destinationCollege.lng) / 2;

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 11,
        zoomControl: true,
      });

      // CartoDB Voyager or Dark Matter tiles
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 18,
      }).addTo(map);

      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;

    // Clear existing markers/layers except tile layer
    map.eachLayer((layer) => {
      if (
        layer instanceof L.Marker ||
        layer instanceof L.Polyline ||
        layer instanceof L.CircleMarker
      ) {
        map.removeLayer(layer);
      }
    });

    // Draw route line between home and destination
    const polyline = L.polyline(
      [
        [origin.lat, origin.lng],
        [destinationCollege.lat, destinationCollege.lng],
      ],
      {
        color: "#06b6d4",
        weight: 4,
        opacity: 0.85,
        dashArray: "8, 8",
      },
    ).addTo(map);

    // Fit bounds so both campuses are clearly in view
    map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

    // Custom marker helper
    const createCustomIcon = (label: string, isHome: boolean, isDest: boolean) => {
      const bg = isHome
        ? "background-color: #10b981; color: white;"
        : isDest
          ? "background-color: #06b6d4; color: white;"
          : "background-color: #1e293b; color: #cbd5e1;";

      return L.divIcon({
        className: "custom-college-marker",
        html: `
          <div style="${bg} font-family: sans-serif; font-weight: 700; font-size: 11px; padding: 4px 8px; border-radius: 9999px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 2px solid white; display: flex; align-items: center; gap: 4px; white-space: nowrap; transform: translate(-50%, -100%);">
            <span>${label}</span>
            ${isHome ? '<span style="font-size: 9px; opacity: 0.85;">(YOU)</span>' : ""}
          </div>
        `,
        iconSize: [0, 0],
      });
    };

    if (currentLocation) {
      L.circleMarker([currentLocation.lat, currentLocation.lng], {
        radius: 9,
        color: "#10b981",
        fillColor: "#10b981",
        fillOpacity: 1,
        weight: 3,
      })
        .addTo(map)
        .bindPopup("<strong>Your current location</strong>");
    }

    // Add markers for all colleges
    allColleges.forEach((c) => {
      const isHome = c.id === homeCollege.id;
      const isDest = c.id === destinationCollege.id;

      const marker = L.marker([c.lat, c.lng], {
        icon: createCustomIcon(c.short, isHome, isDest),
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px; min-width: 140px;">
          <p style="font-weight: 700; margin: 0; font-size: 13px;">${c.name}</p>
          <p style="color: #64748b; margin: 2px 0 6px 0; font-size: 11px;">Metro: ${c.metro || "Nearby"}</p>
          ${
            !isHome
              ? `<button id="btn-set-home-${c.id}" style="background-color: #06b6d4; color: white; border: none; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 600; cursor: pointer; width: 100%;">Set as origin</button>`
              : '<span style="color: #10b981; font-weight: 600; font-size: 10px;">Your home campus</span>'
          }
        </div>
      `);

      marker.on("popupopen", () => {
        const btn = document.getElementById(`btn-set-home-${c.id}`);
        if (btn) {
          btn.onclick = () => onSelectCollege(c.id);
        }
      });
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [
    mapMode,
    homeCollege,
    destinationCollege,
    allColleges,
    currentLocation,
    onSelectCollege,
    origin,
  ]);

  return (
    <div className="space-y-4">
      {/* Map Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-xs">
        {/* Toggle between Google Maps and Interactive Leaflet Radar */}
        <div className="flex items-center gap-1.5 rounded-xl bg-muted/80 p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setMapMode("google")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              mapMode === "google"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <GoogleLogo className="size-3.5" />
            <span>Google Maps View</span>
          </button>

          <button
            type="button"
            onClick={() => setMapMode("interactive")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              mapMode === "interactive"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Compass className="size-3.5" />
            <span>Interactive Radar</span>
          </button>
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
        {mapMode === "google" ? (
          <div className="relative h-[440px] w-full">
            <iframe
              title="Google Maps Transit Route"
              src={googleEmbedUrl}
              className="h-full w-full border-0"
              loading="lazy"
              allowFullScreen
            />

            {/* Float Route Spec Banner */}
            <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/80 bg-card/95 p-3 backdrop-blur-md shadow-md text-xs">
              <div className="flex items-center gap-2">
                <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-foreground">
                  {homeCollege.short} ➔ {destinationCollege.short}
                </span>
                <span className="text-muted-foreground hidden sm:inline">
                  ({selectedEvent.title})
                </span>
              </div>

              <div className="flex items-center gap-3 font-medium">
                <span className="flex items-center gap-1 text-primary">
                  <Clock className="size-3.5" />
                  {travel.minutes} min metro
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Banknote className="size-3.5" />₹{travel.cost} est. fare
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative h-[440px] w-full">
            <div ref={mapContainerRef} className="h-full w-full z-0" />

            {/* Quick helper badge */}
            <div className="pointer-events-none absolute top-3 right-3 z-10 rounded-lg border border-border/80 bg-card/90 px-2.5 py-1 text-[11px] text-muted-foreground backdrop-blur-sm shadow-xs">
              {currentLocation
                ? "Green dot: your current location"
                : "Click any campus pin to inspect or set origin"}
            </div>
          </div>
        )}
      </div>

      {/* Real Metro Line & Travel Breakdown */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Train className="size-3.5 text-primary" />
            <span>Origin Station</span>
          </div>
          <p className="text-xs font-semibold text-foreground">{homeCollege.metro}</p>
          <p className="text-[10px] text-muted-foreground">{homeCollege.name}</p>
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
