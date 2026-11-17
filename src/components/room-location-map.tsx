"use client";

import { useEffect, useRef } from "react";
import { APPROX_RADIUS_M } from "@/lib/types";
import { PIN_HTML, TILE_URL, useLeaflet } from "./ui";

/** Mini-mapa de solo lectura en el detalle del anuncio. */
export function RoomLocationMap({
  lat,
  lng,
  exact,
}: {
  lat: number;
  lng: number;
  exact: boolean;
}) {
  const ready = useLeaflet();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ready || !ref.current) return;
    const L = window.L;
    const m = L.map(ref.current, {
      scrollWheelZoom: false,
      dragging: !L.Browser.mobile,
      zoomControl: false,
    }).setView([lat, lng], exact ? 16 : 14);
    L.tileLayer(TILE_URL, { attribution: "&copy; OpenStreetMap", maxZoom: 18 }).addTo(m);
    if (exact) {
      L.marker([lat, lng], {
        icon: L.divIcon({ className: "", html: PIN_HTML, iconSize: [30, 30], iconAnchor: [15, 30] }),
      }).addTo(m);
    } else {
      L.circle([lat, lng], {
        radius: APPROX_RADIUS_M,
        color: "#7C3AED",
        fillColor: "#7C3AED",
        fillOpacity: 0.18,
        weight: 2,
      }).addTo(m);
    }
    return () => m.remove();
  }, [ready, lat, lng, exact]);

  return (
    <div
      ref={ref}
      className="w-full h-48 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 relative z-0"
    />
  );
}
