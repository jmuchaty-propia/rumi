"use client";

import { useEffect, useRef, useState } from "react";
import { LocateFixed, Lock, MapPin } from "lucide-react";
import {
  APPROX_RADIUS_M,
  CITY_CENTERS,
  VENEZUELA_CENTER,
} from "@/lib/types";
import { PIN_HTML, TILE_URL, useLeaflet } from "./ui";

export interface PickedLocation {
  lat: number;
  lng: number;
  exact: boolean;
}

/**
 * Redondea a una cuadrícula de ~550 m para que la ubicación aproximada
 * no revele la casa. Lo que se guarda en la base de datos es esto, no el
 * punto exacto.
 */
export function approximate(lat: number, lng: number) {
  const step = 0.005;
  return {
    lat: Math.round(lat / step) * step,
    lng: Math.round(lng / step) * step,
  };
}

/**
 * Mapa para marcar dónde está la habitación: botón de GPS o tocar el mapa.
 * El dueño elige si mostrar el punto exacto o solo la zona aproximada.
 */
export function LocationPicker({
  city,
  value,
  onChange,
}: {
  city: string;
  value: PickedLocation | null;
  onChange: (v: PickedLocation | null) => void;
}) {
  const ready = useLeaflet();
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layer = useRef<any>(null);
  const [gpsMsg, setGpsMsg] = useState("");
  const exact = value?.exact ?? false;

  // Crear mapa
  useEffect(() => {
    if (!ready || !mapRef.current || map.current) return;
    const L = window.L;
    const m = L.map(mapRef.current, { scrollWheelZoom: false }).setView(
      CITY_CENTERS[city] ?? VENEZUELA_CENTER,
      CITY_CENTERS[city] ? 12 : 5
    );
    L.tileLayer(TILE_URL, { attribution: "&copy; OpenStreetMap", maxZoom: 18 }).addTo(m);
    m.on("click", (e: { latlng: { lat: number; lng: number } }) => {
      onChangeRef.current({ lat: e.latlng.lat, lng: e.latlng.lng, exact: exactRef.current });
    });
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
    };
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refs para el handler de click
  const onChangeRef = useRef(onChange);
  const exactRef = useRef(exact);
  onChangeRef.current = onChange;
  exactRef.current = exact;

  // Centrar al cambiar de ciudad (si aún no hay punto)
  useEffect(() => {
    if (map.current && !value && CITY_CENTERS[city]) {
      map.current.setView(CITY_CENTERS[city], 12);
    }
  }, [city, value]);

  // Dibujar pin o círculo
  useEffect(() => {
    const L = window.L;
    if (!map.current || !L) return;
    layer.current?.remove();
    layer.current = null;
    if (!value) return;

    if (value.exact) {
      layer.current = L.marker([value.lat, value.lng], {
        draggable: true,
        icon: L.divIcon({ className: "", html: PIN_HTML, iconSize: [30, 30], iconAnchor: [15, 30] }),
      })
        .on("dragend", (e: { target: { getLatLng: () => { lat: number; lng: number } } }) => {
          const p = e.target.getLatLng();
          onChangeRef.current({ lat: p.lat, lng: p.lng, exact: true });
        })
        .addTo(map.current);
    } else {
      const a = approximate(value.lat, value.lng);
      layer.current = L.circle([a.lat, a.lng], {
        radius: APPROX_RADIUS_M,
        color: "#7C3AED",
        fillColor: "#7C3AED",
        fillOpacity: 0.18,
        weight: 2,
      }).addTo(map.current);
    }
    map.current.setView([value.lat, value.lng], Math.max(map.current.getZoom(), 15));
  }, [value]);

  function useGps() {
    if (!navigator.geolocation) {
      setGpsMsg("Tu navegador no permite ubicación. Toca el mapa para marcarla.");
      return;
    }
    setGpsMsg("Buscando tu ubicación…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsMsg("");
        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude, exact });
      },
      () => setGpsMsg("No pudimos obtener tu ubicación. Toca el mapa para marcarla."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-medium text-ink">Ubicación en el mapa</label>
        <p className="text-xs text-muted mt-0.5">
          Usa tu GPS si estás en la casa, o toca el mapa para marcarla.
        </p>
      </div>

      <button
        type="button"
        onClick={useGps}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-primary/30 text-primary text-sm font-medium bg-rumi-soft hover:bg-primary-light/40 transition-colors"
      >
        <LocateFixed size={16} />
        Usar mi ubicación actual
      </button>
      {gpsMsg && <p className="text-xs text-muted">{gpsMsg}</p>}

      <div
        ref={mapRef}
        className="w-full h-60 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 relative z-0"
      />

      {/* Exacta vs aproximada */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { v: false, icon: Lock, title: "Aproximada", desc: "Zona de ~500 m" },
          { v: true, icon: MapPin, title: "Exacta", desc: "Pin en la casa" },
        ].map(({ v, icon: Icon, title, desc }) => (
          <button
            key={title}
            type="button"
            onClick={() => value && onChange({ ...value, exact: v })}
            className={`text-left px-3 py-2 rounded-lg border transition-colors ${
              exact === v
                ? "bg-primary/5 border-primary/40 text-primary"
                : "border-gray-200 text-ink/60 hover:border-gray-300"
            }`}
          >
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <Icon size={14} />
              {title}
            </span>
            <span className="text-xs text-muted">{desc}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted">
        {exact
          ? "Se mostrará el punto exacto. Puedes arrastrar el pin para ajustarlo."
          : "Recomendado: solo se muestra un círculo de la zona. La dirección la das tú por WhatsApp."}
      </p>
    </div>
  );
}
