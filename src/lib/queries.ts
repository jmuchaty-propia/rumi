import { supabase } from "./supabase";
import { Room, SeekerProfile } from "./types";

export type NewRoom = Omit<Room, "id" | "created_at" | "verified">;
export type NewSeeker = Omit<SeekerProfile, "id" | "created_at" | "verified">;

export async function getRooms(): Promise<Room[]> {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getSeekers(): Promise<SeekerProfile[]> {
  const { data, error } = await supabase
    .from("seekers")
    .select("*")
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

export async function uploadRoomPhoto(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("room-photos")
    .upload(fileName, file, { contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage.from("room-photos").getPublicUrl(fileName);
  return data.publicUrl;
}
