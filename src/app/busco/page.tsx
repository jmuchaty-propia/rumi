"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createSeeker, uploadPhoto } from "@/lib/queries";
import { CITIES, Gender, OccupationType } from "@/lib/types";
import {
  AvatarPicker,
  PrivateLinkCard,
  ProfileFields,
  ProfileState,
  emptyProfile,
  inputCls,
  missingProfileChoice,
} from "@/components/form-bits";
import { getMyProfile, panelUrl, saveMyProfile, savePanel } from "@/lib/local";

export default function BuscoPage() {
  const [panelLink, setPanelLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [profile, setProfile] = useState<ProfileState>(emptyProfile);
  const [form, setForm] = useState({
    budget: "",
    preferred_city: "",
    preferred_zones: "",
    bio: "",
  });

  // Si ya se postuló antes, reusar sus datos
  useEffect(() => {
    const saved = getMyProfile();
    setProfile((p) => ({ ...p, ...saved }));
  }, []);

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const missing = missingProfileChoice(profile);
    if (missing) {
      setError(missing);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const avatar_url = avatar
        ? await uploadPhoto(avatar, "avatars")
        : getMyProfile().avatar_url ?? null;
      const budget = Number(form.budget);
      const token = await createSeeker({
        name: profile.name.trim(),
        last_name: profile.last_name.trim(),
        age: Number(profile.age),
        gender: profile.gender as Gender,
        occupation_type: profile.occupation_type as OccupationType,
        occupation: profile.occupation.trim() || null,
        smoker: profile.smoker === "si",
        stay_months: Number(profile.stay_months),
        bio: form.bio.trim(),
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
        phone: profile.phone,
      });
      saveMyProfile({ ...profile, avatar_url });
      savePanel({ kind: "seeker", token, title: `Perfil de ${profile.name}` });
      setPanelLink(panelUrl({ kind: "seeker", token }));
    } catch {
      setError("No se pudo crear tu perfil. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (panelLink) {
    return (
      <PrivateLinkCard
        url={panelLink}
        phone={profile.phone}
        title="¡Perfil creado!"
        description="Los dueños podrán invitarte a ver su habitación. Tú decides a quién responder — tu WhatsApp no es público."
      />
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
          Crea tu perfil y deja que los dueños te encuentren e inviten. Tu contacto es privado.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <AvatarPicker file={avatar} existingUrl={getMyProfile().avatar_url} onChange={setAvatar} />

        <ProfileFields value={profile} onChange={setProfile} showPhone={false} />
        <p className="text-xs text-muted -mt-2">
          En tu perfil público solo se verá tu nombre y la inicial del apellido.
        </p>

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
            placeholder="Horarios, mascotas, cuándo te quieres mudar…"
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
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            className={inputCls}
          />
          <p className="text-xs text-muted mt-1">
            🔒 No es público. Solo lo verán los dueños a quienes tú respondas o te postules.
          </p>
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
