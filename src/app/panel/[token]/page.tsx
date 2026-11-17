"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Eye, Share2 } from "lucide-react";
import { getRoomPanel, setApplicationStatus, setRoomActive } from "@/lib/queries";
import {
  Application,
  GENDER_LABELS,
  OCCUPATION_LABELS,
  RequestStatus,
  RoomPrivate,
  conditionMismatches,
  stayLabel,
} from "@/lib/types";
import { RequestCard, StatusTabs } from "@/components/request-card";
import { SafeImg } from "@/components/ui";
import { savePanel } from "@/lib/local";

export default function RoomPanelPage() {
  const { token } = useParams<{ token: string }>();
  const [room, setRoom] = useState<RoomPrivate | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<RequestStatus>("pendiente");

  const load = useCallback(() => {
    getRoomPanel(token)
      .then((d) => {
        if (d?.room) {
          setRoom(d.room);
          setApps(d.applications);
          savePanel({ kind: "room", token, title: d.room.title });
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(load, [load]);

  async function changeStatus(id: string, status: RequestStatus) {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    try {
      await setApplicationStatus(token, id, status);
    } catch {
      load();
    }
  }

  async function toggleActive() {
    if (!room) return;
    const next = !room.is_active;
    setRoom({ ...room, is_active: next });
    try {
      await setRoomActive(token, next);
    } catch {
      load();
    }
  }

  if (loading) return <p className="text-center text-sm text-muted py-20">Cargando…</p>;
  if (!room) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-3">
        <p className="text-ink/60">Este link no es válido.</p>
        <p className="text-xs text-muted">Revisa que lo copiaste completo.</p>
      </div>
    );
  }

  const counts = {
    pendiente: apps.filter((a) => a.status === "pendiente").length,
    aceptada: apps.filter((a) => a.status === "aceptada").length,
    rechazada: apps.filter((a) => a.status === "rechazada").length,
  };
  const visible = apps.filter((a) => a.status === tab);
  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/habitacion/${room.id}` : "";
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(
    `🏠 ${room.title} — $${room.price}/mes en ${room.location_zone}. Postúlate aquí: ${publicUrl}`
  )}`;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <div>
        <p className="text-xs font-medium text-primary uppercase tracking-wide">Panel privado</p>
        <h1 className="text-xl font-bold text-ink">Postulaciones</h1>
      </div>

      {/* Anuncio */}
      <div className="bg-white border border-gray-100 rounded-xl p-3 flex gap-3 items-center">
        <SafeImg src={room.photos[0]} alt={room.title} className="w-16 h-16 rounded-lg object-cover shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink truncate">{room.title}</p>
          <p className="text-sm text-muted">
            ${room.price}/mes · {room.location_zone}
          </p>
          <span
            className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
              room.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-muted"
            }`}
          >
            {room.is_active ? "● Publicada" : "Pausada (no aparece en Rumi)"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <Link
          href={`/habitacion/${room.id}`}
          className="flex flex-col items-center gap-1 py-2 border border-gray-200 rounded-lg text-ink/70"
        >
          <Eye size={16} /> Ver anuncio
        </Link>
        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 py-2 border border-gray-200 rounded-lg text-ink/70"
        >
          <Share2 size={16} /> Compartir
        </a>
        <button
          onClick={toggleActive}
          className="flex flex-col items-center justify-center gap-1 py-2 border border-gray-200 rounded-lg text-ink/70"
        >
          {room.is_active ? "⏸ Pausar / alquilada" : "▶ Reactivar"}
        </button>
      </div>

      <StatusTabs value={tab} onChange={setTab} counts={counts} />

      {visible.length === 0 ? (
        <p className="text-center text-sm text-muted py-10">
          {tab === "pendiente"
            ? "Aún no hay postulaciones nuevas. Comparte tu anuncio para recibir más."
            : "Nada por aquí."}
        </p>
      ) : (
        <div className="space-y-3">
          {visible.map((a) => {
            const mism = conditionMismatches(room, a);
            const msg = encodeURIComponent(
              `Hola ${a.name}, soy el dueño de "${room.title}" en Rumi. Vi tu postulación y me gustaría conversar. ¿Cuándo podrías venir a verla?`
            );
            return (
              <RequestCard
                key={a.id}
                avatarUrl={a.avatar_url}
                title={`${a.name} ${a.last_name}, ${a.age}`}
                subtitle={[
                  a.occupation || OCCUPATION_LABELS[a.occupation_type],
                  a.gender && a.gender !== "prefiero_no_decir" ? GENDER_LABELS[a.gender] : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                status={a.status}
                matchOk={mism.length === 0}
                mismatches={mism}
                whatsappUrl={`https://wa.me/${a.phone.replace(/\D/g, "")}?text=${msg}`}
                contactLabel="Escribirle por WhatsApp"
                onAccept={() => changeStatus(a.id, "aceptada")}
                onReject={() => changeStatus(a.id, "rechazada")}
                createdAt={a.created_at}
              >
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <span className="bg-gray-100 text-ink/70 px-2 py-0.5 rounded">
                    {a.smoker ? "🚬 Fuma" : "🚭 No fuma"}
                  </span>
                  {a.stay_months && (
                    <span className="bg-gray-100 text-ink/70 px-2 py-0.5 rounded">
                      📅 {stayLabel(a.stay_months)}
                    </span>
                  )}
                  {a.move_in_date && (
                    <span className="bg-gray-100 text-ink/70 px-2 py-0.5 rounded">
                      🚚 Desde{" "}
                      {new Date(a.move_in_date + "T12:00").toLocaleDateString("es-VE", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  )}
                </div>
                {a.message && (
                  <p className="text-sm text-ink/80 bg-gray-50 rounded-lg px-3 py-2 whitespace-pre-line">
                    {a.message}
                  </p>
                )}
              </RequestCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
