"use client";

import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { createRoom, uploadRoomPhoto } from "@/lib/queries";

const MAX_PHOTOS = 5;
const CITIES = ["Caracas", "Valencia", "Maracaibo", "Barquisimeto", "Lechería", "Mérida", "Margarita"];

export default function PublicarPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    location_city: "",
    location_zone: "",
    room_type: "privada",
    gender_pref: "cualquiera",
    phone: "",
    has_planta: false,
    has_agua: false,
    has_wifi: false,
    has_ac: false,
    accepts_crypto: false,
    owner_direct: false,
    includes_services: false,
  });

  function inputCls(hasError = false) {
    return (
      "w-full border rounded-lg px-3 py-2.5 text-sm bg-white text-ink placeholder-muted/60 " +
      "focus:outline-none focus:ring-2 mt-1 " +
      (hasError
        ? "border-red-300 focus:ring-red-200"
        : "border-gray-200 focus:ring-primary/30")
    );
  }

  function update(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const photoUrls = await Promise.all(photos.map(uploadRoomPhoto));
      await createRoom({
        ...form,
        price: Number(form.price),
        currency: "USD",
        room_type: form.room_type as "privada" | "compartida",
        gender_pref: form.gender_pref as "cualquiera" | "solo_mujeres" | "solo_hombres",
        available_from: null,
        photos: photoUrls,
      });
      setSubmitted(true);
    } catch {
      setError("No se pudo publicar. Revisa tu conexión e intenta de nuevo.");
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
        <h1 className="text-xl font-bold text-ink">Habitación publicada</h1>
        <p className="text-muted text-sm">
          Tu anuncio está activo. Las personas interesadas te contactarán
          directamente por WhatsApp.
        </p>
        <Link
          href="/"
          className="inline-block text-sm font-medium text-primary hover:underline"
        >
          Volver al inicio
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
        <h1 className="text-2xl font-bold text-ink">Publicar habitación</h1>
        <p className="text-sm text-muted mt-1">
          Gratis. Las personas te contactarán por WhatsApp.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="text-sm font-medium text-ink">
            Título del anuncio
          </label>
          <input
            type="text"
            required
            placeholder="Ej: Habitación amueblada en Chacao"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className={inputCls()}
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-ink">Descripción</label>
          <textarea
            required
            rows={4}
            placeholder="Describe la habitación, el apartamento, las reglas, etc."
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className={inputCls() + " resize-none"}
          />
        </div>

        {/* Price + City */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-ink">Precio/mes (USD)</label>
            <input
              type="number"
              required
              placeholder="150"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              className={inputCls()}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Ciudad</label>
            <select
              required
              value={form.location_city}
              onChange={(e) => update("location_city", e.target.value)}
              className={inputCls()}
            >
              <option value="">Seleccionar</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Zone */}
        <div>
          <label className="text-sm font-medium text-ink">
            Zona / Urbanización
          </label>
          <input
            type="text"
            required
            placeholder="Ej: Chacao, Los Palos Grandes"
            value={form.location_zone}
            onChange={(e) => update("location_zone", e.target.value)}
            className={inputCls()}
          />
        </div>

        {/* Room type + gender */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-ink">Tipo</label>
            <select
              value={form.room_type}
              onChange={(e) => update("room_type", e.target.value)}
              className={inputCls()}
            >
              <option value="privada">Privada</option>
              <option value="compartida">Compartida</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Preferencia</label>
            <select
              value={form.gender_pref}
              onChange={(e) => update("gender_pref", e.target.value)}
              className={inputCls()}
            >
              <option value="cualquiera">Cualquiera</option>
              <option value="solo_mujeres">Solo mujeres</option>
              <option value="solo_hombres">Solo hombres</option>
            </select>
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="text-sm font-medium text-ink">
            WhatsApp (con código de país)
          </label>
          <input
            type="tel"
            required
            placeholder="+584141234567"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={inputCls()}
          />
        </div>

        {/* Service toggles */}
        <div>
          <label className="text-sm font-medium text-ink mb-2 block">
            Servicios y características
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "has_planta", label: "Planta eléctrica" },
              { key: "has_agua", label: "Agua 24h" },
              { key: "has_wifi", label: "WiFi incluido" },
              { key: "has_ac", label: "Aire acondicionado" },
              { key: "accepts_crypto", label: "Acepta crypto" },
              { key: "owner_direct", label: "Soy el dueño" },
              { key: "includes_services", label: "Servicios incluidos" },
            ].map(({ key, label }) => (
              <label
                key={key}
                className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                  form[key as keyof typeof form]
                    ? "bg-primary/5 border-primary/30 text-primary"
                    : "border-gray-200 text-ink/60 hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={form[key as keyof typeof form] as boolean}
                  onChange={(e) => update(key, e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    form[key as keyof typeof form]
                      ? "bg-primary border-primary"
                      : "border-gray-300"
                  }`}
                >
                  {form[key as keyof typeof form] && (
                    <Check size={10} className="text-white" />
                  )}
                </div>
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Photos */}
        <div>
          <label className="text-sm font-medium text-ink">
            Fotos (opcional, máx. {MAX_PHOTOS})
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            multiple
            onChange={(e) =>
              setPhotos(Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS))
            }
            className={inputCls()}
          />
          {photos.length > 0 && (
            <p className="text-xs text-muted mt-1">
              {photos.length} foto{photos.length !== 1 && "s"} seleccionada
              {photos.length !== 1 && "s"}
            </p>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors disabled:opacity-60"
        >
          {submitting ? "Publicando..." : "Publicar gratis"}
        </button>
      </form>
    </div>
  );
}
