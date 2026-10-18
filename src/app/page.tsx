"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RoomCard } from "@/components/room-card";
import { SeekerCard } from "@/components/seeker-card";
import { FilterBar } from "@/components/filter-bar";
import { getRooms, getSeekers } from "@/lib/queries";
import { Room, SeekerProfile, Tab } from "@/lib/types";
import { Search, Plus, UserPlus } from "lucide-react";

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
      <div className="text-center space-y-2 py-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-ink tracking-tight">
          Encuentra tu cuarto ideal
        </h1>
        <p className="text-muted text-base max-w-md mx-auto">
          Habitaciones en Venezuela con contacto directo por WhatsApp.
          Sin intermediarios.
        </p>
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
          Buscan cuarto
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
            buscando cuarto
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
