"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getSeekerPanel, setInvitationStatus, setSeekerActive } from "@/lib/queries";
import { Invitation, RequestStatus, SeekerPrivate } from "@/lib/types";
import { RequestCard, StatusTabs } from "@/components/request-card";
import { SafeImg } from "@/components/ui";
import { savePanel } from "@/lib/local";

export default function SeekerPanelPage() {
  const { token } = useParams<{ token: string }>();
  const [seeker, setSeeker] = useState<SeekerPrivate | null>(null);
  const [invs, setInvs] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<RequestStatus>("pendiente");

  const load = useCallback(() => {
    getSeekerPanel(token)
      .then((d) => {
        if (d?.seeker) {
          setSeeker(d.seeker);
          setInvs(d.invitations);
          savePanel({ kind: "seeker", token, title: `Perfil de ${d.seeker.name}` });
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(load, [load]);

  async function changeStatus(id: string, status: RequestStatus) {
    setInvs((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    try {
      await setInvitationStatus(token, id, status);
    } catch {
      load();
    }
  }

  async function toggleActive() {
    if (!seeker) return;
    const next = !seeker.is_active;
    setSeeker({ ...seeker, is_active: next });
    try {
      await setSeekerActive(token, next);
    } catch {
      load();
    }
  }

  if (loading) return <p className="text-center text-sm text-muted py-20">Cargando…</p>;
  if (!seeker) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-3">
        <p className="text-ink/60">Este link no es válido.</p>
        <p className="text-xs text-muted">Revisa que lo copiaste completo.</p>
      </div>
    );
  }

  const counts = {
    pendiente: invs.filter((i) => i.status === "pendiente").length,
    aceptada: invs.filter((i) => i.status === "aceptada").length,
    rechazada: invs.filter((i) => i.status === "rechazada").length,
  };
  const visible = invs.filter((i) => i.status === tab);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <div>
        <p className="text-xs font-medium text-primary uppercase tracking-wide">Panel privado</p>
        <h1 className="text-xl font-bold text-ink">Invitaciones</h1>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-3 flex gap-3 items-center">
        <SafeImg
          src={seeker.avatar_url}
          alt={seeker.name}
          fallbackIcon={false}
          className="w-14 h-14 rounded-full object-cover shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink truncate">
            {seeker.name} {seeker.last_name}
          </p>
          <p className="text-sm text-muted">
            ~${seeker.budget_max}/mes · {seeker.preferred_city}
          </p>
          <span
            className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
              seeker.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-muted"
            }`}
          >
            {seeker.is_active ? "● Perfil visible" : "Oculto"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <Link
          href="/?tab=habitaciones"
          className="text-center py-2.5 bg-primary text-white font-medium rounded-lg"
        >
          Ver habitaciones
        </Link>
        <button onClick={toggleActive} className="py-2.5 border border-gray-200 rounded-lg text-ink/70">
          {seeker.is_active ? "Ya encontré 🎉 (ocultar)" : "Volver a mostrar"}
        </button>
      </div>

      <StatusTabs value={tab} onChange={setTab} counts={counts} />

      {visible.length === 0 ? (
        <p className="text-center text-sm text-muted py-10">
          {tab === "pendiente"
            ? "Aún no tienes invitaciones. Mientras tanto, postúlate a habitaciones que te gusten."
            : "Nada por aquí."}
        </p>
      ) : (
        <div className="space-y-3">
          {visible.map((i) => {
            const msg = encodeURIComponent(
              `Hola ${i.name}, vi tu invitación en Rumi para la habitación en ${i.zone ?? "tu zona"}. ¡Me interesa! ¿Podemos hablar?`
            );
            return (
              <RequestCard
                key={i.id}
                title={i.name}
                subtitle={[i.zone, i.price ? `$${i.price}/mes` : null].filter(Boolean).join(" · ")}
                status={i.status}
                whatsappUrl={`https://wa.me/${i.phone.replace(/\D/g, "")}?text=${msg}`}
                contactLabel="Me interesa — responder"
                onAccept={() => changeStatus(i.id, "aceptada")}
                onReject={() => changeStatus(i.id, "rechazada")}
                createdAt={i.created_at}
              >
                <p className="text-sm text-ink/80 bg-gray-50 rounded-lg px-3 py-2 whitespace-pre-line">
                  {i.message}
                </p>
                {i.room_url && (
                  <a
                    href={i.room_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary font-medium"
                  >
                    <ExternalLink size={14} /> Ver la habitación
                  </a>
                )}
              </RequestCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
