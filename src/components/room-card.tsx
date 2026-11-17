import { Room } from "@/lib/types";
import { Zap, Droplets, Wifi, Snowflake, Bitcoin, ShieldCheck, Camera, MapPin } from "lucide-react";
import Link from "next/link";
import { SafeImg } from "./ui";
import { ConditionTags } from "./conditions";
import { moveInCost } from "@/lib/types";

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
  const allPhotos = [...room.photos, ...(room.home_photos ?? [])];

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all">
      <Link href={`/habitacion/${room.id}`} className="block relative">
        <SafeImg
          src={allPhotos[0]}
          alt={room.title}
          className="w-full aspect-[16/10] object-cover"
        />
        <span className="absolute top-2 left-2 text-sm font-bold bg-white/95 text-ink px-2.5 py-1 rounded-lg shadow-sm">
          ${room.price}
          <span className="text-xs font-normal text-muted">/mes</span>
        </span>
        {allPhotos.length > 1 && (
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 text-xs font-medium bg-black/60 text-white px-2 py-0.5 rounded-full">
            <Camera size={12} />
            {allPhotos.length}
          </span>
        )}
        {room.is_demo && (
          <span className="absolute top-2 right-2 text-[10px] uppercase tracking-wide font-semibold bg-black/60 text-white px-2 py-0.5 rounded">
            Ejemplo
          </span>
        )}
      </Link>

      <div className="p-4 space-y-3">
        <div>
          <Link
            href={`/habitacion/${room.id}`}
            className="font-semibold text-ink leading-tight hover:text-primary transition-colors"
          >
            {room.title}
          </Link>
          <p className="text-sm text-muted mt-0.5 inline-flex items-center gap-1">
            <MapPin size={13} />
            {room.location_zone}, {room.location_city}
          </p>
        </div>

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
          <ServiceTag icon={Zap} label="Planta" active={room.has_planta} />
          <ServiceTag icon={Droplets} label="Agua" active={room.has_agua} />
          <ServiceTag icon={Wifi} label="WiFi" active={room.has_wifi} />
          <ServiceTag icon={Snowflake} label="A/C" active={room.has_ac} />
          <ServiceTag icon={Bitcoin} label="Crypto" active={room.accepts_crypto} />
        </div>

        <ConditionTags room={room} />

        <div className="flex items-center justify-between gap-2 pt-1">
          <p className="text-xs text-muted">
            Para mudarte: <span className="font-semibold text-ink">${moveInCost(room)}</span>
          </p>
          <Link
            href={`/habitacion/${room.id}`}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors"
          >
            Ver y postularme
          </Link>
        </div>
      </div>
    </div>
  );
}
