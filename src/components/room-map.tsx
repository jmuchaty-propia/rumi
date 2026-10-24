"use client";

import { useEffect, useRef } from "react";
import { Room } from "@/lib/types";

// Leaflet is loaded via CDN in layout
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    L: any;
  }
}

interface RoomMapProps {
  rooms: Room[];
}

export function RoomMap({ rooms }: RoomMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const L = window.L;
    if (!L) return;

    // Center on Venezuela
    const map = L.map(mapRef.current, {
      scrollWheelZoom: false,
    }).setView([9.5, -66.9], 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 18,
    }).addTo(map);

    // Custom icon
    const icon = L.divIcon({
      className: "rumi-marker",
      html: `<div style="
        background: #0284C7;
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      "><span style="transform: rotate(45deg); color: white; font-size: 14px; font-weight: bold;">$</span></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    const roomsWithCoords = rooms.filter((r) => r.latitude && r.longitude);

    roomsWithCoords.forEach((room) => {
      const marker = L.marker([room.latitude!, room.longitude!], { icon }).addTo(map);

      const whatsappUrl = `https://wa.me/${room.phone.replace(/\+/g, "")}?text=${encodeURIComponent(
        `Hola, vi tu habitación "${room.title}" en Rumi y me interesa. ¿Está disponible?`
      )}`;

      marker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; min-width: 200px;">
          <strong style="font-size: 14px; color: #0F172A;">${room.title}</strong>
          <p style="color: #64748B; font-size: 12px; margin: 4px 0;">${room.location_zone}, ${room.location_city}</p>
          <p style="color: #0284C7; font-weight: 700; font-size: 16px; margin: 4px 0;">$${room.price}/mes</p>
          <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer"
             style="display: block; text-align: center; background: #25D366; color: white; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 600; margin-top: 8px;">
            💬 WhatsApp
          </a>
        </div>
      `);
    });

    // Fit bounds if rooms have coords
    if (roomsWithCoords.length > 0) {
      const bounds = L.latLngBounds(
        roomsWithCoords.map((r) => [r.latitude!, r.longitude!])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [rooms]);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-ink">
        Mapa de habitaciones
      </h2>
      <div
        ref={mapRef}
        className="w-full h-[350px] sm:h-[450px] rounded-xl overflow-hidden border border-gray-200"
      />
    </div>
  );
}
