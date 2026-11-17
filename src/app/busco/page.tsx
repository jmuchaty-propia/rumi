"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Camera, Check, User } from "lucide-react";
import Link from "next/link";
import { createSeeker, uploadPhoto } from "@/lib/queries";
import {
  CITIES,
  GENDER_LABELS,
  Gender,
  OCCUPATION_LABELS,
  OccupationType,
} from "@/lib/types";

function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Record<T, string>;
  value: T | "";
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {(Object.keys(options) as T[]).map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => onChange(k)}
          className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
            value === k
              ? "bg-primary/5 border-primary/40 text-primary font-medium"
              : "border-gray-200 text-ink/60 hover:border-gray-300"
          }`}
        >
          {options[k]}
        </button>
      ))}
    </div>
  );
}

export default function BuscoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [gender, setGender] = useState<Gender | "">("");
  const [occType, setOccType] = useState<OccupationType | "">("");
  const [form, setForm] = useState({
    name: "",
    last_name: "",
    age: "",
    occupation: "",
    budget: "",
    preferred_city: "",
    preferred_zones: "",
    bio: "",
    phone: "",
  });

  const avatarUrl = useMemo(() => (avatar ? URL.createObjectURL(avatar) : null), [avatar]);
  useEffect(() => () => {
    if (avatarUrl) URL.revokeObjectURL(avatarUrl);
  }, [avatarUrl]);

  const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-base sm:text-sm bg-white text-ink placeholder-muted/60 " +
    "focus:outline-none focus:ring-2 focus:ring-primary/30 mt-1";

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!gender || !occType) {
      setError("Selecciona tu género y si trabajas o estudias.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const avatar_url = avatar ? await uploadPhoto(avatar, "avatars") : null;
      const budget = Number(form.budget);
      await createSeeker({
        name: form.name.trim(),
        last_name: form.last_name.trim(),
        age: Number(form.age),
        gender,
        occupation_type: occType,
        occupation: form.occupation.trim() || null,
        bio: form.bio.trim(),
        // Presupuesto aproximado: un solo número
        budget_min: budget,
        budget_max: budget,
        currency: "USD",
        preferred_city: form.preferred_city,
        preferred_zones: form.preferred_zones
          .split(",")
          .map((z) => z.trim())
          .filter(Boolean),
        move_in_date: null,
        avatar_url,
        phone: form.phone,
      });
      setSubmitted(true);
    } catch {
      setError("No se pudo crear tu perfil. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center mx-auto">
          <Check size={28} className="text-primary" />
        </div>
        <h1 className="text-xl font-bold text-ink">Perfil creado</h1>
        <p className="text-muted text-sm">
          Tu perfil es visible para dueños de habitaciones. Te contactarán por
          WhatsApp si tienen algo para ti.
        </p>
        <Link href="/?tab=habitaciones" className="inline-block text-sm font-medium text-primary hover:underline">
          Mientras tanto, ver habitaciones
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink transition-colors"
      >
        <ArrowLeft size={16} />
        Volver
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-ink">Busco habitación</h1>
        <p className="text-sm text-muted mt-1">
          Crea tu perfil y deja que los dueños te encuentren y te escriban por WhatsApp.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Foto de perfil */}
        <div className="flex items-center gap-4">
          <label className="relative w-20 h-20 rounded-full overflow-hidden bg-rumi-soft border-2 border-dashed border-primary/30 flex items-center justify-center cursor-pointer shrink-0">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <User size={30} className="text-primary/40" />
            )}
            <span className="absolute bottom-0 inset-x-0 bg-primary/90 text-white flex justify-center py-0.5">
              <Camera size={12} />
            </span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => setAvatar(e.target.files?.[0] ?? null)}
            />
          </label>
          <div>
            <p className="text-sm font-medium text-ink">Foto de perfil</p>
            <p className="text-xs text-muted">
              Los perfiles con foto reciben más respuestas. Que se vea tu cara.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-ink">Nombre</label>
            <input
              type="text"
              required
              autoComplete="given-name"
              placeholder="María"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Apellido</label>
            <input
              type="text"
              required
              autoComplete="family-name"
              placeholder="González"
              value={form.last_name}
              onChange={(e) => update("last_name", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
        <p className="text-xs text-muted -mt-3">
          En tu perfil público solo se verá la inicial del apellido.
        </p>

        <div>
          <label className="text-sm font-medium text-ink">Edad</label>
          <input
            type="number"
            inputMode="numeric"
            required
            min={18}
            max={99}
            placeholder="24"
            value={form.age}
            onChange={(e) => update("age", e.target.value)}
            className={inputCls + " max-w-[8rem]"}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ink">Género</label>
          <Chips options={GENDER_LABELS} value={gender} onChange={setGender} />
        </div>

        <div>
          <label className="text-sm font-medium text-ink">Ocupación</label>
          <Chips options={OCCUPATION_LABELS} value={occType} onChange={setOccType} />
          {occType && (
            <input
              type="text"
              placeholder={
                occType === "estudiante"
                  ? "¿Qué y dónde estudias? (opcional)"
                  : occType === "trabajador"
                  ? "¿En qué trabajas? (opcional)"
                  : "Cuéntanos (opcional)"
              }
              value={form.occupation}
              onChange={(e) => update("occupation", e.target.value)}
              className={inputCls + " mt-2"}
            />
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-ink">Presupuesto aproximado (USD/mes)</label>
          <input
            type="number"
            inputMode="numeric"
            required
            min={1}
            placeholder="150"
            value={form.budget}
            onChange={(e) => update("budget", e.target.value)}
            className={inputCls + " max-w-[10rem]"}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ink">Ubicación preferida</label>
          <select
            required
            value={form.preferred_city}
            onChange={(e) => update("preferred_city", e.target.value)}
            className={inputCls}
          >
            <option value="">Ciudad</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Zonas: Chacao, Altamira, cerca de la UCV…"
            value={form.preferred_zones}
            onChange={(e) => update("preferred_zones", e.target.value)}
            className={inputCls + " mt-2"}
          />
          <p className="text-xs text-muted mt-1">Separa las zonas con comas</p>
        </div>

        <div>
          <label className="text-sm font-medium text-ink">
            Sobre ti <span className="text-muted font-normal">(opcional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Horarios, si fumas, mascotas, cuándo te quieres mudar…"
            value={form.bio}
            onChange={(e) => update("bio", e.target.value)}
            className={inputCls + " resize-none"}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ink">WhatsApp (con código de país)</label>
          <input
            type="tel"
            required
            placeholder="+584141234567"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={inputCls}
          />
          <p className="text-xs text-muted mt-1">Así te escriben los dueños.</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors disabled:opacity-60"
        >
          {submitting ? "Creando…" : "Crear mi perfil"}
        </button>
      </form>
    </div>
  );
}
