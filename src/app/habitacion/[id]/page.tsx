"use client";

import { useEffect, useState } from "react";
import { getRoomById } from "@/lib/queries";
import { Room } from "@/lib/types";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Zap,
  Droplets,
  Wifi,
  Snowflake,
  Bitcoin,
  ShieldCheck,
  Home,
  MapPin,
  Calendar,
} from "lucide-react";

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRoomById(id)
      .then(setRoom)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center text-sm text-muted">
        Cargando...
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-ink/60">Habitación no encontrada.</p>
        <Link href="/" className="text-primary text-sm font-medium hover:underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const whatsappUrl = `https://wa.me/${room.phone.replace(/\+/g, "")}?text=${encodeURIComponent(
    `Hola, vi tu habitación "${room.title}" en Rumi y me interesa. ¿Está disponible?`
  )}`;

  const services = [
    { icon: Zap, label: "Planta eléctrica", active: room.has_planta },
    { icon: Droplets, label: "Agua 24h", active: room.has_agua },
    { icon: Wifi, label: "WiFi incluido", active: room.has_wifi },
    { icon: Snowflake, label: "Aire acondicionado", active: room.has_ac },
    { icon: Bitcoin, label: "Acepta crypto", active: room.accepts_crypto },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink transition-colors"
      >
        <ArrowLeft size={16} />
        Volver
      </Link>

      {room.photos.length > 0 ? (
        <div className="space-y-2">
          {room.photos.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt={room.title}
              className="w-full aspect-[16/10] object-cover rounded-xl"
            />
          ))}
        </div>
      ) : (
        <div className="aspect-[16/10] bg-gradient-to-br from-primary-light/30 to-primary-light/10 rounded-xl flex items-center justify-center">
          <Home size={48} className="text-primary/20" />
        </div>
      )}

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-ink leading-tight">
            {room.title}
          </h1>
          <div className="text-right shrink-0">
            <span className="text-2xl font-bold text-primary">${room.price}</span>
            <span className="text-sm text-muted">/mes</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin size={14} />
            {room.location_zone}, {room.location_city}
          </span>
          {room.available_from && (
            <span className="inline-flex items-center gap-1">
              <Calendar size={14} />
              Disponible{" "}
              {new Date(room.available_from).toLocaleDateString("es-VE", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs px-2.5 py-1 rounded-md bg-primary-light/40 text-primary-dark font-medium">
            {room.room_type === "privada" ? "Habitación privada" : "Compartida"}
          </span>
          {room.verified && (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-primary/10 text-primary font-medium">
              <ShieldCheck size={12} />
              Verificado
            </span>
          )}
          {room.owner_direct && (
            <span className="text-xs px-2.5 py-1 rounded-md bg-accent/10 text-accent font-medium">
              Dueño directo
            </span>
          )}
          {room.includes_services && (
            <span className="text-xs px-2.5 py-1 rounded-md bg-gray-100 text-ink/60">
              Servicios incluidos
            </span>
          )}
          {room.gender_pref !== "cualquiera" && (
            <span className="text-xs px-2.5 py-1 rounded-md bg-gray-100 text-ink/60">
              {room.gender_pref === "solo_mujeres"
                ? "Solo mujeres"
                : "Solo hombres"}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <h2 className="text-sm font-semibold text-ink mb-1.5">Descripción</h2>
        <p className="text-sm text-ink/70 leading-relaxed">{room.description}</p>
      </div>

      {/* Services */}
      <div>
        <h2 className="text-sm font-semibold text-ink mb-2">Servicios</h2>
        <div className="grid grid-cols-2 gap-2">
          {services.map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
                active
                  ? "bg-primary/5 text-primary"
                  : "bg-gray-50 text-ink/30 line-through"
              }`}
            >
              <Icon size={16} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp CTA — sticky on mobile */}
      <div className="sticky bottom-4 pt-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 bg-whatsapp hover:bg-whatsapp/90 text-white font-medium rounded-xl shadow-lg transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.67-1.388A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.239 0-4.308-.724-5.994-1.952a.5.5 0 00-.404-.078l-3.29.978.892-3.156a.5.5 0 00-.062-.425A9.956 9.956 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
          </svg>
          Contactar por WhatsApp
        </a>
      </div>
    </div>
  );
}
