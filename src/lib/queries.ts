import { supabase } from "./supabase";
import { Room, SeekerProfile } from "./types";

export type NewRoom = Omit<Room, "id" | "created_at" | "verified" | "is_demo">;
export type NewSeeker = Omit<SeekerProfile, "id" | "created_at" | "verified" | "is_demo">;

export async function getRooms(): Promise<Room[]> {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    // Anuncios reales primero, ejemplos al final
    .order("is_demo", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getSeekers(): Promise<SeekerProfile[]> {
  const { data, error } = await supabase
    .from("seekers")
    .select("*")
    .order("is_demo", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getRoomById(id: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  // Non-UUID ids make Postgres error out; treat as not found
  if (error) return null;
  return data;
}

export async function createRoom(room: NewRoom): Promise<void> {
  const { error } = await supabase.from("rooms").insert(room);
  if (error) throw error;
}

export async function createSeeker(seeker: NewSeeker): Promise<void> {
  const { error } = await supabase.from("seekers").insert(seeker);
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

/** Sube una foto al bucket público y devuelve su URL. folder: rooms | homes | avatars */
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
