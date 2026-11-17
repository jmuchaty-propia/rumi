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
  // Condiciones del dueño
  smoking_allowed: boolean;
  /** vacío = cualquiera */
  allowed_occupations: OccupationType[];
  min_stay_months: number | null;
  deposit_months: number;
  advance_months: number;
  /** Anuncio de ejemplo (no contactable) */
  is_demo: boolean;
  is_active: boolean;
  created_at: string;
}

/** Datos privados: solo los ve el dueño en su panel */
export interface RoomPrivate extends Room {
  phone: string;
}

export type Gender = "masculino" | "femenino" | "prefiero_no_decir";
export type OccupationType = "trabajador" | "estudiante" | "otro";

export interface SeekerProfile {
  id: string;
  name: string;
  /** Inicial del apellido (el apellido completo no es público) */
  last_initial: string | null;
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
  smoker: boolean | null;
  stay_months: number | null;
  verified: boolean;
  is_demo: boolean;
  is_active: boolean;
  created_at: string;
}

export interface SeekerPrivate extends SeekerProfile {
  last_name: string | null;
  phone: string;
}

export type RequestStatus = "pendiente" | "aceptada" | "rechazada";

/** Postulación de alguien que busca a una habitación */
export interface Application {
  id: string;
  room_id: string;
  name: string;
  last_name: string;
  age: number;
  gender: Gender | null;
  occupation_type: OccupationType;
  occupation: string | null;
  smoker: boolean;
  stay_months: number | null;
  move_in_date: string | null;
  message: string;
  phone: string;
  avatar_url: string | null;
  status: RequestStatus;
  created_at: string;
}

/** Invitación de un dueño a alguien que busca */
export interface Invitation {
  id: string;
  seeker_id: string;
  name: string;
  message: string;
  room_url: string | null;
  price: number | null;
  zone: string | null;
  phone: string;
  status: RequestStatus;
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
export function displayName(s: { name: string; last_initial?: string | null; last_name?: string | null }) {
  const initial = s.last_initial || s.last_name?.trim().charAt(0);
  return initial ? `${s.name} ${initial.toUpperCase()}.` : s.name;
}

export const STAY_OPTIONS = [
  { v: 1, label: "1 mes" },
  { v: 3, label: "3 meses" },
  { v: 6, label: "6 meses" },
  { v: 12, label: "1 año o más" },
];

export function stayLabel(m: number | null) {
  if (!m) return "Sin mínimo";
  if (m >= 12) return m === 12 ? "1 año" : `${m} meses`;
  return m === 1 ? "1 mes" : `${m} meses`;
}

/** Qué condiciones del anuncio NO cumple una persona */
export function conditionMismatches(
  room: Pick<Room, "smoking_allowed" | "allowed_occupations" | "min_stay_months" | "gender_pref">,
  p: {
    smoker?: boolean | null;
    occupation_type?: OccupationType | null;
    stay_months?: number | null;
    gender?: Gender | null;
  }
): string[] {
  const out: string[] = [];
  if (!room.smoking_allowed && p.smoker) out.push("Solo no fumadores");
  if (
    room.allowed_occupations.length > 0 &&
    p.occupation_type &&
    !room.allowed_occupations.includes(p.occupation_type)
  )
    out.push(
      "Solo " + room.allowed_occupations.map((o) => OCCUPATION_PLURAL[o]).join(" o ")
    );
  if (room.min_stay_months && p.stay_months && p.stay_months < room.min_stay_months)
    out.push(`Estancia mínima ${stayLabel(room.min_stay_months)}`);
  if (room.gender_pref === "solo_mujeres" && p.gender === "masculino") out.push("Solo mujeres");
  if (room.gender_pref === "solo_hombres" && p.gender === "femenino") out.push("Solo hombres");
  return out;
}

export const OCCUPATION_PLURAL: Record<OccupationType, string> = {
  trabajador: "trabajadores",
  estudiante: "estudiantes",
  otro: "otros",
};

/** Lo que hay que pagar para mudarse: depósito + meses adelantados */
export function moveInCost(r: Pick<Room, "price" | "deposit_months" | "advance_months">) {
  return r.price * (r.deposit_months + r.advance_months);
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
