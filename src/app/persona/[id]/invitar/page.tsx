"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Lock } from "lucide-react";
import { createInvitation, getSeekerById } from "@/lib/queries";
import { SeekerProfile, displayName } from "@/lib/types";
import { SeekerCard } from "@/components/seeker-card";
import { inputCls } from "@/components/form-bits";

export default function InvitarPage() {
  const { id } = useParams<{ id: string }>();
  const [seeker, setSeeker] = useState<SeekerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    zone: "",
    price: "",
    room_url: "",
    message: "",
    phone: "",
  });

  useEffect(() => {
    getSeekerById(id)
      .then(setSeeker)
      .finally(() => setLoading(false));
  }, [id]);

  const update = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  if (loading) return <p className="text-center text-sm text-muted py-20">Cargando…</p>;
  if (!seeker) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-ink/60">Este perfil ya no está disponible.</p>
        <Link href="/?tab=buscando" className="text-primary text-sm font-medium hover:underline">
          Ver otras personas buscando
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!seeker) return;
    setSubmitting(true);
    setError("");
    try {
      await createInvitation({
        seeker_id: seeker.id,
        name: form.name.trim(),
        zone: form.zone.trim() || null,
        price: form.price ? Number(form.price) : null,
        room_url: form.room_url.trim() || null,
        message: form.message.trim(),
        phone: form.phone,
      });
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
        <h1 className="text-xl font-bold text-ink">Invitación enviada</h1>
        <p className="text-muted text-sm">
          {seeker.name} verá tu invitación. Si le interesa, te escribirá por WhatsApp.
        </p>
        <Link href="/?tab=buscando" className="inline-block text-sm font-medium text-primary hover:underline">
          Ver más personas buscando
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <Link
        href="/?tab=buscando"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink transition-colors"
      >
        <ArrowLeft size={16} />
        Volver
      </Link>

      <h1 className="text-2xl font-bold text-ink">Invitar a {displayName(seeker)}</h1>

      <div className="pointer-events-none [&_a]:hidden">
        <SeekerCard seeker={seeker} />
      </div>

      {seeker.is_demo ? (
        <p className="text-sm text-center text-muted bg-gray-50 rounded-lg py-3">
          Este es un perfil de ejemplo: no recibe invitaciones.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-sm text-muted">
            Cuéntale de tu habitación. Si le interesa, te escribirá por WhatsApp.
          </p>

          <div>
            <label className="text-sm font-medium text-ink">Tu nombre</label>
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Carmen"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-ink">Zona</label>
              <input
                required
                value={form.zone}
                onChange={(e) => update("zone", e.target.value)}
                placeholder="Chacao"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Precio/mes (USD)</label>
              <input
                type="number"
                inputMode="numeric"
                required
                min={1}
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder="150"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-ink">
              Link de tu anuncio en Rumi <span className="text-muted font-normal">(opcional)</span>
            </label>
            <input
              type="url"
              value={form.room_url}
              onChange={(e) => update("room_url", e.target.value)}
              placeholder="https://…/habitacion/…"
              className={inputCls}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink">Mensaje</label>
            <textarea
              rows={3}
              required
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              placeholder="Hola, tengo una habitación que encaja con lo que buscas…"
              className={inputCls + " resize-none"}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink">Tu WhatsApp</label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+584141234567"
              className={inputCls}
            />
            <p className="text-xs text-muted mt-1 inline-flex items-center gap-1">
              <Lock size={12} />
              Solo lo verá {seeker.name}.
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors disabled:opacity-60"
          >
            {submitting ? "Enviando…" : "Enviar invitación"}
          </button>
        </form>
      )}
    </div>
  );
}
