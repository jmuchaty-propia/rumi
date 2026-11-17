"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RoomCard } from "@/components/room-card";
import { SeekerCard } from "@/components/seeker-card";
import { FilterBar } from "@/components/filter-bar";
import { getRooms, getSeekers } from "@/lib/queries";
import { Room, SeekerProfile, Tab } from "@/lib/types";
import { Search, Plus, UserPlus, MapPin, Camera, MessageCircle } from "lucide-react";
import { SafeImg } from "@/components/ui";
import { RoomMap } from "@/components/room-map";

export default function Home() {
  const [tab, setTab] = useState<Tab>("habitaciones");
  const [city, setCity] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    has_planta: false,
    has_agua: false,
    has_wifi: false,
    accepts_crypto: false,
    owner_direct: false,
  });

  const [rooms, setRooms] = useState<Room[]>([]);
  const [seekers, setSeekers] = useState<SeekerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    // /habitaciones and /buscando redirect here with ?tab=
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t === "habitaciones" || t === "buscando") setTab(t);

    Promise.all([getRooms(), getSeekers()])
      .then(([r, s]) => {
        setRooms(r);
        setSeekers(s);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  const heroRooms = rooms.filter((r) => r.photos.length > 0).slice(0, 3);
  const cities = Array.from(new Set(rooms.map((r) => r.location_city)));

  const filteredRooms = rooms.filter((room) => {
    if (city && room.location_city !== city) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !room.title.toLowerCase().includes(q) &&
        !room.location_zone.toLowerCase().includes(q) &&
        !room.location_city.toLowerCase().includes(q)
      )
        return false;
    }
    if (filters.has_planta && !room.has_planta) return false;
    if (filters.has_agua && !room.has_agua) return false;
    if (filters.has_wifi && !room.has_wifi) return false;
    if (filters.accepts_crypto && !room.accepts_crypto) return false;
    if (filters.owner_direct && !room.owner_direct) return false;
    return true;
  });

  const filteredSeekers = seekers.filter((s) => {
    if (city && s.preferred_city !== city) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !s.name.toLowerCase().includes(q) &&
        !s.preferred_city.toLowerCase().includes(q) &&
        !(s.occupation ?? "").toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  return (
    <div className="max-w-content mx-auto px-4 py-6 space-y-6">
      {/* Hero */}
      <div className="grid gap-6 sm:grid-cols-2 sm:items-center pt-2 sm:py-8">
        <div className="space-y-4 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight leading-tight">
            Alquila una habitación,{" "}
            <span className="text-primary">no un apartamento entero</span>
          </h1>
          <p className="text-muted text-base sm:text-lg">
            Habitaciones con fotos reales, condiciones claras y contacto directo
            por WhatsApp. Sin intermediarios.
          </p>
          <div className="flex gap-2 justify-center sm:justify-start">
            <Link
              href="/busco"
              className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Busco habitación
            </Link>
            <Link
              href="/publicar"
              className="px-4 py-2.5 border border-primary/30 text-primary text-sm font-semibold rounded-lg hover:bg-rumi-soft transition-colors"
            >
              Publicar gratis
            </Link>
          </div>
        </div>

        {/* Collage con fotos reales de los anuncios */}
        <div className="grid grid-cols-3 grid-rows-2 gap-2 h-48 sm:h-72">
          {[0, 1, 2].map((i) => {
            const r = heroRooms[i];
            return (
              <Link
                key={i}
                href={r ? `/habitacion/${r.id}` : "/publicar"}
                className={`relative overflow-hidden rounded-xl ${
                  i === 0 ? "col-span-2 row-span-2" : ""
                }`}
              >
                <SafeImg
                  src={r?.photos[0]}
                  alt={r?.title ?? "Habitación"}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                {r && (
                  <span className="absolute bottom-1.5 left-1.5 text-[11px] font-semibold bg-white/95 text-ink px-2 py-0.5 rounded-md">
                    ${r.price} · {r.location_zone}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Cómo funciona */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { icon: Camera, t: "Fotos reales", d: "De la habitación y la casa" },
          { icon: MapPin, t: "Zona en el mapa", d: "Sabes dónde queda" },
          { icon: MessageCircle, t: "WhatsApp directo", d: "Hablas con el dueño" },
        ].map(({ icon: Icon, t, d }) => (
          <div key={t} className="bg-rumi-soft rounded-xl px-2 py-3">
            <Icon size={20} className="text-primary mx-auto" />
            <p className="text-xs sm:text-sm font-semibold text-ink mt-1">{t}</p>
            <p className="text-[11px] sm:text-xs text-muted">{d}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-rumi-soft p-1 rounded-lg max-w-sm mx-auto">
        <button
          onClick={() => setTab("habitaciones")}
          className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${
            tab === "habitaciones"
              ? "bg-white text-ink shadow-sm"
              : "text-ink/50 hover:text-ink/70"
          }`}
        >
          Habitaciones
        </button>
        <button
          onClick={() => setTab("buscando")}
          className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${
            tab === "buscando"
              ? "bg-white text-ink shadow-sm"
              : "text-ink/50 hover:text-ink/70"
          }`}
        >
          Personas buscando
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md mx-auto">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="text"
          placeholder={
            tab === "habitaciones"
              ? "Buscar por zona, ciudad..."
              : "Buscar por nombre, ciudad..."
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 placeholder:text-muted/60"
        />
      </div>

      {/* Filters (rooms only) */}
      {tab === "habitaciones" && (
        <FilterBar
          cities={cities}
          selectedCity={city}
          onCityChange={setCity}
          priceRange={[0, 500]}
          onPriceChange={() => {}}
          filters={filters}
          onFilterChange={(key, value) =>
            setFilters((prev) => ({ ...prev, [key]: value }))
          }
        />
      )}

      {/* Map toggle + Map */}
      {tab === "habitaciones" && (
        <div className="space-y-3">
          <button
            onClick={() => setShowMap(!showMap)}
            className="flex items-center gap-2 text-sm text-primary font-medium hover:text-primary-dark transition-colors"
          >
            <MapPin size={16} />
            {showMap ? "Ocultar mapa" : "Ver mapa de habitaciones"}
          </button>
          {showMap && <RoomMap rooms={filteredRooms} />}
        </div>
      )}

      {/* CTAs */}
      <div className="flex gap-3 max-w-md mx-auto">
        {tab === "habitaciones" ? (
          <Link
            href="/publicar"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={16} />
            Publicar cuarto
          </Link>
        ) : (
          <Link
            href="/busco"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <UserPlus size={16} />
            Crear mi perfil
          </Link>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <p className="text-center text-sm text-muted py-12">Cargando...</p>
      ) : loadError ? (
        <p className="text-center text-sm text-ink/60 py-12">
          No pudimos cargar los anuncios. Intenta de nuevo en un momento.
        </p>
      ) : tab === "habitaciones" ? (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            {filteredRooms.length} habitacion{filteredRooms.length !== 1 && "es"}{" "}
            disponible{filteredRooms.length !== 1 && "s"}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
          {filteredRooms.length === 0 && (
            <div className="text-center py-12 space-y-2">
              <p className="text-ink/60">
                No hay habitaciones con esos filtros todavía.
              </p>
              <Link
                href="/publicar"
                className="text-primary font-medium text-sm hover:underline"
              >
                Sé el primero en publicar en esta zona
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            {filteredSeekers.length} persona{filteredSeekers.length !== 1 && "s"}{" "}
            buscando
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredSeekers.map((seeker) => (
              <SeekerCard key={seeker.id} seeker={seeker} />
            ))}
          </div>
          {filteredSeekers.length === 0 && (
            <div className="text-center py-12 space-y-2">
              <p className="text-ink/60">
                Nadie buscando en esta ciudad todavía.
              </p>
              <Link
                href="/busco"
                className="text-primary font-medium text-sm hover:underline"
              >
                Crea tu perfil de búsqueda
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
