"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Check } from "lucide-react";
import { createApplication, getRoomById, uploadPhoto } from "@/lib/queries";
import { Gender, OccupationType, Room, conditionMismatches } from "@/lib/types";
import {
  AvatarPicker,
  ProfileFields,
  ProfileState,
  emptyProfile,
  inputCls,
  missingProfileChoice,
} from "@/components/form-bits";
import { RoomConditions } from "@/components/conditions";
import { SafeImg } from "@/components/ui";
import { getMyProfile, saveMyProfile } from "@/lib/local";

export default function PostularPage() {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileState>(emptyProfile);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [savedAvatar, setSavedAvatar] = useState<string | null>(null);
  const [moveIn, setMoveIn] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getRoomById(id)
      .then(setRoom)
      .finally(() => setLoading(false));
    const saved = getMyProfile();
    setProfile((p) => ({ ...p, ...saved }));
    setSavedAvatar(saved.avatar_url ?? null);
  }, [id]);

  if (loading) return <p className="text-center text-sm text-muted py-20">Cargando…</p>;
  if (!room) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-ink/60">Esta habitación ya no está disponible.</p>
        <Link href="/" className="text-primary text-sm font-medium hover:underline">
          Ver otras habitaciones
        </Link>
      </div>
    );
  }

  const mismatches = conditionMismatches(room, {
    smoker: profile.smoker ? profile.smoker === "si" : null,
    occupation_type: (profile.occupation_type || null) as OccupationType | null,
    stay_months: Number(profile.stay_months) || null,
    gender: (profile.gender || null) as Gender | null,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!room) return;
    const missing = missingProfileChoice(profile);
    if (missing) {
      setError(missing);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const avatar_url = avatar ? await uploadPhoto(avatar, "avatars") : savedAvatar;
      await createApplication({
        room_id: room.id,
        name: profile.name.trim(),
        last_name: profile.last_name.trim(),
        age: Number(profile.age),
        gender: profile.gender as Gender,
        occupation_type: profile.occupation_type as OccupationType,
        occupation: profile.occupation.trim() || null,
        smoker: profile.smoker === "si",
        stay_months: Number(profile.stay_months),
        move_in_date: moveIn || null,
        message: message.trim(),
        phone: profile.phone,
        avatar_url,
      });
      saveMyProfile({ ...profile, avatar_url });
      setSent(true);
    } catch {
      setError("No se pudo enviar. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center mx-auto">
          <Check size={28} className="text-primary" />
        </div>
        <h1 className="text-xl font-bold text-ink">Postulación enviada</h1>
        <p className="text-muted text-sm">
          El dueño de <b>{room.title}</b> verá tu perfil. Si le interesa, te escribirá por
          WhatsApp. Mientras tanto, puedes postularte a otras habitaciones.
        </p>
        <Link href="/" className="inline-block text-sm font-medium text-primary hover:underline">
          Ver más habitaciones
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <Link
        href={`/habitacion/${room.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink transition-colors"
      >
        <ArrowLeft size={16} />
        Volver al anuncio
      </Link>

      <div className="flex gap-3 items-center">
        <SafeImg
          src={room.photos[0]}
          alt={room.title}
          className="w-16 h-16 rounded-lg object-cover shrink-0"
        />
        <div className="min-w-0">
          <p className="text-xs text-muted">Postularte a</p>
          <h1 className="font-bold text-ink leading-tight truncate">{room.title}</h1>
          <p className="text-sm text-primary font-semibold">${room.price}/mes</p>
        </div>
      </div>

      <details className="bg-white border border-gray-100 rounded-xl p-4">
        <summary className="text-sm font-semibold text-ink cursor-pointer">
          Condiciones del dueño
        </summary>
        <div className="mt-3">
          <RoomConditions room={room} />
        </div>
      </details>

      {room.is_demo ? (
        <p className="text-sm text-center text-muted bg-gray-50 rounded-lg py-3">
          Este es un anuncio de ejemplo: no recibe postulaciones.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-sm text-muted">
            El dueño verá tu perfil y decidirá si te escribe. Tu WhatsApp solo lo ve él.
          </p>

          <AvatarPicker file={avatar} existingUrl={savedAvatar} onChange={setAvatar} />
          <ProfileFields value={profile} onChange={setProfile} />

          <div>
            <label className="text-sm font-medium text-ink">
              ¿Cuándo te quieres mudar? <span className="text-muted font-normal">(opcional)</span>
            </label>
            <input
              type="date"
              value={moveIn}
              onChange={(e) => setMoveIn(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink">Mensaje para el dueño</label>
            <textarea
              rows={3}
              required
              placeholder="Preséntate: a qué te dedicas, tus horarios, por qué te interesa…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={inputCls + " resize-none"}
            />
          </div>

          {mismatches.length > 0 && (
            <div className="flex gap-2 text-sm bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">No cumples algunas condiciones:</p>
                <p>{mismatches.join(" · ")}</p>
                <p className="text-xs mt-1">Puedes enviarla igual, pero es probable que la rechacen.</p>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors disabled:opacity-60"
          >
            {submitting ? "Enviando…" : "Enviar postulación"}
          </button>
        </form>
      )}
    </div>
  );
}
