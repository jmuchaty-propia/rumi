export interface Room {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: "USD" | "VES";
  location_city: string;
  location_zone: string;
  latitude: number | null;
  longitude: number | null;
  /** true = pin exacto; false = zona aproximada (~500 m) */
  location_exact: boolean;
  room_type: "privada" | "compartida";
  gender_pref: "cualquiera" | "solo_mujeres" | "solo_hombres";
  available_from: string | null;
  phone: string;
  /** Fotos de la habitación */
  photos: string[];
  /** Fotos de la casa / áreas comunes */
  home_photos: string[];
  // Venezuela-specific filters
  has_planta: boolean;
  has_agua: boolean;
  has_wifi: boolean;
  has_ac: boolean;
  accepts_crypto: boolean;
  owner_direct: boolean;
  verified: boolean;
  includes_services: boolean;
  /** Anuncio de ejemplo (no contactable) */
  is_demo: boolean;
  created_at: string;
}

export type Gender = "masculino" | "femenino" | "prefiero_no_decir";
export type OccupationType = "trabajador" | "estudiante" | "otro";

export interface SeekerProfile {
  id: string;
  name: string;
  last_name: string | null;
  age: number | null;
  gender: Gender | null;
  occupation_type: OccupationType | null;
  /** Detalle libre: "Estudiante de Derecho (UCV)", "Diseñadora" */
  occupation: string | null;
  bio: string;
  budget_min: number;
  budget_max: number;
  currency: "USD" | "VES";
  preferred_city: string;
  preferred_zones: string[];
  move_in_date: string | null;
  avatar_url: string | null;
  phone: string;
  verified: boolean;
  is_demo: boolean;
  created_at: string;
}

export type Tab = "habitaciones" | "buscando";

export const OCCUPATION_LABELS: Record<OccupationType, string> = {
  trabajador: "Trabajador/a",
  estudiante: "Estudiante",
  otro: "Otro",
};

export const GENDER_LABELS: Record<Gender, string> = {
  masculino: "Masculino",
  femenino: "Femenino",
  prefiero_no_decir: "Prefiero no decir",
};

/** "María G." — el apellido completo no se muestra en público */
export function displayName(s: Pick<SeekerProfile, "name" | "last_name">) {
  const initial = s.last_name?.trim().charAt(0);
  return initial ? `${s.name} ${initial.toUpperCase()}.` : s.name;
}

export const CITIES = [
  "Caracas",
  "Valencia",
  "Maracaibo",
  "Barquisimeto",
  "Lechería",
  "Mérida",
  "Margarita",
];

/** Centros aproximados para iniciar el mapa */
export const CITY_CENTERS: Record<string, [number, number]> = {
  Caracas: [10.4806, -66.9036],
  Valencia: [10.1621, -68.0077],
  Maracaibo: [10.6427, -71.6125],
  Barquisimeto: [10.0678, -69.3474],
  Lechería: [10.1897, -64.693],
  Mérida: [8.5897, -71.1561],
  Margarita: [10.9577, -63.8697],
};

export const VENEZUELA_CENTER: [number, number] = [8.5, -66.5];

/** Radio (m) del círculo que se muestra cuando la ubicación es aproximada */
export const APPROX_RADIUS_M = 500;
