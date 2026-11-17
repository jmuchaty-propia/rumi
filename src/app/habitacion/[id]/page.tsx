"use client";

import { useEffect, useState } from "react";
import { getRoomById } from "@/lib/queries";
import { Room } from "@/lib/types";
import { useParams } from "next/navigation";
import { PhotoGallery } from "@/components/photo-gallery";
import { RoomLocationMap } from "@/components/room-location-map";
import { WhatsAppIcon } from "@/components/ui";
import Link from "next/link";
import {
  ArrowLeft,
  Zap,
  Droplets,
  Wifi,
  Snowflake,
  Bitcoin,
  ShieldCheck,
  MapPin,
  Lock,
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

  const whatsappUrl = `https://wa.me/${room.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
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

      <PhotoGallery photos={room.photos} alt={room.title} />
      {room.is_demo && (
        <p className="text-xs text-center text-muted bg-gray-50 rounded-lg py-2">
          Este es un anuncio de ejemplo para mostrar cómo se ve Rumi.
        </p>
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

      {/* La casa */}
      {room.home_photos?.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-ink mb-2">La casa</h2>
          <div className="flex gap-2 overflow-x-auto snap-x no-scrollbar -mx-4 px-4">
            {room.home_photos.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url + i}
                src={url}
                alt={`Áreas comunes — foto ${i + 1}`}
                loading="lazy"
                className="w-64 shrink-0 snap-start aspect-[4/3] object-cover rounded-lg"
              />
            ))}
          </div>
        </div>
      )}

      {/* Ubicación */}
      {room.latitude != null && room.longitude != null && (
        <div>
          <h2 className="text-sm font-semibold text-ink mb-2">Ubicación</h2>
          <RoomLocationMap
            lat={room.latitude}
            lng={room.longitude}
            exact={room.location_exact}
          />
          {!room.location_exact && (
            <p className="text-xs text-muted mt-1.5 inline-flex items-center gap-1">
              <Lock size={12} />
              Ubicación aproximada. La dirección exacta te la da el dueño por WhatsApp.
            </p>
          )}
        </div>
      )}

      {/* WhatsApp CTA — sticky on mobile */}
      <div className="sticky bottom-4 pt-2 z-10">
        {room.is_demo ? (
          <Link
            href="/publicar"
            className="flex items-center justify-center gap-2 w-full py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl shadow-lg transition-colors"
          >
            Publica tu habitación así de fácil
          </Link>
        ) : (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-whatsapp hover:bg-whatsapp/90 text-white font-medium rounded-xl shadow-lg transition-colors"
          >
            <WhatsAppIcon className="w-5 h-5" />
            Contactar por WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
