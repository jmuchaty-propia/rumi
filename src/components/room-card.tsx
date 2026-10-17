import { Room } from "@/lib/types";
import {
  Zap,
  Droplets,
  Wifi,
  Snowflake,
  Bitcoin,
  ShieldCheck,
  Home,
} from "lucide-react";
import Link from "next/link";

function ServiceTag({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
}) {
  if (!active) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-ink/60 bg-gray-100 px-2 py-0.5 rounded">
      <Icon size={12} />
      {label}
    </span>
  );
}

export function RoomCard({ room }: { room: Room }) {
  const whatsappUrl = `https://wa.me/${room.phone.replace(/\+/g, "")}?text=${encodeURIComponent(
    `Hola, vi tu habitación "${room.title}" en Rumi y me interesa. ¿Está disponible?`
  )}`;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-colors">
      {room.photos.length > 0 ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={room.photos[0]}
          alt={room.title}
          className="w-full aspect-[16/10] object-cover"
        />
      ) : (
        <div className="aspect-[16/10] bg-gradient-to-br from-primary-light/30 to-primary-light/10 flex items-center justify-center">
          <Home size={32} className="text-primary/30" />
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Price + location */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link
              href={`/habitacion/${room.id}`}
              className="font-semibold text-ink leading-tight hover:text-primary transition-colors"
            >
              {room.title}
            </Link>
            <p className="text-sm text-muted mt-0.5">
              {room.location_zone}, {room.location_city}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-lg font-bold text-primary">
              ${room.price}
            </span>
            <span className="text-xs text-muted">/mes</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs px-2 py-0.5 rounded bg-primary-light/40 text-primary-dark font-medium">
            {room.room_type === "privada" ? "Privada" : "Compartida"}
          </span>
          {room.verified && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
              <ShieldCheck size={11} />
              Verificado
            </span>
          )}
          {room.owner_direct && (
            <span className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent font-medium">
              Dueño directo
            </span>
          )}
        </div>

        {/* Services */}
        <div className="flex flex-wrap gap-1.5">
          <ServiceTag icon={Zap} label="Planta" active={room.has_planta} />
          <ServiceTag icon={Droplets} label="Agua" active={room.has_agua} />
          <ServiceTag icon={Wifi} label="WiFi" active={room.has_wifi} />
          <ServiceTag icon={Snowflake} label="A/C" active={room.has_ac} />
          <ServiceTag icon={Bitcoin} label="Crypto" active={room.accepts_crypto} />
        </div>

        {/* WhatsApp CTA */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-whatsapp hover:bg-whatsapp/90 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.67-1.388A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.239 0-4.308-.724-5.994-1.952a.5.5 0 00-.404-.078l-3.29.978.892-3.156a.5.5 0 00-.062-.425A9.956 9.956 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
          </svg>
          Contactar por WhatsApp
        </a>
      </div>
    </div>
  );
}
