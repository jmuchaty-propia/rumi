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
  room_type: "privada" | "compartida";
  gender_pref: "cualquiera" | "solo_mujeres" | "solo_hombres";
  available_from: string | null;
  phone: string;
  photos: string[];
  // Venezuela-specific filters
  has_planta: boolean;
  has_agua: boolean;
  has_wifi: boolean;
  has_ac: boolean;
  accepts_crypto: boolean;
  owner_direct: boolean;
  verified: boolean;
  includes_services: boolean;
  created_at: string;
}

export interface SeekerProfile {
  id: string;
  name: string;
  age: number | null;
  occupation: string | null;
  bio: string;
  budget_min: number;
  budget_max: number;
  currency: "USD" | "VES";
  preferred_city: string;
  preferred_zones: string[];
  move_in_date: string | null;
  gender: string | null;
  phone: string;
  verified: boolean;
  created_at: string;
}

export type Tab = "habitaciones" | "buscando";
