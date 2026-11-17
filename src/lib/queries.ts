import { supabase } from "./supabase";
import {
  Application,
  Invitation,
  Room,
  RoomPrivate,
  SeekerPrivate,
  SeekerProfile,
} from "./types";

// Columnas públicas (sin teléfono ni token). La base de datos bloquea el resto.
const ROOM_COLS =
  "id,title,description,price,currency,location_city,location_zone,room_type,gender_pref," +
  "available_from,photos,home_photos,latitude,longitude,location_exact,has_planta,has_agua," +
  "has_wifi,has_ac,accepts_crypto,owner_direct,verified,includes_services,is_demo," +
  "smoking_allowed,allowed_occupations,min_stay_months,deposit_months,advance_months," +
  "is_active,created_at";

const SEEKER_COLS =
  "id,name,last_initial,age,gender,occupation_type,occupation,bio,budget_min,budget_max," +
  "currency,preferred_city,preferred_zones,move_in_date,avatar_url,smoker,stay_months," +
  "verified,is_demo,is_active,created_at";

export type NewRoom = Omit<RoomPrivate, "id" | "created_at" | "verified" | "is_demo" | "is_active">;
export type NewSeeker = Omit<
  SeekerPrivate,
  "id" | "created_at" | "verified" | "is_demo" | "is_active" | "last_initial"
>;
export type NewApplication = Omit<Application, "id" | "status" | "created_at">;
export type NewInvitation = Omit<Invitation, "id" | "status" | "created_at">;

export async function getRooms(): Promise<Room[]> {
  const { data, error } = await supabase
    .from("rooms")
    .select(ROOM_COLS)
    .order("is_demo", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as Room[]) || [];
}

export async function getSeekers(): Promise<SeekerProfile[]> {
  const { data, error } = await supabase
    .from("seekers")
    .select(SEEKER_COLS)
    .order("is_demo", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as SeekerProfile[]) || [];
}

export async function getRoomById(id: string): Promise<Room | null> {
  const { data, error } = await supabase.from("rooms").select(ROOM_COLS).eq("id", id).maybeSingle();
  if (error) return null; // ids no-UUID hacen fallar a Postgres
  return data as unknown as Room | null;
}

export async function getSeekerById(id: string): Promise<SeekerProfile | null> {
  const { data, error } = await supabase
    .from("seekers")
    .select(SEEKER_COLS)
    .eq("id", id)
    .maybeSingle();
  if (error) return null;
  return data as unknown as SeekerProfile | null;
}

/** Crea el anuncio y devuelve el token secreto de su panel */
export async function createRoom(room: Omit<NewRoom, "owner_token">): Promise<string> {
  const owner_token = crypto.randomUUID();
  const { error } = await supabase.from("rooms").insert({ ...room, owner_token });
  if (error) throw error;
  return owner_token;
}

export async function createSeeker(seeker: Omit<NewSeeker, "owner_token">): Promise<string> {
  const owner_token = crypto.randomUUID();
  const { error } = await supabase.from("seekers").insert({ ...seeker, owner_token });
  if (error) throw error;
  return owner_token;
}

export async function createApplication(a: NewApplication): Promise<void> {
  const { error } = await supabase.from("applications").insert(a);
  if (error) throw error;
}

export async function createInvitation(i: NewInvitation): Promise<void> {
  const { error } = await supabase.from("invitations").insert(i);
  if (error) throw error;
}

// ---- Paneles privados (por token) ----

export async function getRoomPanel(
  token: string
): Promise<{ room: RoomPrivate; applications: Application[] } | null> {
  const { data, error } = await supabase.rpc("get_room_panel", { p_token: token });
  if (error) return null;
  return data;
}

export async function setApplicationStatus(token: string, id: string, status: string) {
  const { error } = await supabase.rpc("set_application_status", {
    p_token: token,
    p_id: id,
    p_status: status,
  });
  if (error) throw error;
}

export async function setRoomActive(token: string, active: boolean) {
  const { error } = await supabase.rpc("set_room_active", { p_token: token, p_active: active });
  if (error) throw error;
}

export async function getSeekerPanel(
  token: string
): Promise<{ seeker: SeekerPrivate; invitations: Invitation[] } | null> {
  const { data, error } = await supabase.rpc("get_seeker_panel", { p_token: token });
  if (error) return null;
  return data;
}

export async function setInvitationStatus(token: string, id: string, status: string) {
  const { error } = await supabase.rpc("set_invitation_status", {
    p_token: token,
    p_id: id,
    p_status: status,
  });
  if (error) throw error;
}

export async function setSeekerActive(token: string, active: boolean) {
  const { error } = await supabase.rpc("set_seeker_active", { p_token: token, p_active: active });
  if (error) throw error;
}

/**
 * Reduce la foto en el teléfono antes de subirla (máx. 1600 px, JPEG).
 * Las fotos de celular pesan 3–8 MB; así suben rápido con datos móviles
 * y no chocan con el límite de 5 MB del bucket. Si el navegador no
 * puede decodificarla (p. ej. HEIC fuera de Safari) se sube la original.
 */
async function compressImage(file: File, maxSide = 1600, quality = 0.8): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

/** Sube una foto al bucket público y devuelve su URL. */
export async function uploadPhoto(
  file: File,
  folder: "rooms" | "homes" | "avatars"
): Promise<string> {
  const blob = await compressImage(file, folder === "avatars" ? 600 : 1600);
  const isJpeg = blob !== file || file.type === "image/jpeg";
  const ext = isJpeg ? "jpg" : file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("room-photos")
    .upload(fileName, blob, { contentType: isJpeg ? "image/jpeg" : file.type });
  if (error) throw error;
  const { data } = supabase.storage.from("room-photos").getPublicUrl(fileName);
  return data.publicUrl;
}
