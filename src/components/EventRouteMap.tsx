import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ExternalLink,
  Navigation,
  Compass,
  Train,
  Clock,
  Banknote,
  MapPin,
  LocateFixed,
  Route as RouteIcon,
  Sparkles,
} from "lucide-react";
import { collegeById, type College, type EventItem } from "@/lib/data";
import { formatDistance, haversineKm, travelEstimate } from "@/lib/logic";
import { GoogleLogo } from "./GoogleAuthModal";

interface EventRouteMapProps {
  event: EventItem;
  homeCollege: College;
}

export function EventRouteMap({ event, homeCollege }: EventRouteMapProps) {
  const destCollege = collegeById(event.collegeId);
  const [mapMode, setMapMode] = useState<"interactive" | "google">("interactive");
  const [useGps, setUseGps] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "ready" | "denied">("idle");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  // Determine active origin
  const originCoord = useGps && gpsLocation ? gpsLocation : { lat: homeCollege.lat, lng: homeCollege.lng };
  const originLabel = useGps && gpsLocation ? "Your GPS Location" : `${homeCollege.short} Campus`;

  // Travel estimates
  const travel = travelEstimate(homeCollege.id, destCollege.id);
  const directDist = haversineKm(originCoord, destCollege);

  const requestGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus("denied");
      return;
    }
    setGpsStatus("loading");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setGpsLocation({ lat: coords.latitude, lng: coords.longitude });
        setGpsStatus("ready");
        setUseGps(true);
      },
      () => {
        setGpsStatus("denied");
        setUseGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Google Maps directions links
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originCoord.lat},${originCoord.lng}&destination=${encodeURIComponent(
    `${destCollege.name}, Delhi`
  )}&travelmode=transit`;

  const googleEmbedUrl = `https://maps.google.com/maps?saddr=${originCoord.lat},${originCoord.lng}&daddr=${destCollege.lat},${destCollege.lng}&hl=en&z=12&output=embed`;

  // Leaflet map initialization & route drawing
  useEffect(() => {
    if (mapMode !== "interactive" || !mapContainerRef.current) return;

    // Destroy prior map instance if existing
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    const centerLat = (originCoord.lat + destCollege.lat) / 2;
    const centerLng = (originCoord.lng + destCollege.lng) / 2;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 11,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 18,
    }).addTo(map);

    leafletMapRef.current = map;

    // Draw Route Path Polyline
    const pathLine = L.polyline(
      [
        [originCoord.lat, originCoord.lng],
        [destCollege.lat, destCollege.lng],
      ],
      {
        color: "#0284c7",
        weight: 5,
        opacity: 0.9,
        dashArray: "8, 8",
      }
    ).addTo(map);

    // Origin Icon
    const originIcon = L.divIcon({
      className: "custom-route-marker",
      html: `
        <div style="background-color: #10b981; color: white; font-family: sans-serif; font-weight: 700; font-size: 11px; padding: 4px 10px; border-radius: 9999px; box-shadow: 0 4px 12px rgba(0,0,0,0.35); border: 2px solid white; display: flex; align-items: center; gap: 4px; white-space: nowrap; transform: translate(-50%, -100%);">
          <span>📍 ${originLabel}</span>
        </div>
      `,
      iconSize: [0, 0],
    });

    // Destination Icon
    const destIcon = L.divIcon({
      className: "custom-route-marker",
      html: `
        <div style="background-color: #6366f1; color: white; font-family: sans-serif; font-weight: 700; font-size: 11px; padding: 4px 10px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(0,0,0,0.4); border: 2px solid white; display: flex; align-items: center; gap: 4px; white-space: nowrap; transform: translate(-50%, -100%);">
          <span>🏁 ${destCollege.short} (${event.category})</span>
        </div>
      `,
      iconSize: [0, 0],
    });

    // Origin Marker
    L.marker([originCoord.lat, originCoord.lng], { icon: originIcon })
      .addTo(map)
      .bindPopup(`<b>Starting Point</b><br />${originLabel}<br /><span style="font-size:11px;color:#64748b;">${homeCollege.name}</span>`);

    // Destination Marker
    L.marker([destCollege.lat, destCollege.lng], { icon: destIcon })
      .addTo(map)
      .bindPopup(
        `<b>${event.title}</b><br />${destCollege.name}<br /><span style="font-size:11px;color:#64748b;">Metro: ${destCollege.metro}</span>`
      )
      .openPopup();

    // Fit map bounds to encompass the route
    const bounds = L.latLngBounds([
      [originCoord.lat, originCoord.lng],
      [destCollege.lat, destCollege.lng],
    ]);
    map.fitBounds(bounds, { padding: [50, 50] });

    // Handle container resizing
    const resizeTimeout = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(resizeTimeout);
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [mapMode, originCoord.lat, originCoord.lng, destCollege.lat, destCollege.lng, destCollege.short, destCollege.metro, destCollege.name, event.title, event.category, homeCollege.name, originLabel]);

  return (
    <div className="card-surface p-4 sm:p-5 fade-up space-y-4">
      {/* Route Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div>
          <div className="flex items-center gap-2">
            <RouteIcon className="size-4.5 text-primary" />
            <h3 className="font-semibold text-base text-foreground">Venue & Transit Path</h3>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Travel route from <span className="font-medium text-foreground">{originLabel}</span> to{" "}
            <span className="font-medium text-foreground">{destCollege.name}</span>
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg bg-muted/80 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setMapMode("interactive")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-all ${
                mapMode === "interactive"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Compass className="size-3" />
              <span>Route Path</span>
            </button>
            <button
              type="button"
              onClick={() => setMapMode("google")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-all ${
                mapMode === "google"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <GoogleLogo className="size-3" />
              <span>Google Maps</span>
            </button>
          </div>

          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-xs"
          >
            <Navigation className="size-3 text-primary" />
            <span className="hidden sm:inline">Open in App</span>
            <ExternalLink className="size-3 text-muted-foreground" />
          </a>
        </div>
      </div>

      {/* Origin Selection Pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Measure path from:</span>
          <button
            type="button"
            onClick={() => setUseGps(false)}
            className={`rounded-full px-2.5 py-0.5 font-medium transition-colors ${
              !useGps
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {homeCollege.short} Campus
          </button>
          <button
            type="button"
            onClick={() => {
              if (gpsLocation) setUseGps(true);
              else requestGps();
            }}
            className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium transition-colors ${
              useGps
                ? "bg-emerald-600 text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <LocateFixed className="size-3" />
            <span>{gpsStatus === "loading" ? "Locating…" : "Current GPS"}</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs font-medium">
          <span className="text-primary font-semibold">
            {formatDistance(directDist)} straight-line
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-foreground">~{travel.minutes} min transit</span>
        </div>
      </div>

      {/* Map View Canvas */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm h-[320px] sm:h-[360px] w-full">
        {mapMode === "google" ? (
          <iframe
            title={`Route to ${destCollege.name}`}
            src={googleEmbedUrl}
            className="h-full w-full border-0"
            loading="lazy"
            allowFullScreen
          />
        ) : (
          <div ref={mapContainerRef} className="h-full w-full z-0" />
        )}

        {/* Floating route summary badge */}
        <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/80 bg-card/95 p-2.5 backdrop-blur-md shadow-md text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{homeCollege.short}</span>
            <span className="text-muted-foreground">➔</span>
            <span>{destCollege.short} ({destCollege.name})</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 font-medium text-primary">
              <Clock className="size-3.5" />
              ~{travel.minutes} min
            </span>
            <span className="flex items-center gap-1 font-medium text-muted-foreground">
              <Banknote className="size-3.5" />₹{travel.cost} metro fare
            </span>
          </div>
        </div>
      </div>

      {/* Transit Stations & Telemetry Grid */}
      <div className="grid gap-2.5 sm:grid-cols-3 text-xs">
        <div className="rounded-xl border border-border bg-card/50 p-2.5 space-y-0.5">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Train className="size-3 text-primary" />
            <span className="text-[11px]">Origin Metro</span>
          </div>
          <p className="font-semibold text-foreground truncate">{homeCollege.metro}</p>
          <p className="text-[10px] text-muted-foreground">{homeCollege.name}</p>
        </div>

        <div className="rounded-xl border border-border bg-card/50 p-2.5 space-y-0.5">
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="size-3 text-primary" />
            <span className="text-[11px]">Venue Metro</span>
          </div>
          <p className="font-semibold text-foreground truncate">{destCollege.metro}</p>
          <p className="text-[10px] text-muted-foreground">{destCollege.name}</p>
        </div>

        <div className="rounded-xl border border-border bg-card/50 p-2.5 space-y-0.5">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Sparkles className="size-3 text-emerald-500" />
            <span className="text-[11px]">Commute Telemetry</span>
          </div>
          <p className="font-semibold text-emerald-600 dark:text-emerald-400">
            {travel.minutes <= 35 ? "Direct / Short Line" : "1 Interchange Required"}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {formatDistance(directDist)} · ~₹{travel.cost} round trip
          </p>
        </div>
      </div>
    </div>
  );
}
