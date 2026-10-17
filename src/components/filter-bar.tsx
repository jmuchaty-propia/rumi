"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

interface FilterBarProps {
  cities: string[];
  selectedCity: string;
  onCityChange: (city: string) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  filters: {
    has_planta: boolean;
    has_agua: boolean;
    has_wifi: boolean;
    accepts_crypto: boolean;
    owner_direct: boolean;
  };
  onFilterChange: (key: string, value: boolean) => void;
}

export function FilterBar({
  cities,
  selectedCity,
  onCityChange,
  filters,
  onFilterChange,
}: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const activeCount = Object.values(filters).filter(Boolean).length +
    (selectedCity ? 1 : 0);

  return (
    <div className="space-y-3">
      {/* City pills + filter toggle */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => onCityChange("")}
          className={`shrink-0 text-sm px-3 py-1.5 rounded-lg transition-colors ${
            !selectedCity
              ? "bg-primary text-white"
              : "bg-gray-100 text-ink/60 hover:bg-gray-200"
          }`}
        >
          Todas
        </button>
        {cities.map((city) => (
          <button
            key={city}
            onClick={() => onCityChange(city === selectedCity ? "" : city)}
            className={`shrink-0 text-sm px-3 py-1.5 rounded-lg transition-colors ${
              city === selectedCity
                ? "bg-primary text-white"
                : "bg-gray-100 text-ink/60 hover:bg-gray-200"
            }`}
          >
            {city}
          </button>
        ))}

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`shrink-0 ml-auto inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${
            activeCount > 0
              ? "bg-primary/10 text-primary"
              : "bg-gray-100 text-ink/60 hover:bg-gray-200"
          }`}
        >
          {showFilters ? <X size={14} /> : <SlidersHorizontal size={14} />}
          Filtros
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border border-gray-100">
          {[
            { key: "has_planta", label: "Planta eléctrica" },
            { key: "has_agua", label: "Agua 24h" },
            { key: "has_wifi", label: "WiFi" },
            { key: "accepts_crypto", label: "Acepta crypto" },
            { key: "owner_direct", label: "Dueño directo" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() =>
                onFilterChange(key, !filters[key as keyof typeof filters])
              }
              className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                filters[key as keyof typeof filters]
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-gray-200 text-ink/60 hover:border-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
