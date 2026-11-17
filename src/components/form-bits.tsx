"use client";

import { useEffect, useMemo, useState } from "react";
import { Camera, Check, Copy, User } from "lucide-react";
import Link from "next/link";
import {
  GENDER_LABELS,
  OCCUPATION_LABELS,
  STAY_OPTIONS,
} from "@/lib/types";
import { MyProfile } from "@/lib/local";
import { WhatsAppIcon } from "./ui";

export const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-base sm:text-sm bg-white text-ink placeholder-muted/60 " +
  "focus:outline-none focus:ring-2 focus:ring-primary/30 mt-1";

export function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Record<T, string> | [T, string][];
  value: T | "" | T[];
  onChange: (v: T) => void;
}) {
  const entries = Array.isArray(options) ? options : (Object.entries(options) as [T, string][]);
  const isOn = (k: T) => (Array.isArray(value) ? value.includes(k) : value === k);
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {entries.map(([k, label]) => (
        <button
          key={k}
          type="button"
          onClick={() => onChange(k)}
          className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
            isOn(k)
              ? "bg-primary/5 border-primary/40 text-primary font-medium"
              : "border-gray-200 text-ink/60 hover:border-gray-300"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function AvatarPicker({
  file,
  existingUrl,
  onChange,
}: {
  file: File | null;
  existingUrl?: string | null;
  onChange: (f: File | null) => void;
}) {
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);
  const src = preview || existingUrl;
  return (
    <div className="flex items-center gap-4">
      <label className="relative w-20 h-20 rounded-full overflow-hidden bg-rumi-soft border-2 border-dashed border-primary/30 flex items-center justify-center cursor-pointer shrink-0">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="w-full h-full object-cover" />
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
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
      <div>
        <p className="text-sm font-medium text-ink">Foto de perfil</p>
        <p className="text-xs text-muted">
          Los perfiles con foto reciben más respuestas. Que se vea tu cara.
        </p>
      </div>
    </div>
  );
}

export type ProfileState = Pick<
  MyProfile,
  "name" | "last_name" | "age" | "gender" | "occupation_type" | "occupation" | "smoker" | "stay_months" | "phone"
>;

export const emptyProfile: ProfileState = {
  name: "",
  last_name: "",
  age: "",
  gender: "",
  occupation_type: "",
  occupation: "",
  smoker: "",
  stay_months: "",
  phone: "",
};

/** Campos del perfil de quien busca (se usan en "Busco" y en "Postularme") */
export function ProfileFields({
  value,
  onChange,
  showPhone = true,
}: {
  value: ProfileState;
  onChange: (v: ProfileState) => void;
  showPhone?: boolean;
}) {
  const set = (k: keyof ProfileState, v: string) => onChange({ ...value, [k]: v });
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-ink">Nombre</label>
          <input
            type="text"
            required
            autoComplete="given-name"
            placeholder="María"
            value={value.name}
            onChange={(e) => set("name", e.target.value)}
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
            value={value.last_name}
            onChange={(e) => set("last_name", e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-ink">Edad</label>
        <input
          type="number"
          inputMode="numeric"
          required
          min={18}
          max={99}
          placeholder="24"
          value={value.age}
          onChange={(e) => set("age", e.target.value)}
          className={inputCls + " max-w-[8rem]"}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-ink">Género</label>
        <Chips options={GENDER_LABELS} value={value.gender as never} onChange={(v) => set("gender", v)} />
      </div>

      <div>
        <label className="text-sm font-medium text-ink">Ocupación</label>
        <Chips
          options={OCCUPATION_LABELS}
          value={value.occupation_type as never}
          onChange={(v) => set("occupation_type", v)}
        />
        {value.occupation_type && (
          <input
            type="text"
            placeholder={
              value.occupation_type === "estudiante"
                ? "¿Qué y dónde estudias? (opcional)"
                : value.occupation_type === "trabajador"
                ? "¿En qué trabajas? (opcional)"
                : "Cuéntanos (opcional)"
            }
            value={value.occupation}
            onChange={(e) => set("occupation", e.target.value)}
            className={inputCls + " mt-2"}
          />
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-ink">¿Fumas?</label>
        <Chips
          options={[
            ["no", "No"],
            ["si", "Sí"],
          ]}
          value={value.smoker as never}
          onChange={(v) => set("smoker", v)}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-ink">¿Por cuánto tiempo quieres alquilar?</label>
        <Chips
          options={STAY_OPTIONS.map((o) => [String(o.v), o.label] as [string, string])}
          value={value.stay_months}
          onChange={(v) => set("stay_months", v)}
        />
      </div>

      {showPhone && (
        <div>
          <label className="text-sm font-medium text-ink">WhatsApp (con código de país)</label>
          <input
            type="tel"
            required
            placeholder="+584141234567"
            value={value.phone}
            onChange={(e) => set("phone", e.target.value)}
            className={inputCls}
          />
          <p className="text-xs text-muted mt-1">
            🔒 No es público. Solo lo ve quien tú elijas.
          </p>
        </div>
      )}
    </>
  );
}

export function missingProfileChoice(p: ProfileState): string {
  if (!p.gender) return "Selecciona tu género.";
  if (!p.occupation_type) return "Selecciona si trabajas, estudias u otro.";
  if (!p.smoker) return "Indica si fumas.";
  if (!p.stay_months) return "Indica por cuánto tiempo quieres alquilar.";
  return "";
}

/**
 * Pantalla de éxito con el link privado del panel.
 * Sin login, este link ES la cuenta: hay que guardarlo.
 */
export function PrivateLinkCard({
  url,
  title,
  description,
  phone,
}: {
  url: string;
  title: string;
  description: string;
  phone?: string;
}) {
  const [copied, setCopied] = useState(false);
  const waText = encodeURIComponent(`Mi panel privado de Rumi (no lo compartas): ${url}`);
  const waUrl = phone
    ? `https://wa.me/${phone.replace(/\D/g, "")}?text=${waText}`
    : `https://wa.me/?text=${waText}`;

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-5 text-center">
      <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center mx-auto">
        <Check size={28} className="text-primary" />
      </div>
      <h1 className="text-xl font-bold text-ink">{title}</h1>
      <p className="text-muted text-sm">{description}</p>

      <div className="text-left bg-rumi-soft border border-primary/20 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-ink">🔑 Tu link privado</p>
        <p className="text-xs text-muted">
          Aquí verás las solicitudes. Guárdalo: es la única forma de entrar a tu panel.
        </p>
        <p className="text-xs font-mono break-all bg-white rounded-lg px-3 py-2 border border-gray-200">
          {url}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 bg-whatsapp text-white text-sm font-medium rounded-lg"
          >
            <WhatsAppIcon />
            Enviármelo
          </a>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(url).then(() => setCopied(true));
            }}
            className="flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 bg-white text-ink text-sm font-medium rounded-lg"
          >
            <Copy size={15} />
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
      </div>

      <Link
        href={url.replace(/^https?:\/\/[^/]+/, "")}
        className="inline-block text-sm font-medium text-primary hover:underline"
      >
        Ir a mi panel →
      </Link>
    </div>
  );
}
